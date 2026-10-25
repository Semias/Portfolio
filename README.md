# Portfolio

Persönliche Website von Stefan Gall, gebaut mit Angular und statisch vorgerendert.

```bash
npm ci
npm start        # Entwicklungsserver auf http://localhost:4200
npm run build    # statischer Build nach dist/
npm test         # Unit-Tests (Vitest)
npm run lint
npm run e2e      # Playwright-Tests und axe gegen dist/ (vorher npm run build)
```

Für `npm run e2e` lädt `npx playwright install chromium` einmalig einen Browser; ohne Download geht es mit einem installierten Chrome: `PW_CHANNEL=chrome npm run e2e`. Die Screenshot-Vergleiche laufen im Playwright-Docker-Image: `npm run e2e:visual`, neu aufnehmen mit `npm run e2e:visual:update` (siehe [docs/deployment.md](docs/deployment.md#screenshots-neu-aufnehmen)).

Voraussetzung: Node 22.22.3 oder neuer. Deployment: siehe [docs/deployment.md](docs/deployment.md).
