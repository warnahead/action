# Changelog

## 0.1.0

First release.

- `warnahead` CLI: reads an Expo or React Native project, its Gradle and Xcode settings and its CI workflows, and reports store and CI platform deadlines as Due, Expected, not announced, or Unknown, each with its source.
- `warnahead/action` GitHub Action: runs the same scan in a workflow, writes a job summary, and opens one issue per deadline that is due (or one rolling issue, or a report only).
- Dataset and deadline pages: https://warnahead.pages.dev
