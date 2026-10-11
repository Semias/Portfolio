# Repo-Einstellungen

Einmalige Handgriffe in den GitHub-Einstellungen, die sich nicht über Dateien im Repo erledigen lassen.

## 1. Tag `v1.0.1` für den heutigen Stand

Releases → *Draft a new release* → *Choose a tag*: `v1.0.1` eingeben, *Create new tag on publish*, Target `main` → Titel `v1.0.1` → *Publish release*.

Danach ist das der letzte Stand vor der neuen Pipeline. Das erste Release über Release Please wird `v2.0.0`.

## 2. Alte Branches löschen

Unter *Branches* löschen:

| Branch | Warum |
| --- | --- |
| `dev` | keine eigenen Commits, 7 Commits hinter `main` |
| `claude/dependabot-update-2026-10-05` | gemergt (#8) |
| `claude/dependabot-update-2026-09-28` | von #8 überholt (ältere Lockfile, Version 0.1.1) |

`feature/angular-relaunch` bleibt unangetastet.

## 3. Rulesets importieren

*Settings → Rules → Rulesets → New ruleset → Import a ruleset*, nacheinander:

- `.github/rulesets/main.json`: nur PRs auf `main`, nur Squash-Merge, lineare Historie, kein Force-Push oder Löschen, Pflicht-Checks `verify` und `pr-title`.
- `.github/rulesets/release-tags.json`: Tags `v*` können nicht verschoben oder gelöscht werden.

Den `main`-Ruleset erst importieren, nachdem die CI einmal gelaufen ist, sonst kennt GitHub die Checks `verify` und `pr-title` noch nicht. Wenn es noch klassische Branch-Protection-Regeln für `main` gibt (*Settings → Branches*), diese danach entfernen, damit nicht zwei Regelwerke greifen.

## 4. Merge-Einstellungen

*Settings → General → Pull Requests*:

- nur *Allow squash merging* aktiv, *Default commit message*: *Pull request title*
- *Automatically delete head branches* aktiv
