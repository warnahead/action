# warnahead

warnahead tells you which app store and CI platform deadlines apply to your mobile app repository,
before they block a release. It reads your Expo or React Native project, your Gradle and Xcode
settings and your CI workflows, and checks them against a dataset of announced deadlines: Google
Play target API levels, App Store SDK floors, GitHub Actions runner retirements, Node.js and React
Native end of life, Play Billing Library versions.

Every deadline comes with its source and the date it was last verified. A clean result means
nothing warnahead can detect, not that nothing is due.

By Aman Gupta. Not affiliated with or endorsed by Google, Apple, Expo or GitHub.

## Quickstart

Run it in the root of your repository (Node.js 22.13 or later):

```bash
npx warnahead
```

The report groups what it finds into **Due** (announced and within the horizon, or already passed),
**Expected, not announced** and **Unknown** (something warnahead could not resolve, with the
reason). Each due finding names the file and line it is based on, the fix and the source.

More ways to run it:

```bash
npx warnahead --horizon 180
npx warnahead --all
npx warnahead --format json
npx warnahead --format client
npx warnahead --ics deadlines.ics
npx warnahead --fail-within 30
npx warnahead --offline
npx warnahead deadlines
npx warnahead deadlines --platform google-play
```

| Option                        | What it does                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `[path]`                      | Directory to scan; default `.`                                                                                                   |
| `--horizon <days>`            | Show due findings up to this many days ahead; default 90                                                                         |
| `--all`                       | Also show findings beyond the horizon                                                                                            |
| `--as-of <YYYY-MM-DD>`        | Evaluate as of this date (UTC)                                                                                                   |
| `--format text\|json\|client` | `json` is the stable `warnahead.findings/1` format; `client` is a plain-language report you can forward to a client or manager   |
| `--ics <file>`                | Also write the findings as a calendar file                                                                                       |
| `--fail-within <days>`        | Exit 1 when a certain deadline that blocks releases or breaks CI is this many days away or has passed; by default it never fails |
| `--offline`                   | No network; use the dataset bundled with the package                                                                             |
| `--eval-config`               | Allow running `npx expo config` for a dynamic `app.config.js` or `app.config.ts`                                                 |
| `--data <file\|url>`          | Use another copy of the dataset                                                                                                  |

`warnahead deadlines` lists the dataset without scanning anything.

Exit codes: `0` ran (with or without findings), `1` `--fail-within` triggered, `2` usage or
configuration error, `3` internal error.

## GitHub Action

The Action runs the same scan in your workflow, writes a job summary, and opens one issue per
deadline that is due for an app in your repository. Issues get a comment as each threshold is
crossed, are updated if the date moves, and close themselves when the fix lands. An issue you close
yourself is never reopened.

```yaml
name: warnahead
on:
  schedule:
    - cron: '0 6 * * 1'
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  deadlines:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: warnahead/action@v0
        with:
          horizon-days: '90'
          thresholds: '60,30,7'
```

| Input              | Default               | What it does                                                                                                       |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `path`             | `.`                   | Directory to scan, relative to the workspace                                                                       |
| `horizon-days`     | `90`                  | Report deadlines due within this many days                                                                         |
| `thresholds`       | `60,30,7`             | Days before a deadline at which its issue gets a comment                                                           |
| `mode`             | `issues`              | `issues`, `single-issue` (one rolling issue) or `report-only` (job summary and outputs only)                       |
| `include-expected` | `false`               | Also act on expected deadlines that are not announced yet                                                          |
| `fail-within`      | empty                 | Fail the job when a deadline that blocks releases or breaks CI is this many days away or closer; empty never fails |
| `token`            | `${{ github.token }}` | Token for the issues API and the dataset copy on GitHub                                                            |

Outputs: `due-count` (deadlines due within the horizon or passed) and `findings-json` (path to the
findings file in the `warnahead.findings/1` format).

With `mode: report-only` the Action needs only `contents: read`.

## Configuration

Optional. Put a `.warnahead.json` in the root of your repository, or the same object under a
`warnahead` key in the root `package.json`:

```json
{
  "horizonDays": 90,
  "apps": ["."],
  "stores": ["google-play", "app-store"],
  "ignorePaths": ["examples/**"],
  "acknowledge": [
    {
      "id": "github-actions/ubuntu-22.04-retirement",
      "until": "2027-01-31",
      "reason": "moving to ubuntu-24.04 in January"
    }
  ]
}
```

- `horizonDays`: the default for `--horizon`.
- `apps`: the app folders to scan, when automatic discovery picks the wrong ones.
- `stores`: where you publish. Without it, warnahead assumes a store wherever its platform is
  present and says "if you publish to Google Play" when it finds no publishing setup.
- `ignorePaths`: glob patterns to skip.
- `acknowledge`: silence one deadline until a date, with a reason. The ids are in
  `npx warnahead deadlines --json`.

An unknown key is a configuration error (exit 2) that names the key.

## Privacy

- No telemetry. Nothing from your repository is sent anywhere.
- The CLI makes one network request: a GET of the public dataset at
  `https://warnahead.pages.dev/data/v1/deadlines.json`, falling back to the copy in this
  repository and then to the copy bundled with the package. Locally the dataset is cached for 24
  hours. `--offline` turns off all network access.
- The CLI never reads `.env` files and never prints tokens.
- The Action uses only the workflow's `GITHUB_TOKEN`: to manage its issues, to read the dataset copy
  in this repository and, when allowed, to read `action.yml` of the actions your workflows use.

## FAQ

### Is it open source?

No, it is free to use, including at work and for commercial projects, under the terms in
[LICENSE.md](LICENSE.md). This repository holds the built CLI and Action, the dataset and the site;
the source code is not public. The dataset is covered by [DATA-TERMS.md](DATA-TERMS.md).

### Where do the dates come from?

From the platforms' own pages: Google Play Console help, Apple developer news, the GitHub changelog
and runner-images announcements, the Node.js and React Native release schedules. Every entry has a
source link, a short quote and the date it was last checked. Deadlines that are expected but not
announced are shown separately, with the basis for the estimate.

### A date is wrong, or a deadline is missing

Please open an issue with a link to the platform's page and the sentence that shows it; see
[CONTRIBUTING.md](CONTRIBUTING.md). This repository does not accept pull requests.

### Does a clean result mean my app is safe?

A clean result means nothing warnahead can detect, not that nothing is due. Findings marked
**Unknown** are worth a look by hand.

warnahead is an aid, not a guarantee, and it is not foolproof. You use it at your own risk; check
the linked official source before you rely on a result. See sections 6 and 7 of
[LICENSE.md](LICENSE.md).

### Which projects does it understand?

Expo apps, with or without native folders; React Native and native apps through their Gradle
(`android/`) and Xcode (`ios/`) projects; and CI on GitHub Actions, Codemagic and Bitrise.

## Security

Please report security problems privately; see [SECURITY.md](SECURITY.md).

## License

Free to use under [LICENSE.md](LICENSE.md). Third-party notices are in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
