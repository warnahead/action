# warnahead

warnahead tells you which app store and CI platform deadlines apply to your mobile app repository,
before they block a release. It reads your Expo, React Native or Flutter project, your Gradle and Xcode
settings and your CI workflows, and checks them against a dataset of announced deadlines: Google
Play target API levels, App Store SDK floors, GitHub Actions runner retirements, Node.js and React
Native end of life, Play Billing Library versions. The checks in the `ci-runtimes` area work for any
repository, not only app repositories: runner retirements, Docker base images and their OS releases,
and Python, Ruby, Go, Eclipse Temurin and Node.js runtimes.

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
| `--check-binaries`            | Also read local APK, AAB, AAR and .so files for 16 KB page support; the Action never reads binaries                              |
| `--data <file\|url>`          | Use another copy of the dataset                                                                                                  |

`warnahead deadlines` lists the dataset without scanning anything.

Exit codes: `0` ran (with or without findings), `1` `--fail-within` triggered, `2` usage or
configuration error, `3` internal error.

## GitHub Action

The Action runs the same scan in your workflow, writes a job summary, and opens one issue per
deadline that is due for an app in your repository. Issues get a comment as each threshold is
crossed, are updated if the date moves, and close themselves when the fix lands. An issue you close
yourself is never reopened.

Deadlines belong to an area. The CLI and the job summary show every area. The Action opens, updates
or closes issues for an area added after 0.1, such as `deeper-mobile` (Flutter apps; Wear OS, TV,
Automotive and XR apps; 16 KB memory pages; Android NDK removals on GitHub runners) or
`ci-runtimes` (runner retirements for any repository; Docker base images and their OS releases;
Python, Ruby, Go, Eclipse Temurin and Node.js runtimes), and lets it fail the job, only when the workflow names
it in the `areas` input. In `ci-runtimes`, the runtime and OS end-of-life dates are warnings: they
show in the CLI output and the job summary, open no issue and never fail a build. The macOS Intel
runner retirement is the one entry in the area that can open an issue and fail the job.

Only a certain finding opens an issue. An issue for a finding that is now inferred or Unknown stays
open and unchanged, because warnahead closes an issue only when its finding is gone or its dataset
entry is withdrawn or superseded. Close it yourself if it no longer applies.

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

| Input              | Default               | What it does                                                                                                                              |
| ------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `path`             | `.`                   | Directory to scan, relative to the workspace                                                                                              |
| `horizon-days`     | `90`                  | Report deadlines due within this many days                                                                                                |
| `thresholds`       | `60,30,7`             | Days before a deadline at which its issue gets a comment                                                                                  |
| `mode`             | `issues`              | `issues`, `single-issue` (one rolling issue) or `report-only` (job summary and outputs only)                                              |
| `include-expected` | `false`               | Also act on expected deadlines that are not announced yet                                                                                 |
| `fail-within`      | empty                 | Fail the job when a deadline that blocks releases or breaks CI is this many days away or closer; empty never fails                        |
| `areas`            | empty                 | Areas added after 0.1 that may also open issues and fail the job: `deeper-mobile`, `ci-runtimes`; the job summary always shows every area |
| `token`            | `${{ github.token }}` | Token for the issues API and the dataset copy on GitHub                                                                                   |

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

### When is a finding certain?

- **Google Play.** A Google Play finding is certain only when something shows that the app is on
  Google Play: `stores` in `.warnahead.json`, an EAS submit profile with an `android` key or
  `eas submit`, fastlane `supply`, the Play upload action, or a README link to the app's own Google
  Play listing. Without it the finding shows with "if you publish to Google Play", opens no issue and
  never fails a build.
- **App Store SDK floors.** They are certain only for build paths that upload: a CI job or fastlane
  lane that builds for a device and sends the build to TestFlight or App Store Connect (altool,
  Transporter, `eas submit`, fastlane, an `xcodebuild` export with an upload destination, the
  TestFlight upload action), an EAS store profile, or a Codemagic or Bitrise workflow that publishes
  to App Store Connect. Simulator, unsigned, test and internal builds do not count, and an upload of
  a macOS app does not count as an iOS upload. Without a visible upload path the result is Unknown,
  never "not affected".
- **Flutter.** A version pinned only in CI gives an inferred result, which opens no issue; only an
  FVM pin (`.fvmrc` or `fvm_config.json`) of an exact release of Flutter 3.38 or later that
  warnahead's table has read, together with Google Play evidence, can give a certain one.

### Which projects does it understand?

Expo apps, with or without native folders; React Native and native apps through their Gradle
(`android/`) and Xcode (`ios/`) projects; Flutter apps whose Gradle script takes targetSdk from
`flutter.targetSdkVersion`; and CI on GitHub Actions, Codemagic and Bitrise. Wear OS, TV,
Automotive and XR apps (the manifest requires the feature) are checked against their own target API
floors. An Xcode project whose application targets all build for macOS is not checked as an iOS
app.

In the `ci-runtimes` area, any repository: GitHub Actions runner labels, Dockerfiles, the root
`.gitlab-ci.yml`, and runtime version files such as `.python-version`, `pyproject.toml`,
`.ruby-version`, `Gemfile`, `go.mod` and `.java-version` (Eclipse Temurin), along with the setup
actions in GitHub workflows.

## What warnahead adds over end-of-life scanners

xeol scans container images, filesystems and SBOMs for end-of-life packages, with endoflife.date
among its sources, and can exit with an error when it finds one. eol-check is a CLI that checks
your development environment and project dependencies, and scans Dockerfiles and templates such as
Terraform files for end-of-life runtimes, with data from endoflife.date. Renovate has an
endoflife.date datasource, and endoflife.date offers an action that returns a list of supported
versions for a product.

warnahead adds the dated policies of app stores and CI platforms: target API levels, SDK floors and
runner retirements, each with its primary source, a short quote and the date it was last verified.
Where a runtime end date also comes from endoflife.date, warnahead cites the owner's own release
page as the primary source and endoflife.date as a second one. Its GitHub Action opens one issue
per deadline that is due, comments as each threshold is crossed and closes the issue when the fix
lands. In the CI and runtimes area it reads Dockerfiles, the root .gitlab-ci.yml, runtime version
files such as .python-version, .ruby-version and go.mod, and the setup actions in GitHub workflows.

The tools fit together: a package scanner looks inside container images, and warnahead tracks the
dates that platforms set for your repository.

## Security

Please report security problems privately; see [SECURITY.md](SECURITY.md).

## License

Free to use under [LICENSE.md](LICENSE.md). Third-party notices are in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
