# Nightly report generator

Builds `latest.json` and `history.json` for the dashboard, see [schema.md](schema.md) for the contract.

```bash
# tests, no network needed
python3 -m unittest discover -s scripts/report/tests

# build the data from the runs of a repository (a token raises the API limits and is needed for the artifacts)
GITHUB_TOKEN=... python3 scripts/report/build_report.py --repo <owner>/litmus-e2e --out /tmp/report \
  --previous https://<owner>.github.io/litmus-e2e/nightly/data/history.json
```

`config.json` lists the nightly workflows, the suite each one belongs to and whether it is required for the build to
pass. Workflows that need cloud credentials are not required, their failures are reported but do not fail the build,
and they are never counted as passing.

The `Nightly-Report` workflow runs the tests, builds the data into `dashboard/data` and commits `dashboard/` to the
`nightly/` folder of the `gh-pages` branch after every nightly workflow.
