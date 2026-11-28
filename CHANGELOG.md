# Changelog

## 0.2.0

#### New area: deeper-mobile

Deadlines now belong to an area. The checks below are in the new area `deeper-mobile`. The CLI and the job summary show every area. The Action opens, updates or closes issues for `deeper-mobile`, and lets it fail the job, only when the workflow names it in the new `areas` input:

```yaml
- uses: warnahead/action@v0
  with:
    areas: deeper-mobile
```

- **Flutter apps.** For an Android app whose Gradle script takes targetSdk from `flutter.targetSdkVersion`, warnahead reads the Flutter version that builds it (an `.fvmrc` file or FVM's older `fvm_config.json`, or the version a CI job that builds Android pins) and that release's default targetSdk, and checks Google Play's floors: API 35 for existing apps to stay available to new users on devices running a higher Android version, API 36 for new apps and updates (both since August 31, 2026), and API 37 announced for August 2027. No pin, or a job that follows the stable channel, gives Unknown with the reason, and so do two pins whose releases have different default targetSdk values and a version from an env variable that is not a plain `env:` value of the workflow or the job (a job with a step that writes to `GITHUB_ENV` has none). A version pinned only in CI gives an inferred result, which opens no issue; only an FVM pin of an exact release of Flutter 3.38 or later that warnahead's table has read (not a newer patch or release), together with Google Play evidence, can give a certain one. The table's rows up to Flutter 3.35 are inferred, so a Flutter app below the API 36 or API 35 floor gets an inferred result in 0.2 and no issue; only the API 37 check can give a certain Flutter finding below a floor. The general target API floors stay Unknown for such an app; the Flutter floors carry the answer, and a floor the app meets shows nothing.
- **Wear OS, TV, Automotive and XR apps** (manifest requires the feature) are checked against their own target API floors.
- **16 KB memory pages.** Google Play: starting February 1, 2027, app updates that target API 35 or higher and do not support 16 KB pages on 64-bit devices cannot be released. Most results are Unknown from the repository files alone. The new CLI option `--check-binaries` also reads local APK, AAB, AAR and .so files; the Action never reads binaries.
- **Android NDK removals on GitHub runners** (NDK 26, NDK 28): warning only, never an issue or a failed job. Gradle can install a missing NDK during the build when its license is accepted; otherwise the build can fail.

#### Changed rules for every user (not part of an area)

- **App Store SDK floors count uploads only.** They are certain only for build paths that upload: a CI job or fastlane lane that builds for a device and sends the build to TestFlight or App Store Connect (altool, Transporter, `eas submit`, fastlane, an `xcodebuild` export with an upload destination, the TestFlight upload action), an EAS store profile, or a Codemagic or Bitrise workflow that publishes to App Store Connect. Simulator, unsigned, test and internal builds no longer count, and an upload of a macOS app does not count as an iOS upload. Without a visible upload path the result is Unknown, never "not affected".
- **Google Play findings need Google Play evidence.** A Google Play finding is certain only when something shows that the app is on Google Play: `stores` in `.warnahead.json`, an EAS submit profile with an `android` key or `eas submit`, fastlane `supply`, the Play upload action, or a README link to the app's own Google Play listing. Without it the finding shows with "if you publish to Google Play", opens no issue and never fails a build. The `production: {}` submit profile of EAS's default `eas.json` is not Google Play evidence, so such an Expo app gets inferred Google Play findings. If the app is on Google Play, set `stores`; that settles the Google Play question, though a Flutter result from a CI pin or from Flutter 3.35 or older is never certain.
- **macOS projects.** An Xcode project whose application targets all build for macOS is no longer checked as an iOS app, so the App Store iOS floors no longer show for it.
- **Wear OS, TV, Automotive and XR apps** no longer get the phone and tablet target API floors as certain; those show Unknown, and the Flutter phone floors do not apply to them.
- `xcode-select -switch` is read like `-s`; an app under a folder named `_old`, `old`, `legacy`, `archive`, `archived` or `deprecated` is reported only, like an example app, and opens no issue.

#### What happens to issues that are already open

- An issue for a finding that is now inferred or Unknown (no Google Play evidence; a Wear OS, TV, Automotive or XR app; an App Store SDK floor without an upload path) stays open and unchanged, because warnahead closes an issue only when its finding is gone or its dataset entry is withdrawn or superseded. Close it yourself if it no longer applies; warnahead never reopens an issue a person closed.
- An App Store issue for a project that only builds for macOS closes, because the finding is gone.

Every deadline in the dataset, each with its source: https://warnahead.pages.dev

warnahead is an aid, not a guarantee. Not affiliated with or endorsed by Google, Apple, Expo or GitHub.

## 0.1.1

- Published from this repository's release workflow with npm provenance. No change in behaviour from 0.1.0.

## 0.1.0

First release.

- `warnahead` CLI: reads an Expo or React Native project, its Gradle and Xcode settings and its CI workflows, and reports store and CI platform deadlines as Due, Expected, not announced, or Unknown, each with its source.
- `warnahead/action` GitHub Action: runs the same scan in a workflow, writes a job summary, and opens one issue per deadline that is due (or one rolling issue, or a report only).
- Dataset and deadline pages: https://warnahead.pages.dev
