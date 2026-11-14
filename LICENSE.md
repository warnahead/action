# warnahead License Agreement

Version 1, 2026-11-13. This agreement covers the warnahead command-line tool (the npm package
`warnahead`) and the warnahead GitHub Action (`warnahead/action`), together "the Software". The
dataset, the site and the calendar feeds are covered by [DATA-TERMS.md](DATA-TERMS.md).

**In short:** you may use the Software for free, at work and for commercial projects. You may not
change it, redistribute it or reverse engineer it. It is an aid, not a guarantee: it comes without
warranty, you use it at your own risk, and no liability can be claimed. It collects no telemetry.
This short summary is not part of the agreement; the sections below are.

## 1. Who and what

Aman Gupta ("the licensor") makes the Software available under this agreement. By installing,
running or referencing the Software (for example with `npx warnahead` or `uses: warnahead/action`),
you ("you") accept this agreement. If you accept it on behalf of an organisation, you confirm that
you may bind that organisation.

## 2. What you may do

The licensor grants you a worldwide, non-exclusive, non-transferable, royalty-free licence to
install and run the Software, on any number of machines and CI runners, for personal, internal
business and commercial purposes, including work you do for clients. You may:

- install it from the npm registry and reference the Action from GitHub, as published;
- keep unmodified copies in your own caches, CI images and private repositories, for your own use
  under this agreement;
- share the Software's output (reports, issues, calendar files) as you like.

## 3. What you may not do

Except where applicable law expressly allows it despite this limitation, you may not:

- modify, adapt, translate or create derivative works of the Software;
- redistribute, sell, rent, lease, sublicense or publish copies of the Software, other than
  pointing others to the official npm package or GitHub repository;
- reverse engineer, decompile, disassemble or de-minify the Software, or try to derive its source
  code;
- remove or change any licence, copyright or attribution notice in the Software.

## 4. Third-party components

The Software bundles third-party components. Each is licensed under its own terms, listed in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and those terms govern that component.

## 5. Privacy

- The Software sends no telemetry and never sends the contents of your repository anywhere.
- The command-line tool makes one network request: a GET of the public dataset from
  `https://warnahead.pages.dev/data/v1/deadlines.json`, falling back to the copy in the public
  GitHub repository and then to the copy bundled with the package. `--offline` turns off all
  network access.
- The Action uses only the workflow's `GITHUB_TOKEN`, to manage the issues it opens, to read the
  dataset copy in the public repository and, when allowed, to read `action.yml` of the actions
  your workflows use.
- These requests reach Cloudflare (which hosts the site) or GitHub, under their own privacy
  policies. The licensor adds no analytics or trackers to the site and does not identify anyone
  from these requests.
- The Software never reads `.env` files and never prints tokens.

## 6. An aid, not a guarantee

The Software is a utility that can help you notice deadlines early. It is an aid, not a guarantee,
and it is not foolproof: it can miss a deadline or report one that does not apply to you. You use
the Software and its findings at your own risk. Before you rely on a result, check the linked
official source.

The Software and its findings are provided "AS IS", without warranty of any kind, express or
implied, including the warranties of merchantability, fitness for a particular purpose, accuracy
and non-infringement. Deadlines come from third-party sources that may be wrong, incomplete or
change without notice. A clean result means nothing the Software can detect, not that nothing is
due. The Software is not legal or compliance advice; you remain responsible for meeting the
requirements of the stores and platforms you publish to.

## 7. No liability

To the maximum extent permitted by applicable law, the licensor is not liable for any damages or
claims of any kind arising from or related to the Software or its findings, including lost
profits, revenue or data, a rejected or delayed release, an app removed from or hidden in a
store, or a missed deadline, even if advised of the possibility.

## 8. Termination

This agreement ends automatically if you breach it. You must then stop using the Software and
delete your copies. Sections 6 and 7 survive termination.

## 9. Changes

Later versions of the Software may come with different terms. The version you have stays under
the terms that shipped with it.

## 10. Other

warnahead is not affiliated with or endorsed by Google, Apple, Expo or GitHub; their names are
used only to describe the platforms the Software checks. If a provision of this agreement is
unenforceable, the rest remains in effect. Questions about this agreement: open an issue at
https://github.com/warnahead/action/issues.
