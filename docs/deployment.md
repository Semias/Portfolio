# Deployment auf Cloudflare

Die Seite läuft als Cloudflare Worker mit statischen Assets (`wrangler.jsonc`, `cloudflare/worker.js`). Der Workflow `.github/workflows/deploy.yml` baut einmal und deployt dann:

| Auslöser | Ziel | Schutz |
| --- | --- | --- |
| Merge auf `main` | https://dev.gall-stefan.de (Worker `portfolio-dev`) | Basic Auth, `X-Robots-Tag: noindex` |
| Merge des Release-PRs von Release Please (oder Tag `v*`) | https://gall-stefan.de (Worker `portfolio`), `www.` leitet um | Freigabe im Environment `production` |

Docker, nginx und `docker-compose.yml` bleiben davon unberührt und sind weiter für Portainer auf dem Home-VPS da.

## Einmalige Einrichtung

### GitHub-Secrets

*Settings → Secrets and variables → Actions → New repository secret*:

| Name | Inhalt |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API-Token aus der Vorlage „Cloudflare Workers bearbeiten“, Zone `gall-stefan.de` |
| `CLOUDFLARE_ACCOUNT_ID` | Konto-ID aus der Cloudflare-Übersicht |
| `DEV_BASIC_AUTH_USER` | Benutzername für dev.gall-stefan.de |
| `DEV_BASIC_AUTH_PASS` | Passwort für dev.gall-stefan.de |

Fehlen die Basic-Auth-Secrets, bricht der Dev-Deploy ab. Der Worker selbst bleibt ohne Zugangsdaten zu (HTTP 503) statt offen. Zum Ändern des Passworts das Secret in GitHub ersetzen und den Workflow neu laufen lassen (*Actions → Deploy → Re-run*).

### Environment `production`

*Settings → Environments → production*: unter *Required reviewers* sich selbst eintragen. Unter *Deployment branches and tags* müssen der Branch `main` (Releases über Release Please) und der Tag `v*` (von Hand angelegte Releases) erlaubt sein, oder *No restriction*.

### Release Please darf PRs anlegen

*Settings → Actions → General → Workflow permissions*: Haken bei *Allow GitHub Actions to create and approve pull requests*, dann *Save*.

### DNS in Cloudflare aufräumen

Cloudflare legt die Einträge für `dev.gall-stefan.de`, `gall-stefan.de` und `www.gall-stefan.de` beim Deploy selbst an. Gibt es dort schon alte **A-, AAAA- oder CNAME-Einträge** (z. B. von netcup übernommen), schlägt der Deploy mit einem Hinweis auf bestehende DNS-Einträge fehl. Dann in Cloudflare unter *DNS → Einträge* genau diese Einträge löschen. **MX- und TXT-Einträge stehen lassen**, die sind für E-Mail.

- vor dem ersten Dev-Deploy: Eintrag `dev`
- vor dem ersten Prod-Release: Einträge `gall-stefan.de` (bzw. `@`) und `www`

## Release auf Prod

Release Please (Job `release-please` in `deploy.yml`, Konfiguration in `release-please-config.json`) liest nach jedem Merge auf `main` die Commit-Titel seit dem letzten Release und pflegt einen PR „chore(main): release X.Y.Z“ mit neuer Version und `CHANGELOG.md`:

| Commit-Titel | Version |
| --- | --- |
| `fix: …` | 1.1.0 → 1.1.1 |
| `feat: …` | 1.1.0 → 1.2.0 |
| `feat!: …` oder `BREAKING CHANGE:` im Text | 1.1.0 → 2.0.0 |
| `chore:`, `ci:`, `docs:`, `refactor:` … | kein neues Release |

1. Release-PR prüfen: stimmen Versionsnummer und Changelog? `v2.0.0` ist für den Relaunch reserviert. Steht dort unerwartet 2.0.0, nicht mergen, sondern den auslösenden Commit-Titel prüfen.
2. Release-PR mergen. Release Please legt Tag `vX.Y.Z` und das GitHub-Release an.
3. Im selben Lauf unter *Actions → Deploy* wartet `deploy-prod` auf Freigabe: *Review deployments → Approve and deploy*.

Weil der Release-PR vom `GITHUB_TOKEN` stammt, startet GitHub dafür keine `pull_request`-Workflows. Der Job `release-please` startet `verify` und `pr-title` deshalb selbst per `workflow_dispatch`, damit der PR mergebar wird.

Eine bestimmte Version erzwingen (z. B. `2.0.0` für den Relaunch): in `release-please-config.json` unter `packages` → `.` den Eintrag `"release-as": "2.0.0"` ergänzen, per PR mergen und nach dem Release wieder entfernen.

Notfalls geht es weiter von Hand: *Releases → Draft a new release*, neuen Tag `vX.Y.Z` auf `main`, veröffentlichen, dann wie oben freigeben. Danach `.release-please-manifest.json` auf dieselbe Version setzen.

## Zurückrollen

Cloudflare-Dashboard → *Workers & Pages* → `portfolio` (bzw. `portfolio-dev`) → *Deployments* → bei der vorherigen Version *Rollback*.

## Lokal testen

```sh
npm run build
printf 'BASIC_AUTH_USER=test\nBASIC_AUTH_PASS=test\n' > .dev.vars.dev
npx wrangler dev --env dev   # mit Basic Auth
npx wrangler dev             # wie Prod
```

`.dev.vars*` und `.wrangler/` sind in `.gitignore`.
