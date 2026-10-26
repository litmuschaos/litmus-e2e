import datetime as dt
import io
import json
import os
import sys
import tempfile
import unittest
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import build_report as br  # noqa: E402

with open(os.path.join(os.path.dirname(HERE), "config.json")) as fh:
    CONFIG = json.load(fh)
CONFIG["workflows"] = [w for w in CONFIG["workflows"] if w["category"] in ("pod-level", "chaoscenter", "aws")]
CONFIG["workflows"][2]["required"] = False
CATALOG = {"pod-delete": {"id": "pod-delete", "path": "tests/pod-delete_test.go", "kind": "experiment", "workflows": ["pod-level"]},
           "app-deploy": {"id": "app-deploy", "path": "tests/app-deploy_test.go", "kind": "setup", "workflows": ["pod-level"]},
           "node-drain": {"id": "node-drain", "path": "tests/node-drain_test.go", "kind": "experiment", "workflows": []}}


def fixture(name):
    with open(os.path.join(HERE, "fixtures", name), "rb") as fh:
        return fh.read()


def run(created, conclusion="success", status="completed", event="schedule", rid=1, branch="master"):
    return {"id": rid, "created_at": created, "run_started_at": created, "updated_at": created[:-3] + "59Z", "status": status,
            "conclusion": conclusion, "event": event, "head_branch": branch, "html_url": "https://example.test/runs/%s" % rid}


def job(name, conclusion, steps=()):
    return {"name": name, "conclusion": conclusion, "status": "completed", "started_at": "2026-10-25T22:00:00Z", "completed_at": "2026-10-25T22:10:00Z",
            "html_url": "https://example.test/jobs/" + name, "steps": [{"name": n, "conclusion": c} for n, c in steps]}


class JUnitTest(unittest.TestCase):
    def test_ginkgo_statuses_and_messages(self):
        cases, _ = br.parse_junit(fixture("ginkgo-pod-delete.xml"))
        self.assertEqual([c["status"] for c in cases], ["passed", "failed", "skipped"])
        self.assertIn("pod-delete-abort-runner", cases[1]["message"])
        self.assertEqual(cases[0]["classname"], "pod-delete")

    def test_cypress_file_is_kept_for_grouping(self):
        cases, source = br.parse_junit(fixture("cypress-chaoshub.xml"))
        self.assertEqual(source, "cypress/e2e/UI/chaoshub.cy.js")
        self.assertEqual([c["status"] for c in cases], ["passed", "failed", "skipped"])

    def test_invalid_xml_is_reported(self):
        with self.assertRaises(br.ReportError):
            br.parse_junit(b"<testsuite")

    def test_message_is_truncated_and_colours_removed(self):
        self.assertEqual(br._truncate("\x1b[91mred\x1b[0m", 50), "red")
        self.assertEqual(len(br._truncate("x" * 1000, 100)), 100)


class RecordTest(unittest.TestCase):
    def wf(self, cat):
        return next(w for w in CONFIG["workflows"] if w["category"] == cat)

    def test_job_that_failed_before_the_tests_is_an_error_not_a_pass(self):
        r = run("2026-10-25T22:00:00Z", "failure")
        rec, tests = br.build_workflow_record(self.wf("pod-level"), r, [job("Pod_Delete_Test", "failure", [("Installing Prerequisites (K3S Cluster)", "failure")])], [], CATALOG, CONFIG)
        self.assertEqual(rec["status"], "failed")
        self.assertEqual(rec["failureKind"], "infrastructure")
        self.assertEqual(rec["counts"]["error"], 1)
        self.assertEqual(rec["counts"]["passed"], 0)
        self.assertIn("Installing Prerequisites", tests[0]["message"])

    def test_skipped_jobs_are_not_counted_as_passing(self):
        r = run("2026-10-25T22:00:00Z", "failure")
        rec, _ = br.build_workflow_record(self.wf("aws"), r, [job("a", "skipped")], [], CATALOG, CONFIG)
        self.assertEqual(rec["counts"], {"passed": 0, "failed": 0, "skipped": 1, "error": 0})

    def test_junit_results_and_setup_are_separated(self):
        cases, _ = br.parse_junit(fixture("ginkgo-pod-delete.xml"))
        setup, _ = br.parse_junit(fixture("ginkgo-setup.xml"))
        r = run("2026-10-25T22:00:00Z", "failure")
        rec, tests = br.build_workflow_record(self.wf("pod-level"), r, [job("Pod_Delete_Test", "failure", [("TCID-K3S-GENERIC-APP-POD-DELETE", "failure")])], cases + setup, CATALOG, CONFIG)
        self.assertEqual(rec["counts"], {"passed": 1, "failed": 1, "skipped": 1, "error": 0})
        self.assertEqual(rec["failureKind"], "tests")
        self.assertEqual(rec["resultsSource"], "junit")
        self.assertEqual({t["kind"] for t in tests}, {"test", "setup"})

    def test_frontend_group_comes_from_the_spec_path(self):
        cases, source = br.parse_junit(fixture("cypress-chaoshub.xml"))
        for c in cases:
            c["file"] = source
        rec, tests = br.build_workflow_record(self.wf("chaoscenter"), run("2026-10-25T21:00:00Z", "failure"), [job("frontend / run-litmus", "failure", [("Cypress run with env", "failure")])], cases, CATALOG, CONFIG)
        self.assertEqual({t["group"] for t in tests}, {"UI/chaoshub"})
        self.assertEqual(rec["failureKind"], "tests")

    def test_unfinished_run_does_not_count_its_jobs_as_skipped(self):
        r = run("2026-10-25T22:00:00Z", None, "in_progress")
        rec, tests = br.build_workflow_record(self.wf("pod-level"), r, [dict(job("a", None), status="in_progress", conclusion=None)], [], CATALOG, CONFIG)
        self.assertEqual((tests, rec["counts"]["skipped"]), ([], 0))

    def test_missing_run(self):
        rec, tests = br.build_workflow_record(self.wf("chaoscenter"), None, [], [], CATALOG, CONFIG)
        self.assertEqual((rec["status"], tests), ("not_run", []))

    def test_unfinished_run_is_in_progress(self):
        rec, _ = br.build_workflow_record(self.wf("pod-level"), run("2026-10-25T22:00:00Z", None, "in_progress"), [], [], CATALOG, CONFIG)
        self.assertEqual(rec["status"], "in_progress")
        self.assertIsNone(rec["durationSec"])


    def test_ids_stay_unique_when_a_job_repeats_the_setup(self):
        setup, _ = br.parse_junit(fixture("ginkgo-setup.xml"))
        cases = []
        for name in ("Job_A", "Job_B"):
            cases += [dict(c, job=name) for c in setup]
        _, tests = br.build_workflow_record(self.wf("pod-level"), run("2026-10-25T22:00:00Z"), [job("Job_A", "success"), job("Job_B", "success")], cases, CATALOG, CONFIG)
        self.assertEqual(len({t["id"] for t in tests}), 2)
        report = {"schemaVersion": 1, "generatedAt": "x", "repository": "o/r", "build": None, "tests": tests}
        br.validate(report, {"schemaVersion": 1, "generatedAt": "x", "repository": "o/r", "builds": []})


    def test_a_repeated_spec_gets_a_number(self):
        case = {"name": "same", "classname": "pod-delete", "suiteName": "pod-delete", "status": "passed", "durationSec": 1, "message": "", "job": "Job_A"}
        _, tests = br.build_workflow_record(self.wf("pod-level"), run("2026-10-25T22:00:00Z"), [job("Job_A", "success")], [case, dict(case, status="failed")], CATALOG, CONFIG)
        self.assertEqual([t["id"] for t in tests], ["bdd/pod-delete/same", "bdd/pod-delete/same#2"])


class StatusTest(unittest.TestCase):
    def records(self, **states):
        return [{"suite": "bdd" if k != "chaoscenter" else "frontend", "required": CONFIG_REQ[k], "status": v} for k, v in states.items()]

    def test_overall_status(self):
        self.assertEqual(br.overall_status(self.records(**{"pod-level": "passed", "chaoscenter": "passed", "aws": "failed"}), CONFIG), "passed")
        self.assertEqual(br.overall_status(self.records(**{"pod-level": "passed", "chaoscenter": "failed", "aws": "passed"}), CONFIG), "failed")
        self.assertEqual(br.overall_status(self.records(**{"pod-level": "passed", "chaoscenter": "not_run", "aws": "passed"}), CONFIG), "incomplete")
        self.assertEqual(br.overall_status(self.records(**{"pod-level": "passed", "chaoscenter": "cancelled", "aws": "passed"}), CONFIG), "incomplete")
        self.assertEqual(br.overall_status(self.records(**{"pod-level": "in_progress", "chaoscenter": "passed", "aws": "passed"}), CONFIG), "incomplete")

    def test_failed_beats_incomplete(self):
        self.assertEqual(br.overall_status(self.records(**{"pod-level": "failed", "chaoscenter": "not_run", "aws": "passed"}), CONFIG), "failed")


CONFIG_REQ = {"pod-level": True, "chaoscenter": True, "aws": False}


class FakeClient:
    def __init__(self, runs, jobs, artifacts=None):
        self._runs, self._jobs, self._artifacts = runs, jobs, artifacts or {}

    def runs(self, workflow_file, since):
        return self._runs.get(workflow_file, [])

    def jobs(self, run_id):
        return self._jobs.get(run_id, [])

    def artifacts(self, run_id):
        return [{"name": n, "archive_download_url": "zip:%s" % n} for n in self._artifacts.get(run_id, {})]

    def download(self, url):
        name = url[4:]
        for arts in self._artifacts.values():
            if name in arts:
                return arts[name]
        raise br.ReportError("missing")


def zipped(name, data):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as z:
        z.writestr(name, data)
    return buf.getvalue()


class CollectTest(unittest.TestCase):
    def test_cycle_groups_runs_started_at_different_hours(self):
        self.assertEqual(br.cycle_id(dt.datetime(2026, 10, 25, 22, 42, tzinfo=dt.timezone.utc), 12), "2026-10-25")
        self.assertEqual(br.cycle_id(dt.datetime(2026, 10, 26, 0, 30, tzinfo=dt.timezone.utc), 12), "2026-10-25")
        self.assertEqual(br.cycle_id(dt.datetime(2026, 10, 26, 12, 0, tzinfo=dt.timezone.utc), 12), "2026-10-26")

    def test_only_default_branch_scheduled_or_dispatched_runs_count(self):
        runs = {"nightly-pod-level-pipeline.yml": [run("2026-10-25T22:00:00Z", rid=1, branch="feature"), run("2026-10-25T22:05:00Z", rid=2, event="push"),
                                                  run("2026-10-25T22:10:00Z", rid=3), run("2026-10-25T23:10:00Z", rid=4, event="workflow_dispatch")]}
        cfg = dict(CONFIG, workflows=[w for w in CONFIG["workflows"] if w["category"] == "pod-level"])
        cycles = br.collect_cycles(FakeClient(runs, {}), cfg, dt.datetime(2026, 10, 1, tzinfo=dt.timezone.utc), "master")
        self.assertEqual(cycles["2026-10-25"]["pod-level"][0]["id"], 4)

    def test_a_rerun_in_progress_does_not_hide_the_finished_run(self):
        runs = {"nightly-pod-level-pipeline.yml": [run("2026-10-25T22:10:00Z", "failure", rid=1), run("2026-10-25T23:10:00Z", None, "in_progress", rid=2)]}
        cfg = dict(CONFIG, workflows=[w for w in CONFIG["workflows"] if w["category"] == "pod-level"])
        cycles = br.collect_cycles(FakeClient(runs, {}), cfg, dt.datetime(2026, 10, 1, tzinfo=dt.timezone.utc), "master")
        self.assertEqual(cycles["2026-10-25"]["pod-level"][0]["id"], 1)

    def test_runs_of_the_reusable_workflow_count(self):
        runs = {"E2E-chaoscenter-pipeline.yml": [run("2026-10-25T21:10:00Z", rid=9, event="workflow_dispatch")]}
        cfg = dict(CONFIG, workflows=[dict(w, alsoFiles=["E2E-chaoscenter-pipeline.yml"]) for w in CONFIG["workflows"] if w["category"] == "chaoscenter"])
        cycles = br.collect_cycles(FakeClient(runs, {}), cfg, dt.datetime(2026, 10, 1, tzinfo=dt.timezone.utc), "master")
        self.assertEqual(cycles["2026-10-25"]["chaoscenter"][0]["id"], 9)

    def test_artifacts_are_read_only_for_finished_runs(self):
        runs = {"nightly-pod-level-pipeline.yml": [run("2026-10-25T22:10:00Z", "failure", rid=7)]}
        arts = {7: {"bdd-junit-Pod_Delete_Test": zipped("pod-delete.xml", fixture("ginkgo-pod-delete.xml")), "other": b""}}
        cfg = dict(CONFIG, workflows=[w for w in CONFIG["workflows"] if w["category"] == "pod-level"])
        cycles = br.collect_cycles(FakeClient(runs, {7: [job("Pod_Delete_Test", "failure")]}, arts), cfg, dt.datetime(2026, 10, 1, tzinfo=dt.timezone.utc), "master")
        self.assertEqual(len(cycles["2026-10-25"]["pod-level"][2]), 3)


class AssembleTest(unittest.TestCase):
    NOW = dt.datetime(2026, 10, 26, 8, 0, tzinfo=dt.timezone.utc)

    def cycles(self, pod_conclusion, cypress="success", day="2026-10-25"):
        pod = (run(day + "T22:10:00Z", pod_conclusion, rid=11), [job("Pod_Delete_Test", pod_conclusion)], [])
        items = {"pod-level": pod}
        if cypress:
            items["chaoscenter"] = (run(day + "T21:10:00Z", cypress, rid=12), [job("frontend / run-litmus", cypress)], [])
        return {day: items}

    def test_build_is_incomplete_when_a_required_suite_did_not_run(self):
        latest, history = br.assemble("o/r", CONFIG, self.cycles("success", cypress=None), {"builds": []}, CATALOG, self.NOW)
        self.assertEqual(latest["build"]["status"], "incomplete")
        self.assertEqual(latest["build"]["suites"]["frontend"]["status"], "incomplete")
        br.validate(latest, history)

    def test_frontend_failure_fails_the_build(self):
        latest, history = br.assemble("o/r", CONFIG, self.cycles("success", cypress="failure"), {"builds": []}, CATALOG, self.NOW)
        self.assertEqual(latest["build"]["status"], "failed")
        self.assertEqual(latest["build"]["suites"]["bdd"]["status"], "passed")
        self.assertEqual(latest["build"]["suites"]["frontend"]["status"], "failed")

    def test_empty_data_does_not_break(self):
        latest, history = br.assemble("o/r", CONFIG, {}, {"builds": []}, CATALOG, self.NOW)
        self.assertIsNone(latest["build"])
        br.validate(latest, history)

    def test_stale_build_is_flagged(self):
        latest, _ = br.assemble("o/r", CONFIG, self.cycles("success"), {"builds": []}, CATALOG, self.NOW + dt.timedelta(days=3))
        self.assertTrue(latest["build"]["stale"])
        fresh, _ = br.assemble("o/r", CONFIG, self.cycles("success"), {"builds": []}, CATALOG, self.NOW)
        self.assertFalse(fresh["build"]["stale"])

    def test_history_is_merged_and_the_newer_data_wins(self):
        _, first = br.assemble("o/r", CONFIG, self.cycles("failure", day="2026-10-24"), {"builds": []}, CATALOG, self.NOW)
        latest, second = br.assemble("o/r", CONFIG, self.cycles("success", day="2026-10-25"), first, CATALOG, self.NOW)
        self.assertEqual([b["id"] for b in second["builds"]], ["2026-10-24", "2026-10-25"])
        _, rewritten = br.assemble("o/r", CONFIG, self.cycles("success", day="2026-10-24"), second, CATALOG, self.NOW)
        self.assertEqual(rewritten["builds"][0]["status"], "passed")
        self.assertEqual(len(rewritten["builds"]), 2)

    def test_history_is_capped(self):
        cfg = dict(CONFIG, maxBuildsKept=2)
        prev = {"builds": []}
        for day in ("2026-10-22", "2026-10-23", "2026-10-24"):
            _, prev = br.assemble("o/r", cfg, self.cycles("success", day=day), prev, CATALOG, self.NOW)
        self.assertEqual([b["id"] for b in prev["builds"]], ["2026-10-23", "2026-10-24"])


class MetricsTest(unittest.TestCase):
    def builds(self, rows):
        out = []
        for i, row in enumerate(rows):
            out.append({"id": "2026-10-%02d" % (i + 1), "durationSec": 100 + i, "results": row})
        return out

    def test_newly_failing_and_recovered(self):
        m = br.derive_metrics(self.builds([{"a": "p", "b": "f"}, {"a": "f", "b": "p"}]), [], CONFIG)
        self.assertEqual(m["newlyFailing"], ["a"])
        self.assertEqual(m["recovered"], ["b"])
        self.assertEqual(m["durationChange"]["percent"], 1.0)

    def test_flaky_needs_history_evidence(self):
        short = br.derive_metrics(self.builds([{"a": "p"}, {"a": "f"}]), [], CONFIG)
        self.assertEqual(short["flakyTests"], [])
        flaky = br.derive_metrics(self.builds([{"a": "p"}, {"a": "f"}, {"a": "p"}, {"a": "f"}]), [], CONFIG)
        self.assertEqual(flaky["flakyTests"][0]["id"], "a")
        steady = br.derive_metrics(self.builds([{"a": "f"}] * 5), [], CONFIG)
        self.assertEqual(steady["flakyTests"], [])
        self.assertEqual(steady["recurringFailures"][0]["consecutiveBuilds"], 5)

    def test_single_build_has_no_comparison(self):
        m = br.derive_metrics(self.builds([{"a": "f"}]), [], CONFIG)
        self.assertEqual((m["newlyFailing"], m["recovered"], m["durationChange"]), ([], [], None))


class ValidateTest(unittest.TestCase):
    def test_invalid_data_is_rejected(self):
        latest, history = br.assemble("o/r", CONFIG, {}, {"builds": []}, CATALOG, dt.datetime(2026, 10, 26, tzinfo=dt.timezone.utc))
        latest["tests"] = [{"id": "x", "status": "bogus"}]
        with self.assertRaises(br.ReportError):
            br.validate(latest, history)

    def test_unknown_previous_history_is_ignored(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "h.json")
            with open(path, "w") as fh:
                fh.write('{"schemaVersion": 99, "builds": []}')
            self.assertEqual(br.load_previous(path), {"builds": []})
            with open(path, "w") as fh:
                fh.write("not json")
            self.assertEqual(br.load_previous(path), {"builds": []})
            self.assertEqual(br.load_previous(os.path.join(d, "missing.json")), {"builds": []})


class CoverageTest(unittest.TestCase):
    def test_not_scheduled_and_executed(self):
        tests = [{"suite": "bdd", "kind": "test", "group": "pod-delete"}]
        cov = br.coverage(CATALOG, tests, CONFIG)
        self.assertEqual(cov["notScheduled"], ["node-drain"])
        self.assertEqual(cov["executed"], ["pod-delete"])
        self.assertEqual(cov["executedPercent"], 100.0)

    def test_cloud_experiments_are_not_counted_as_not_run(self):
        catalog = dict(CATALOG, **{"ec2-stop-by-id": {"id": "ec2-stop-by-id", "path": "platform/aws/x_test.go", "kind": "experiment", "workflows": ["aws"]}})
        cov = br.coverage(catalog, [{"suite": "bdd", "kind": "test", "group": "pod-delete"}], CONFIG)
        self.assertEqual(cov["cloud"], ["ec2-stop-by-id"])
        self.assertEqual(cov["scheduled"], ["pod-delete"])
        self.assertEqual(cov["notScheduled"], ["node-drain"])
        self.assertEqual(cov["executedPercent"], 100.0)


if __name__ == "__main__":
    unittest.main()
