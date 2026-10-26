#!/usr/bin/env python3
"""Builds the data of the nightly dashboard from the GitHub Actions runs of the nightly workflows.

Inputs : the Actions API of the repository (runs, jobs and JUnit artifacts) and the history published earlier.
Outputs: <out>/latest.json and <out>/history.json, see schema.md.

Only the standard library is used so the script runs on a plain runner.
"""
import argparse
import datetime as dt
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile

SCHEMA_VERSION = 1
HERE = os.path.dirname(os.path.abspath(__file__))
API = "https://api.github.com"

# statuses of a single test
PASSED, FAILED, SKIPPED, ERROR = "passed", "failed", "skipped", "error"
# statuses of a workflow run and of a build
RUN_STATES = ("passed", "failed", "cancelled", "skipped", "in_progress", "not_run")
# steps preparing the environment, a failure in one of them is an infrastructure problem and not a failed test
INFRA_STEP_HINTS = re.compile(r"^(installing prerequisites|litmus infra setup|deploy app|create |authenticate|configure |set up|start minikube|install litmus|wait for|add litmus|extract |checkout|run actions/|download |upload )", re.I)


class ReportError(Exception):
    pass


# --------------------------------------------------------------------------------------- time helpers

def parse_time(value):
    if not value:
        return None
    return dt.datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=dt.timezone.utc)


def iso(value):
    return value.strftime("%Y-%m-%dT%H:%M:%SZ") if value else None


def cycle_id(created_at, start_hour):
    """A nightly cycle is the 24h window starting at start_hour UTC. The workflows are scheduled at different
    hours of the night, so they are grouped by the window they started in and the cycle is named after its start day."""
    return (created_at - dt.timedelta(hours=start_hour)).date().isoformat()


# --------------------------------------------------------------------------------------- GitHub client

class GitHub:
    def __init__(self, repo, token=None):
        self.repo = repo
        self.token = token

    def _request(self, url, follow=True):
        headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "litmus-e2e-report"}
        if self.token:
            headers["Authorization"] = "Bearer " + self.token
        return urllib.request.Request(url, headers=headers)

    def get(self, path, **params):
        url = API + path + ("?" + urllib.parse.urlencode(params) if params else "")
        last = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(self._request(url), timeout=60) as resp:
                    return json.load(resp)
            except urllib.error.HTTPError as err:
                last = err.code
                if err.code < 500 and err.code != 429:
                    break
            except (urllib.error.URLError, TimeoutError) as err:
                last = str(err)
            time.sleep(2 ** attempt)
        raise ReportError("GET %s failed: %s" % (path, last))

    def download(self, url):
        """Downloads an artifact. The API answers with a redirect to a signed storage url, the token must not be
        forwarded to it."""
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args, **kwargs):
                return None
        opener = urllib.request.build_opener(NoRedirect)
        try:
            with opener.open(self._request(url), timeout=120) as resp:
                return resp.read()
        except urllib.error.HTTPError as err:
            if err.code in (301, 302, 303, 307, 308):
                with urllib.request.urlopen(urllib.request.Request(err.headers["Location"], headers={"User-Agent": "litmus-e2e-report"}), timeout=120) as resp:
                    return resp.read()
            raise ReportError("download %s failed: %s" % (url, err.code))

    def default_branch(self):
        return self.get("/repos/%s" % self.repo)["default_branch"]

    def runs(self, workflow_file, since):
        found, page = [], 1
        while True:
            data = self.get("/repos/%s/actions/workflows/%s/runs" % (self.repo, workflow_file),
                            per_page=100, page=page, created=">=" + since.strftime("%Y-%m-%d"))
            found.extend(data.get("workflow_runs", []))
            if len(data.get("workflow_runs", [])) < 100:
                return found
            page += 1

    def jobs(self, run_id):
        return self.get("/repos/%s/actions/runs/%s/jobs" % (self.repo, run_id), per_page=100, filter="latest").get("jobs", [])

    def artifacts(self, run_id):
        return self.get("/repos/%s/actions/runs/%s/artifacts" % (self.repo, run_id), per_page=100).get("artifacts", [])


# --------------------------------------------------------------------------------------- JUnit parsing

def _truncate(text, limit):
    text = re.sub(r"\x1b\[[0-9;]*m", "", text or "").strip()
    text = re.sub(r"\s+\n", "\n", text)
    return text if len(text) <= limit else text[: limit - 1] + "…"


def parse_junit(xml_bytes, limit=600):
    """Returns (cases, source_file) of a JUnit document. Every case is a dict with name, group, status, durationSec, message."""
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as err:
        raise ReportError("invalid JUnit file: %s" % err)
    suites = [root] if root.tag == "testsuite" else list(root.iter("testsuite"))
    cases, source = [], None
    for suite in suites:
        if suite.get("file") and not source:
            source = suite.get("file")
        for case in suite.findall("testcase"):
            failure = case.find("failure")
            error = case.find("error")
            skipped = case.find("skipped")
            if failure is not None:
                status, node = FAILED, failure
            elif error is not None:
                status, node = ERROR, error
            elif skipped is not None:
                status, node = SKIPPED, skipped
            else:
                status, node = PASSED, None
            message = ""
            if node is not None:
                message = node.get("message") or node.text or ""
                if status == FAILED and node.text and node.text.strip() not in message:
                    message = node.text
            cases.append({
                "name": case.get("name") or "(unnamed)",
                "classname": case.get("classname") or suite.get("name") or "",
                "suiteName": suite.get("name") or "",
                "status": status,
                "durationSec": round(float(case.get("time") or 0), 3),
                "message": _truncate(message, limit),
            })
    return cases, source


def read_junit_zip(blob, limit):
    cases = []
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        for name in sorted(archive.namelist()):
            if not name.endswith(".xml"):
                continue
            parsed, source = parse_junit(archive.read(name), limit)
            for case in parsed:
                case["file"] = source or name
            cases.extend(parsed)
    return cases


# --------------------------------------------------------------------------------------- repository catalogue

def load_catalog(root, config, workflows_dir=None):
    """The tests defined in the repository, the make target running them and the nightly workflow scheduling them."""
    catalog = {}
    makefile = os.path.join(root, "Makefile")
    target_to_stem = {}
    if os.path.exists(makefile):
        with open(makefile, encoding="utf-8") as fh:
            text = fh.read()
        for match in re.finditer(r"^ ?([A-Za-z0-9_-]+):\s*\n((?:\t.*\n|\n)*)", text, re.M):
            run = re.search(r"go test (\S+?)_test\.go", match.group(2))
            if run:
                target_to_stem[match.group(1)] = os.path.basename(run.group(1))
    for sub in ("tests", "components", "platform"):
        base = os.path.join(root, sub)
        for dirpath, _, files in os.walk(base):
            for name in sorted(files):
                if name.endswith("_test.go"):
                    stem = name[: -len("_test.go")]
                    catalog[stem] = {"id": stem, "path": os.path.relpath(os.path.join(dirpath, name), root),
                                     "kind": "setup" if stem in config["setupTests"] else "experiment", "workflows": []}
    wf_dir = workflows_dir or os.path.join(root, ".github", "workflows")
    for wf in config["workflows"]:
        path = os.path.join(wf_dir, wf["file"])
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as fh:
            targets = re.findall(r"run:\s*make ([A-Za-z0-9_-]+)", fh.read())
        for target in targets:
            stem = target_to_stem.get(target)
            if stem in catalog and wf["category"] not in catalog[stem]["workflows"]:
                catalog[stem]["workflows"].append(wf["category"])
    return catalog


# --------------------------------------------------------------------------------------- one workflow run

def job_summary(job):
    failed = [s for s in job.get("steps", []) if s.get("conclusion") == "failure"]
    started, completed = parse_time(job.get("started_at")), parse_time(job.get("completed_at"))
    first = failed[0]["name"] if failed else None
    return {
        "name": job["name"],
        "conclusion": job.get("conclusion") or job.get("status"),
        "durationSec": int((completed - started).total_seconds()) if started and completed else None,
        "url": job.get("html_url"),
        "firstFailedStep": first,
        "failedSteps": [s["name"] for s in failed],
    }


def run_status(run):
    if run is None:
        return "not_run"
    if run.get("status") != "completed":
        return "in_progress"
    return {"success": "passed", "failure": "failed", "cancelled": "cancelled", "skipped": "skipped",
            "timed_out": "failed", "startup_failure": "failed", "action_required": "failed", "neutral": "passed"}.get(run.get("conclusion"), "failed")


def build_workflow_record(wf, run, jobs, junit_cases, catalog, config):
    status = run_status(run)
    record = {
        "id": wf["category"], "name": wf["name"], "suite": wf["suite"], "category": wf["category"], "required": wf["required"],
        "note": wf.get("note"), "status": status, "runId": run["id"] if run else None, "runUrl": run["html_url"] if run else None,
        "trigger": run["event"] if run else None, "startedAt": iso(parse_time(run["run_started_at"])) if run and run.get("run_started_at") else None,
        "durationSec": None, "jobs": [], "counts": {PASSED: 0, FAILED: 0, SKIPPED: 0, ERROR: 0}, "resultsSource": "none", "failureKind": None,
    }
    tests = []
    if run is None:
        return record, tests
    started, updated = parse_time(run.get("run_started_at") or run.get("created_at")), parse_time(run.get("updated_at"))
    if status != "in_progress" and started and updated:
        record["durationSec"] = int((updated - started).total_seconds())
    record["jobs"] = [job_summary(j) for j in jobs]

    suite = wf["suite"]
    if junit_cases:
        record["resultsSource"] = "junit"
        for case in junit_cases:
            group = _group_of(case, suite)
            kind = "setup" if (suite == "bdd" and catalog.get(group, {}).get("kind") == "setup") else "test"
            tid = "%s/%s/%s" % (suite, group, case["name"])
            if kind == "setup" and case.get("job"):
                # setup runs in every job, the job keeps the ids unique
                tid += "@" + case["job"]
            tests.append({"id": tid, "suite": suite, "workflow": wf["category"], "group": group, "name": case["name"], "kind": kind, "job": case.get("job"),
                          "status": case["status"], "durationSec": case["durationSec"], "message": case["message"],
                          "source": "junit", "url": run["html_url"]})

    # jobs which did not produce any result are reported as one result of their own, a job that failed before the tests
    # started must not look like a run without failures
    covered = bool(junit_cases)
    for job in (record["jobs"] if status != "in_progress" else []):
        conclusion = job["conclusion"]
        if conclusion == "success" and covered:
            continue
        if conclusion == "success":
            status_j = PASSED
        elif conclusion in ("failure", "timed_out", "startup_failure", "action_required"):
            status_j = ERROR
        else:
            # skipped, cancelled or not finished: the tests of the job did not run
            status_j = SKIPPED
        if conclusion == "failure" and covered and job["failedSteps"] and not _is_infra_step(job["firstFailedStep"]):
            continue  # the failure is reported by the failed tests of the job
        msg = ""
        if status_j == ERROR:
            msg = "Job failed at step '%s'" % job["firstFailedStep"] if job["firstFailedStep"] else "Job %s" % conclusion
        elif status_j == SKIPPED:
            msg = "Job %s, its tests did not run" % conclusion
        tests.append({"id": "%s/%s/job:%s" % (suite, wf["category"], job["name"]), "suite": suite, "workflow": wf["category"], "group": wf["category"],
                      "name": "job: " + job["name"], "kind": "job", "status": status_j, "durationSec": job["durationSec"] or 0,
                      "message": msg, "source": "job", "job": job["name"], "url": job["url"]})
    if not junit_cases and record["jobs"]:
        record["resultsSource"] = "jobs"
    seen = {}
    for t in tests:
        seen[t["id"]] = seen.get(t["id"], 0) + 1
    for t in tests:
        # the same test in several jobs of a workflow is told apart by the job
        if seen[t["id"]] > 1 and t.get("job"):
            t["id"] += "@" + t["job"]
    for t in tests:
        # a passing setup or teardown step (install, deploy, cleanup) is not a test result
        if t["kind"] != "setup" or t["status"] != PASSED:
            record["counts"][t["status"]] += 1

    # classify the failure of the run
    if status == "failed":
        test_failures = [t for t in tests if t["status"] == FAILED]
        infra = [j for j in record["jobs"] if j["conclusion"] == "failure" and _is_infra_step(j["firstFailedStep"])]
        record["failureKind"] = "tests" if test_failures else ("infrastructure" if infra or not junit_cases else "tests")
    return record, tests


def _is_infra_step(step_name):
    return bool(step_name and INFRA_STEP_HINTS.search(step_name))


def _group_of(case, suite):
    if suite == "frontend":
        path = case.get("file") or ""
        match = re.search(r"e2e/(.+?)\.cy\.[jt]s", path)
        return match.group(1) if match else (case.get("suiteName") or "chaoscenter")
    return case.get("classname") or case.get("suiteName") or "unknown"


# --------------------------------------------------------------------------------------- build assembly

def collect_cycles(client, config, since, default_branch, only_cycles=None):
    """Returns {cycle: {workflow category: (run, jobs, junit cases)}} for the runs on the default branch."""
    start_hour = config["cycleStartHourUtc"]
    prefixes = tuple(config["junitArtifactPrefixes"])
    limit = config["messageMaxLength"]
    cycles = {}
    for wf in config["workflows"]:
        runs = []
        # the runs of the reusable workflow behind a nightly workflow count as runs of it
        for name in [wf["file"]] + wf.get("alsoFiles", []):
            try:
                runs.extend(client.runs(name, since))
            except ReportError as err:
                print("warning: %s" % err, file=sys.stderr)
        by_cycle = {}
        for run in runs:
            if run.get("head_branch") != default_branch or run.get("event") not in ("schedule", "workflow_dispatch"):
                continue
            cyc = cycle_id(parse_time(run["created_at"]), start_hour)
            if only_cycles is not None and cyc not in only_cycles:
                continue
            best = by_cycle.get(cyc)
            # the newest finished run represents the cycle. A run that is still going (a rerun, for example)
            # does not hide the result of the finished one, it only represents the cycle when nothing finished.
            if best is None or (run.get("status") == "completed", run["created_at"]) > (best.get("status") == "completed", best["created_at"]):
                by_cycle[cyc] = run
        for cyc, run in by_cycle.items():
            jobs, cases = [], []
            try:
                jobs = client.jobs(run["id"])
                if run.get("status") == "completed":
                    for art in client.artifacts(run["id"]):
                        if art["name"].startswith(prefixes) and not art.get("expired"):
                            try:
                                job_name = art["name"][len(prefixes[0]):] if art["name"].startswith(prefixes[0]) else None
                                for case in read_junit_zip(client.download(art["archive_download_url"]), limit):
                                    case["job"] = job_name
                                    cases.append(case)
                            except (ReportError, zipfile.BadZipFile) as err:
                                print("warning: artifact %s of run %s skipped: %s" % (art["name"], run["id"], err), file=sys.stderr)
            except ReportError as err:
                print("warning: %s" % err, file=sys.stderr)
            cycles.setdefault(cyc, {})[wf["category"]] = (run, jobs, cases)
    return cycles


def summarize_counts(records, suite=None, required=None):
    counts = {PASSED: 0, FAILED: 0, SKIPPED: 0, ERROR: 0}
    for r in records:
        if suite and r["suite"] != suite:
            continue
        if required is not None and r["required"] != required:
            continue
        for k in counts:
            counts[k] += r["counts"][k]
    counts["total"] = sum(counts.values())
    executed = counts[PASSED] + counts[FAILED] + counts[ERROR]
    counts["passRate"] = round(100.0 * counts[PASSED] / executed, 1) if executed else None
    return counts


def overall_status(records, config):
    """passed only when every required workflow ran and passed. A required workflow which did not run or did not finish
    makes the build incomplete, it is never counted as passing."""
    required = [r for r in records if r["required"]]
    if any(r["status"] == "failed" for r in required):
        return "failed"
    if any(r["status"] != "passed" for r in required):
        return "incomplete"
    return "passed"


def suite_status(records, suite):
    required = [r for r in records if r["suite"] == suite and r["required"]]
    if not required:
        return "incomplete"
    if any(r["status"] == "failed" for r in required):
        return "failed"
    if any(r["status"] != "passed" for r in required):
        return "incomplete"
    return "passed"


def build_entry(cycle, items, config, catalog):
    """One build of the history and the tests of its runs."""
    by_cat = {wf["category"]: wf for wf in config["workflows"]}
    records, tests = [], []
    for wf in config["workflows"]:
        run, jobs, cases = items.get(wf["category"], (None, [], []))
        rec, tst = build_workflow_record(wf, run, jobs, cases, catalog, config)
        records.append(rec)
        tests.extend(tst)
    started = [parse_time(r["startedAt"]) for r in records if r["startedAt"]]
    ended = [parse_time(r["startedAt"]) + dt.timedelta(seconds=r["durationSec"]) for r in records if r["startedAt"] and r["durationSec"] is not None]
    build = {
        "id": cycle,
        "status": overall_status(records, config),
        "startedAt": iso(min(started)) if started else None,
        "finishedAt": iso(max(ended)) if ended else None,
        "durationSec": int((max(ended) - min(started)).total_seconds()) if started and ended else None,
        "suites": {s["id"]: {"status": suite_status(records, s["id"]), "counts": summarize_counts(records, s["id"], True),
                            "optionalCounts": summarize_counts(records, s["id"], False)} for s in config["suites"]},
        "workflows": records,
    }
    return build, tests


def history_entry(build, tests):
    """The compact form of a build kept in the history."""
    return {
        "id": build["id"], "status": build["status"], "startedAt": build["startedAt"], "durationSec": build["durationSec"],
        "suites": build["suites"],
        "workflows": {w["id"]: {"status": w["status"], "runId": w["runId"], "runUrl": w["runUrl"], "durationSec": w["durationSec"],
                                 "counts": w["counts"], "failureKind": w["failureKind"]} for w in build["workflows"]},
        "results": {t["id"]: t["status"][0] for t in tests if t["kind"] != "setup" or t["status"] != PASSED},
    }


def merge_history(previous_builds, fresh_entries, keep):
    merged = {b["id"]: b for b in previous_builds}
    merged.update(fresh_entries)
    ordered = [merged[k] for k in sorted(merged)]
    return ordered[-keep:]


def derive_metrics(builds, latest_tests, config):
    """Metrics derived from the history, every value can be recomputed from history.json."""
    metrics = {"flakyTests": [], "recurringFailures": [], "newlyFailing": [], "recovered": [], "durationChange": None, "buildsConsidered": len(builds)}
    if not builds:
        return metrics
    latest = builds[-1]
    prev = builds[-2] if len(builds) > 1 else None
    window = builds[-14:]
    letters = {}
    for b in window:
        for tid, st in b.get("results", {}).items():
            letters.setdefault(tid, {})[b["id"]] = st
    for tid, per_build in letters.items():
        seq = [per_build.get(b["id"]) for b in window]
        seen = [s for s in seq if s]
        if len(seen) >= 4 and ("p" in seen) and ("f" in seen or "e" in seen):
            flips = sum(1 for a, b2 in zip(seen, seen[1:]) if (a == "p") != (b2 == "p"))
            if flips >= 2:
                metrics["flakyTests"].append({"id": tid, "flips": flips, "runs": len(seen), "failedRuns": sum(1 for s in seen if s in "fe")})
        streak = 0
        for b in reversed(window):
            st = per_build.get(b["id"])
            if st in ("f", "e"):
                streak += 1
            elif st is None:
                continue
            else:
                break
        if streak >= 2:
            metrics["recurringFailures"].append({"id": tid, "consecutiveBuilds": streak})
    if prev:
        for tid, st in latest.get("results", {}).items():
            before = prev.get("results", {}).get(tid)
            if st in ("f", "e") and before == "p":
                metrics["newlyFailing"].append(tid)
        for tid, before in prev.get("results", {}).items():
            if before in ("f", "e") and latest.get("results", {}).get(tid) == "p":
                metrics["recovered"].append(tid)
        if latest.get("durationSec") and prev.get("durationSec"):
            metrics["durationChange"] = {"previousSec": prev["durationSec"], "latestSec": latest["durationSec"],
                                         "percent": round(100.0 * (latest["durationSec"] - prev["durationSec"]) / prev["durationSec"], 1)}
    metrics["flakyTests"].sort(key=lambda m: -m["flips"])
    metrics["recurringFailures"].sort(key=lambda m: -m["consecutiveBuilds"])
    slow = sorted((t for t in latest_tests if t["durationSec"]), key=lambda t: -t["durationSec"])[:10]
    metrics["longestTests"] = [{"id": t["id"], "name": t["name"], "durationSec": t["durationSec"], "suite": t["suite"]} for t in slow]
    return metrics


def coverage(catalog, latest_tests, config):
    executed = sorted({t["group"] for t in latest_tests if t["suite"] == "bdd" and t["kind"] == "test" and t["group"] in catalog})
    defined = sorted(k for k, v in catalog.items() if v["kind"] == "experiment")
    scheduled = sorted(k for k, v in catalog.items() if v["kind"] == "experiment" and v["workflows"])
    return {
        "defined": defined, "scheduled": scheduled, "executed": executed,
        "notScheduled": sorted(set(defined) - set(scheduled)),
        "scheduledNotExecuted": sorted(set(scheduled) - set(executed)),
        "executedPercent": round(100.0 * len(executed) / len(scheduled), 1) if scheduled else None,
        "byCategory": {cat: sorted(k for k, v in catalog.items() if v["kind"] == "experiment" and cat in v["workflows"]) for cat in sorted({c for v in catalog.values() if v["kind"] == "experiment" for c in v["workflows"]})},
        "catalog": {k: {"path": v["path"], "kind": v["kind"], "workflows": v["workflows"]} for k, v in sorted(catalog.items())},
    }


def assemble(repo, config, cycles, previous, catalog, now):
    ids = sorted(cycles)
    fresh, fresh_tests = {}, {}
    builds_full = {}
    for cyc in ids:
        build, tests = build_entry(cyc, cycles[cyc], config, catalog)
        builds_full[cyc] = (build, tests)
        fresh[cyc] = history_entry(build, tests)
    history = merge_history(previous.get("builds", []), fresh, config["maxBuildsKept"])
    latest_id = history[-1]["id"] if history else None
    latest = None
    if latest_id in builds_full:
        build, tests = builds_full[latest_id]
    elif latest_id:
        build, tests = None, []
    else:
        build, tests = None, []
    result = {"schemaVersion": SCHEMA_VERSION, "generatedAt": iso(now), "repository": repo,
              "config": {"suites": config["suites"], "workflows": [{k: w.get(k) for k in ("category", "name", "suite", "required", "note")} for w in config["workflows"]],
                         "staleAfterHours": config["staleAfterHours"]}}
    if build:
        started = parse_time(build["startedAt"]) if build["startedAt"] else None
        age = (now - started).total_seconds() / 3600 if started else None
        build = dict(build)
        build["ageHours"] = round(age, 1) if age is not None else None
        build["stale"] = age is None or age > config["staleAfterHours"]
        result["build"] = build
        result["tests"] = tests
        result["coverage"] = coverage(catalog, tests, config)
    else:
        result["build"] = None
        result["tests"] = []
        result["coverage"] = coverage(catalog, [], config)
    result["metrics"] = derive_metrics(history, result["tests"], config)
    hist = {"schemaVersion": SCHEMA_VERSION, "generatedAt": iso(now), "repository": repo, "builds": history}
    return result, hist


# --------------------------------------------------------------------------------------- validation

def validate(latest, history):
    """Checks the generated files against the contract of schema.md, raises ReportError listing every violation."""
    problems = []

    def need(obj, key, types, where):
        if key not in obj:
            problems.append("%s: missing '%s'" % (where, key))
            return None
        if not isinstance(obj[key], types):
            problems.append("%s: '%s' has type %s" % (where, key, type(obj[key]).__name__))
            return None
        return obj[key]

    for name, doc in (("latest", latest), ("history", history)):
        if need(doc, "schemaVersion", int, name) not in (None, SCHEMA_VERSION):
            problems.append("%s: unsupported schemaVersion" % name)
        need(doc, "generatedAt", str, name)
        need(doc, "repository", str, name)
    build = latest.get("build")
    if build is not None:
        if build.get("status") not in ("passed", "failed", "incomplete"):
            problems.append("latest.build: invalid status %r" % build.get("status"))
        for w in build.get("workflows", []):
            if w.get("status") not in RUN_STATES:
                problems.append("latest.build.workflows[%s]: invalid status %r" % (w.get("id"), w.get("status")))
            for k in (PASSED, FAILED, SKIPPED, ERROR):
                if not isinstance(w.get("counts", {}).get(k), int):
                    problems.append("latest.build.workflows[%s]: counts.%s" % (w.get("id"), k))
    for t in latest.get("tests", []):
        if t.get("status") not in (PASSED, FAILED, SKIPPED, ERROR):
            problems.append("latest.tests[%s]: invalid status %r" % (t.get("id"), t.get("status")))
    seen = set()
    for t in latest.get("tests", []):
        if t["id"] in seen:
            problems.append("latest.tests: duplicate id %s" % t["id"])
        seen.add(t["id"])
    ids = [b.get("id") for b in history.get("builds", [])]
    if ids != sorted(set(ids)):
        problems.append("history.builds: ids must be unique and ordered")
    if problems:
        raise ReportError("generated data violates the schema:\n  " + "\n  ".join(problems))


# --------------------------------------------------------------------------------------- previous history

def load_previous(path_or_url):
    if not path_or_url:
        return {"builds": []}
    try:
        if re.match(r"^https?://", path_or_url):
            req = urllib.request.Request(path_or_url, headers={"User-Agent": "litmus-e2e-report"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.load(resp)
        else:
            with open(path_or_url, encoding="utf-8") as fh:
                data = json.load(fh)
    except (urllib.error.URLError, OSError, ValueError) as err:
        print("note: no previous history (%s), starting a new one" % err, file=sys.stderr)
        return {"builds": []}
    if data.get("schemaVersion") != SCHEMA_VERSION or not isinstance(data.get("builds"), list):
        print("note: previous history has another schema, starting a new one", file=sys.stderr)
        return {"builds": []}
    return data


def write_json(path, doc):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(doc, fh, indent=1, sort_keys=True, ensure_ascii=False)
        fh.write("\n")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY"), help="owner/name of the repository")
    parser.add_argument("--out", required=True, help="directory the json files are written to")
    parser.add_argument("--config", default=os.path.join(HERE, "config.json"))
    parser.add_argument("--previous", default=None, help="url or path of the history.json published earlier")
    parser.add_argument("--repo-root", default=os.path.abspath(os.path.join(HERE, "..", "..")))
    parser.add_argument("--branch", default=None, help="branch whose runs are reported, the default branch when omitted (use it to try the report on a branch)")
    parser.add_argument("--now", default=None, help="override of the current time, for reproducible runs (2006-01-02T15:04:05Z)")
    args = parser.parse_args(argv)
    if not args.repo:
        parser.error("--repo or GITHUB_REPOSITORY is required")

    with open(args.config, encoding="utf-8") as fh:
        config = json.load(fh)
    now = parse_time(args.now) if args.now else dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    client = GitHub(args.repo, os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN"))
    previous = load_previous(args.previous)
    default_branch = args.branch or client.default_branch()

    known = {b["id"] for b in previous["builds"]}
    window_start = now - dt.timedelta(days=config["backfillDays"])
    since = window_start
    # an incremental run only needs the newest cycles, the first run backfills the window
    if known:
        newest = max(known)
        since = min(window_start, parse_time(newest + "T00:00:00Z") - dt.timedelta(days=config["refetchLastCycles"]))
        since = max(since, now - dt.timedelta(days=config["backfillDays"] * 4))
    cycles = collect_cycles(client, config, since - dt.timedelta(days=1), default_branch)
    recent = set(sorted(known)[-config["refetchLastCycles"]:])
    cycles = {c: v for c, v in cycles.items() if c not in known or c in recent}
    catalog = load_catalog(args.repo_root, config)
    latest, history = assemble(args.repo, config, cycles, previous, catalog, now)
    validate(latest, history)
    write_json(os.path.join(args.out, "latest.json"), latest)
    write_json(os.path.join(args.out, "history.json"), history)
    status = latest["build"]["status"] if latest["build"] else "no data"
    print("wrote %s, %d builds in the history, latest build %s: %s" % (args.out, len(history["builds"]), latest["build"]["id"] if latest["build"] else "-", status))


if __name__ == "__main__":
    try:
        main()
    except ReportError as err:
        print("error: %s" % err, file=sys.stderr)
        sys.exit(1)
