# Deployment auf Cloudflare

Die Seite läuft als Cloudflare Worker mit statischen Assets (`wrangler.jsonc`, `cloudflare/worker.js`). Der Workflow `.github/workflows/deploy.yml` baut einmal und deployt dann:

| Auslöser | Ziel | Schutz |
| --- | --- | --- |
| Merge auf `main` | https://dev.gall-stefan.de (Worker `portfolio-dev`) | Basic Auth, `X-Robots-Tag: noindex` |
| Tag `v*` (Release) | https://gall-stefan.de (Worker `portfolio`), `www.` leitet um | Freigabe im Environment `production` |

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

*Settings → Environments → production*: unter *Required reviewers* sich selbst eintragen. Unter *Deployment branches and tags* muss `v*` als Tag erlaubt sein (oder *No restriction*).

### DNS in Cloudflare aufräumen

Cloudflare legt die Einträge für `dev.gall-stefan.de`, `gall-stefan.de` und `www.gall-stefan.de` beim Deploy selbst an. Gibt es dort schon alte **A-, AAAA- oder CNAME-Einträge** (z. B. von netcup übernommen), schlägt der Deploy mit einem Hinweis auf bestehende DNS-Einträge fehl. Dann in Cloudflare unter *DNS → Einträge* genau diese Einträge löschen. **MX- und TXT-Einträge stehen lassen**, die sind für E-Mail.

- vor dem ersten Dev-Deploy: Eintrag `dev`
- vor dem ersten Prod-Release: Einträge `gall-stefan.de` (bzw. `@`) und `www`

## Release auf Prod

1. Release anlegen: *Releases → Draft a new release*, neuen Tag `vX.Y.Z` auf `main`, veröffentlichen.
2. Unter *Actions → Deploy* wartet `deploy-prod` auf Freigabe: *Review deployments → Approve and deploy*.

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
