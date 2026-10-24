# Plan: Neuaufbau als Angular-Projekt mit dem Claude-Design

Stand: 2026-10-24 · Status: **Entwurf zum Review**, noch kein Code umgesetzt

Ziel: Die Seiten aus dem Claude-Design-Projekt („Portfolio-Netz“ und „Blogseite“) werden in einem neuen Angular-Projekt umgesetzt. Das Projekt ersetzt die Vue-App in diesem Repo und läuft über die bestehende Pipeline (CI, Dev-Deploy, Release Please, Prod-Freigabe) weiter.

Der alte Branch `feature/angular-relaunch` bleibt unangetastet. Der Neuaufbau startet frisch auf Basis von `main`.

## 1. Was vorher geklärt sein muss

| # | Frage | Mein Vorschlag |
| --- | --- | --- |
| A | Design-Dateien | Der Import aus Claude Design ist in meiner Cloud-Umgebung nicht möglich. Bitte das Projekt in Claude Design als ZIP exportieren und im Thread hochladen. Ohne die Dateien bleiben Abschnitt 4 und 5 grob. |
| B | Angular ersetzt Vue im Repo-Root oder liegt in einem Unterordner? | **Root ersetzen.** Dann laufen `ci.yml`, `deploy.yml`, `wrangler.jsonc` und Release Please fast unverändert weiter. Ein Unterordner hieße zwei Apps parallel pflegen. |
| C | Docker für den Home-VPS | Das `Dockerfile` baut mit `node:20`. Angular 22 braucht voraussichtlich Node 22 oder neuer. Entweder ich hebe die Node-Version im Dockerfile an (einzeilige Änderung), oder Docker bleibt bis auf Weiteres unverändert und baut die neue App nicht. **Vorschlag: Node-Version anheben**, alles andere an Dockerfile, `nginx.conf` und `docker-compose.yml` bleibt gleich. Braucht dein OK, weil die Dateien bisher tabu waren. |
| D | Woher kommen die Blog-Beiträge? | **Markdown-Dateien im Repo** (`content/blog/*.md`), beim Build zu statischen Seiten vorgerendert. Kein CMS, keine Datenbank, gut für SEO. |
| E | Versionssprung | Der Neuaufbau ist der „echte Relaunch“ und wird als **v2.0.0** released (Commit mit `feat!:` bzw. `BREAKING CHANGE`). |

## 2. Technische Grundentscheidungen

- **Angular 22** (aktuell 22.2.x laut npm), Standalone-Components, Signals, neuer Control Flow (`@if`, `@for`). Kein NgModule, kein Zone.js (zoneless ist seit v21 der Standard).
- **Statisches Prerendering (SSG)** über den Angular-Application-Builder mit `outputMode: "static"`. Jede Route (Startseite, Blog-Übersicht, jeder Beitrag) wird beim Build zu fertigem HTML. Vorteil: schnelle erste Anzeige, gute Suchmaschinen-Indexierung, und der Cloudflare Worker liefert weiterhin nur statische Dateien aus. Kein Node-Server nötig.
- **Build-Ausgabe direkt nach `dist/`** (`outputPath: { base: "dist", browser: "" }`), damit `wrangler.jsonc` und das Dockerfile denselben Ordner finden wie heute.
- **Styling mit SCSS** und CSS-Variablen. Die Design-Tokens aus `_ds/modernist-…/styles.css` (Farben, Schriften, Abstände) werden zu globalen CSS-Variablen in `src/styles/_tokens.scss`. Komponenten nutzen nur diese Variablen.
- **Keine UI-Bibliothek** (PrimeVue fällt weg). Das Design ist individuell, eigene schlanke Komponenten sind leichter zu halten.
- **Three.js** nur, falls `three-ideas.js` / „Netz“ eine 3D- oder Netzwerk-Grafik ist (vermute ich vom Namen). Dann als eigene Komponente, die erst im Browser lädt (`afterNextRender` + dynamischer Import), damit Prerendering und Ladezeit nicht leiden. Wer „weniger Bewegung“ eingestellt hat (`prefers-reduced-motion`), bekommt ein statisches Bild.
- **Bilder** über `NgOptimizedImage` (Lazy Loading, feste Größen gegen Layout-Springen). `image-slot.js` aus dem Design ist ein Platzhalter-Helfer von Claude Design und wird nicht übernommen.
- `_ds_bundle.js` und `support.js` sind Laufzeit-Code von Claude Design für die Vorschau. Sie wandern **nicht** in die App, ich lese sie nur, um Verhalten und Komponenten zu verstehen, und baue das in Angular nach.

## 3. Qualität und Werkzeuge

| Bereich | Werkzeug | Läuft in |
| --- | --- | --- |
| Lint | `angular-eslint` (Flat Config) | `npm run lint`, CI |
| Formatierung | Prettier | `npm run format:check`, CI |
| Unit-Tests | Vitest (Angular-Standard seit v21) | `npm test`, CI |
| End-to-End + Barrierefreiheit | Playwright + `@axe-core/playwright` gegen den Prerender-Build | `npm run e2e`, CI |
| Sicherheitslücken | `npm audit --omit=dev --audit-level=high` | CI (wie heute) |

Nebeneffekt: Mit dem Wegfall von Vue CLI verschwinden auch die 14 bekannten `npm audit`-Treffer aus den Vue-CLI-Build-Tools.

## 4. Projektstruktur (Entwurf)

```
src/
  app/
    app.config.ts            Router, Hydration, Bildoptimierung
    app.routes.ts            /  ·  /blog  ·  /blog/:slug  ·  404
    core/
      layout/                Header, Footer, Navigation
      seo/                   Titel, Meta- und Open-Graph-Tags je Route
    features/
      home/                  „Portfolio-Netz“: Hero, Netz-Grafik, Projekte, Skills, Kontakt
      blog/
        blog-list/           Übersicht mit Teaser-Karten
        blog-post/           Einzelner Beitrag aus Markdown
        blog.service.ts      liest die vorgerenderten Beitragsdaten
    shared/
      ui/                    Button, Karte, Tag, Section-Header … (aus dem Design-System)
      net-graphic/           Three.js- bzw. Canvas-Grafik, nur im Browser
  styles/
    _tokens.scss             Design-Tokens aus _ds/…/styles.css
    _base.scss               Reset, Typografie
    styles.scss
content/
  blog/*.md                  Beiträge mit Frontmatter (Titel, Datum, Teaser, Tags)
public/                      Favicon, Schriften, Bilder
e2e/                         Playwright-Tests
```

Die genaue Aufteilung in `features/home` und `shared/ui` lege ich fest, sobald ich die Design-Dateien gesehen habe.

## 5. Umsetzung in Schritten

Alles passiert auf dem Branch `claude/project-thread-6ch6a9`, ein Commit pro Schritt im Conventional-Commit-Format. Du kannst nach jedem Schritt lokal reinschauen.

1. **Gerüst** (`feat!: Neuaufbau als Angular-Projekt`)
   Vue-Quellcode und Vue-CLI-Konfiguration entfernen, Angular 22 per `ng new` (SCSS, SSG, zoneless) im Root anlegen. `package.json` behält Name und Version (Release Please zählt weiter). Lint, Prettier, Vitest einrichten. Ergebnis: leere Seite baut nach `dist/`.
2. **Design-Tokens und Grundlayout**
   `styles.css` aus dem Design-System in `_tokens.scss` und `_base.scss` überführen, Schriften nach `public/` legen, Header, Footer und Navigation bauen.
3. **UI-Bausteine**
   Die im Design verwendeten Komponenten aus `_ds_bundle.js` als Angular-Komponenten in `shared/ui/` nachbauen, mit je einem kurzen Unit-Test.
4. **Startseite „Portfolio-Netz“**
   Alle Abschnitte aus `Portfolio-Netz.dc.html` umsetzen, inklusive der Netz-Grafik aus `three-ideas.js` / `support.js`. Inhalte aus der heutigen Vue-Seite (Texte, Skills, Social Links, Galerie-Bilder) übernehmen, wo das Design Platzhalter zeigt.
5. **Blog**
   Übersicht und Beitragsseite nach `Blogseite.dc.html`. Markdown wird beim Build gelesen, jede Beitrags-Route wird vorgerendert. Zwei Beispielbeiträge als Vorlage.
6. **SEO und Barrierefreiheit**
   Titel und Meta-Tags je Seite, `sitemap.xml`, `robots.txt`, 404-Seite, Tastaturbedienung, Kontraste. Playwright-Tests für Startseite, Blog und axe-Prüfung.
7. **Pipeline anpassen** (`ci: …`)
   `ci.yml`: zusätzlich `npm test` und `npm run e2e`. `deploy.yml`: Smoke-Test sucht statt `id="app"` nach `<app-root`. `cloudflare/worker.js` und `wrangler.jsonc` bleiben gleich, ggf. `not_found_handling` auf `404-page` umstellen, weil es echte Seiten statt einer SPA gibt. `docs/deployment.md` und PR-Vorlage (`npm test`) nachziehen. Dependabot auf die Angular-Pakete gruppieren.
8. **Docker** (nur nach deinem OK zu Frage C)
   Node-Version im Dockerfile anheben, lokal `docker build` testen.

## 6. Wie du den Branch lokal ansiehst

```bash
git fetch origin
git switch claude/project-thread-6ch6a9
# Plan lesen: docs/angular-neuaufbau-plan.md

# ab Schritt 1, sobald Code da ist:
npm ci
npm start          # http://localhost:4200
npm run build      # Ergebnis in dist/
```

Voraussetzung ab Schritt 1: Node 22 oder neuer (`node -v`).

## 7. Was danach kommt

Wenn du mit dem Ergebnis zufrieden bist, wird aus dem Branch ein PR mit dem Titel `feat!: Neuaufbau als Angular-Projekt`. Der Merge landet automatisch auf dev.gall-stefan.de. Release Please schlägt daraufhin v2.0.0 vor, und mit deiner Freigabe geht es auf gall-stefan.de.
