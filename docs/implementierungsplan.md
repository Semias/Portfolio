# Implementierungsplan: Portfolio nach dem Claude-Design

Stand: 2026-10-24 · Status: **wartet auf dein Review**. Das Angular-Grundprojekt steht, das Design ist noch nicht umgesetzt.

Grundlage sind die hochgeladenen Design-Dateien. Umgesetzt wird **`Portfolio-Netz.dc.html`** (Startseite mit 3D-Netz) und **`Blogseite.dc.html`** (Beitragsseite). Die 3D-Szene kommt aus `three-ideas.js` (Funktion `network`). Die übrigen Varianten (`Portfolio-A-Grid`, `Portfolio-Spielwiese`, `3D-2-Netz`, `3D-5-Gelaende`) dienen nur als Referenz.

## 1. Was schon erledigt ist

Auf diesem Branch ersetzt ein frisches **Angular 22**-Projekt die Vue-App im Repo-Root:

- Standalone-Components, zoneless, SCSS, Vitest für Unit-Tests, `angular-eslint`, Prettier
- **Statischer Build mit Prerendering** (`outputMode: "static"`), Ausgabe direkt nach `dist/`. Der Cloudflare Worker und `wrangler.jsonc` liefern das ohne Änderung aus.
- `npm run lint`, `npm run build`, `npm test` laufen grün. `npm audit --omit=dev` meldet 0 Lücken (die 14 alten Vue-CLI-Treffer sind weg).
- Die Seite zeigt vorerst nur einen Platzhalter.
- Voraussetzung lokal: **Node 22.22.3 oder neuer** (oder Node 24).

```bash
git fetch origin && git switch claude/project-thread-6ch6a9
npm ci
npm start        # http://localhost:4200
```

Dockerfile, `nginx.conf` und `docker-compose.yml` sind unverändert (siehe Frage F).

## 2. Was im Design steckt

### Startseite „Portfolio-Netz“

| Bereich | Inhalt laut Design |
| --- | --- |
| Header (sticky) | Logo „Stefan Gall“ mit Akzent-Quadrat, Navigation (Über mich, Lebenslauf, Projekte, Blog, Kontakt), Theme-Umschalter hell/dunkel, Sprachumschalter DE/EN. Beim Scrollen wird der Header kompakter, bekommt einen Schatten und die Navigation blendet aus. |
| Hero | Rundes Portrait mit Akzent-Ring, Überschrift „Hi, ich bin Stefan. Ich liebe es, *digitale Produkte* zu bauen.“, Unterzeile, Farbwähler (Blau, Türkis, Lila, Rot + freie Farbe) |
| Info-Leiste | Glas-Karte: „Solution Expert · Software Engineer“, „TypeScript · Node · SQL“, GitHub- und LinkedIn-Link |
| 01 Über mich | Glas-Karte rechts, zwei Textspalten |
| 02 Lebenslauf | Glas-Karte links, Zeitleiste mit zwei Stationen (planb. GmbH seit 2023, cm city media 2021–2023) |
| 03 Projekte | Glas-Karte rechts, 5 Projekte mit Nummer, Titel, Text und Tag-Pille |
| 04 Blog | Glas-Karte links, 3 Beitrags-Teaser |
| 05 Kontakt | Glas-Karte, „Lass uns sprechen.“, Buttons E-Mail, GitHub, LinkedIn |
| Footer | © 2026, Impressum (öffnet ein Modal), „nach oben“ |

Jede Sektion ist mindestens bildschirmhoch. Die Glas-Karten haben einen halbtransparenten Hintergrund mit `backdrop-filter: blur(12px)` und Radius 20px.

**3D-Hintergrund:** Ein fixierter WebGL-Hintergrund (three.js) zeigt ein Netz aus Punkten und Linien mit einem Sternenhimmel und Nebeln. Jede Sektion hat einen Knoten mit eigenem Symbol: Kristall, Büste, Treppe, Module, Buch, Papierflieger. Beim Scrollen fliegt die Kamera von Knoten zu Knoten, eine Linie zeigt den zurückgelegten Weg, und die Maus bewegt die Kamera leicht mit. Farbe und Hintergrund folgen Akzentfarbe und Theme.

**Scroll-Verhalten:** Mausrad, Pfeiltasten, Bild-auf/ab und Leertaste springen animiert (1,4 s) von Sektion zu Sektion. Klicks in der Navigation scrollen ebenfalls animiert.

### Beitragsseite „Blogseite“

Kopfbereich mit Zurück-Link, Kategorie, Datum und Lesezeit, Titel und Teaser. Darunter der Artikel mit einem klebenden Inhaltsverzeichnis links, nummerierten Zwischenüberschriften, Code-Block, Zitat, Aufzählung und Tags. Dann „Weiterlesen“ mit zwei Karten, ein Kontakt-Aufruf und der Footer. Ein Lesefortschritts-Balken läuft am unteren Rand des Headers.

### Design-Tokens

- **Dunkel** (Standard): `bg #0e1014`, `field #14171d`, `ink #eef0f4`, `ink2 #c3c8d2`, `ink3 #a3a9b6`, `mute #8b93a3`, `mute2 #7d8596`, `mute3 #6c7383`, `dim #5b6272`, `rule #262a33`, `faint #2c313c`, `hover #151820`
- **Hell**: `bg #f7f8fa`, `field #eef0f4`, `ink #11141a`, `rule #d6dae2` usw. (vollständig in `Portfolio-Netz.dc.html`)
- **Akzent dunkel/soft**: Blau `#4d9fff`/`#8fc2ff`, Türkis `#2fd0c0`/`#82e6db`, Lila `#b89cff`/`#d6c7ff`, Rot `#ff563c`/`#ff8f79`. Im hellen Theme gelten dunklere Varianten (`#1f6fd1` usw.). Für eine freie Farbe wird der Soft-Ton berechnet, indem sie zu 40 % mit Weiß gemischt wird.
- **Schrift**: Google Sans (400–700). Fluid Typography mit `clamp()`, Seitenrand `clamp(20px, 5vw, 64px)`.
- **Speicherung**: Theme und Akzent landen in `localStorage` (`sg-portfolio-theme`, `-accent`, `-hex`). Ohne gespeicherten Wert gilt die Systemeinstellung (`prefers-color-scheme`).

Die Design-System-Dateien `_ds/…/styles.css` und `_ds_bundle.js` waren nicht im Upload. Die Netz-Seite setzt ihre Styles aber fast komplett selbst, sie liefern nur die Font-Variablen. Für die Umsetzung fehlen sie daher nicht.

## 3. Umsetzung in Angular

### Struktur

```
src/app/
  core/
    theme.service.ts        Theme + Akzent als Signals, CSS-Variablen auf <html>, localStorage
    i18n/                   de.ts, en.ts, LanguageService (Sprache aus der URL)
    seo.service.ts          Titel, Description, hreflang, Open Graph je Route
  layout/
    site-header/            Header inkl. Scroll-Zustand und Lesefortschritt
    site-footer/
    imprint-dialog/         Impressum als <dialog>
  features/
    home/
      home.page.ts
      hero/  info-strip/  about/  cv/  projects/  blog-teasers/  contact/
      section-snap.directive.ts   animiertes Springen zwischen Sektionen
    blog/
      post.page.ts          Beitragsseite mit Inhaltsverzeichnis
  shared/
    ui/                     glass-card, section-kicker, pill-button, tag, accent-picker, icon
    three/
      network-scene.ts      Port von network() aus three-ideas.js
      network-background.ts Komponente, lädt three.js erst im Browser
  content/
    posts.generated.ts      wird beim Build aus content/blog erzeugt
content/blog/<slug>.de.md, <slug>.en.md   Beiträge mit Frontmatter
public/images/portrait.webp
public/fonts/                         Google Sans, selbst gehostet
```

### Wichtige Umsetzungsentscheidungen

1. **Styles statt Inline-CSS.** Die Inline-Styles des Prototyps werden zu Komponenten-SCSS. Die Farben werden zu CSS-Variablen (`--bg`, `--ink`, `--acc` …) auf `:root`, die der `ThemeService` setzt. Die Werte übernehme ich exakt aus dem Design.
2. **three.js als npm-Paket** statt vom CDN (unpkg). Nur `network()` wird portiert, und zwar als TypeScript-Klasse mit `setProgress`, `setColor`, `setBg` und `dispose`. Der Prototyp überschreibt kurzzeitig `Math.random`. Das ersetze ich durch einen eigenen Zufallsgenerator mit festem Seed, damit das Netz bei jedem Laden gleich aussieht. Geladen wird die Szene per `afterNextRender` und dynamischem Import. Prerendering und erste Anzeige bleiben dadurch leicht, three.js liegt in einem eigenen Chunk.
3. **Rücksicht auf Gerät und Nutzer.** Bei `prefers-reduced-motion` gibt es kein animiertes Springen und keine Kamerafahrt, nur ein ruhiges Standbild der Szene. Auf Mobilgeräten werden die Sternenhimmel-Schichten reduziert (im Prototyp etwa 24.000 Punkte) und die Pixel-Ratio begrenzt. Ohne WebGL bleibt der normale Hintergrund.
4. **Scroll-Springen** wird eine Direktive auf der Startseite und nur bei Mausrad und Tastatur aktiv. Auf Touch-Geräten wird normal gescrollt.
5. **Sprache über die URL**, damit beide Sprachen vorgerendert und von Suchmaschinen gefunden werden (siehe Frage B). Der Umschalter wechselt die Route. Texte liegen in `de.ts` und `en.ts`, ohne zusätzliche Bibliothek.
6. **Portrait**: Das Bild aus `image-slots.state.json` exportiere ich mit dem dort gespeicherten Ausschnitt als `portrait.webp` und binde es per `NgOptimizedImage` ein. `image-slot.js` wird nicht gebraucht.
7. **Icons** (Sonne/Mond, Brief, Pfeil, GitHub, LinkedIn) als Inline-SVG statt der Material-Symbols-Schrift. Das spart einen ganzen Icon-Font.
8. **Schrift selbst hosten** statt Google Fonts einbinden. Ein Abruf bei Google überträgt die IP-Adresse der Besucher und ist in Deutschland abmahnrelevant.
9. **Blog-Beiträge als Markdown.** Ein kleines Skript (`scripts/build-content.mjs`, läuft vor `ng build`) wandelt die Markdown-Dateien mit Frontmatter (Titel, Teaser, Kategorie, Datum, Lesezeit, Tags) in TypeScript-Daten um, inklusive Inhaltsverzeichnis und Syntax-Highlighting in den Akzentfarben. Jeder Beitrag wird eine vorgerenderte Seite. Den ausformulierten RBAC-Beitrag übernehme ich aus dem Design. Die zwei anderen haben im Design nur einen Teaser (siehe Frage E).

### Routen (vorgerendert)

| Route | Seite |
| --- | --- |
| `/` und `/en` | Startseite |
| `/blog/:slug` und `/en/blog/:slug` | Beitrag |
| `/impressum`, `/datenschutz` | Rechtliches (zusätzlich zum Impressum-Modal aus dem Design) |
| `**` | 404-Seite |

## 4. Schritte

Jeder Schritt ist ein eigener Commit im Conventional-Commit-Format. Du kannst nach jedem Schritt lokal reinschauen.

1. **Grundlagen**: Tokens, Theme- und Akzent-Service, Sprach-Service mit Routen, selbst gehostete Schrift, Icons
2. **Layout**: Header (Scroll-Zustand, Theme- und Sprachumschalter), Footer, Impressum-Dialog
3. **Startseite statisch**: Hero mit Portrait und Farbwähler, Info-Leiste, alle fünf Sektionen als Glas-Karten, ohne 3D
4. **3D-Netz**: `network-scene.ts` portieren, Hintergrund-Komponente, Fortschritt an die Sektionen koppeln, Farbe und Theme durchreichen
5. **Scroll-Springen** und animierte Navigation
6. **Blog**: Content-Skript, Beitragsseite mit Inhaltsverzeichnis, Code-Block, Zitat, Lesefortschritt, „Weiterlesen“
7. **Rechtliches, SEO, 404**: Impressum und Datenschutz als Seiten, Meta-Tags, `sitemap.xml`, `robots.txt`
8. **Tests**: Unit-Tests für die Services (Theme, Akzent-Mischung, Sprache), Playwright-Tests für Startseite und Blog plus Barrierefreiheits-Check mit axe, Screenshot-Vergleich hell/dunkel
9. **Pipeline**: `ci.yml` bekommt `npm test`, `npm run format:check` und die Playwright-Tests. Der Smoke-Test in `deploy.yml` sucht `<app-root` statt `id="app"`, sonst schlägt der erste Deploy fehl. In `wrangler.jsonc` wird `not_found_handling` auf `404-page` umgestellt. `docs/deployment.md` und die PR-Vorlage ziehe ich nach.

## 5. Fragen an dich

| # | Frage | Mein Vorschlag |
| --- | --- | --- |
| A | Die Blogseite ist im Design noch im Stil der Variante „A-Grid“ gebaut: warmes Grau `#1a1918`, Großbuchstaben, sehr fette Schrift. Die Startseite „Netz“ nutzt kühles Dunkelblau und normale Schreibweise. | **Blogseite im Netz-Stil** (Farben, Schrift, Glas-Karten), Aufbau und Elemente wie in `Blogseite.dc.html`. |
| B | Welche Sprache ist Standard? Im Design startet die Netz-Seite auf Englisch, die Texte sind aber deutsch-zentriert. | **Deutsch unter `/`, Englisch unter `/en`.** |
| C | Das Scroll-Springen übernimmt das Mausrad. Das wirkt eindrucksvoll, kann aber nerven und Barrierefreiheit kosten. | **Behalten**, aber nur Desktop mit Mausrad oder Tastatur, aus bei Touch und bei „Bewegung reduzieren“. |
| D | Den Farbwähler im Hero (4 Farben + freie Farbe) auch auf der Live-Seite zeigen? | **Behalten**, er ist ein schönes Detail. Standardfarbe Blau. |
| E | Inhalte, die im Design Platzhalter sind: persönlicher Satz in „Über mich“, E-Mail-Adresse (der Button verlinkt nur `mailto:`), Impressumsdaten (Anschrift), Datenschutzerklärung, Volltexte der Beiträge „Von TYPO3 zu TypeScript“ und „Software an der Maschine“. Außerdem stehen die Projekttitel auch in der deutschen Fassung auf Englisch. | Ich setze klar markierte Platzhalter ein und du lieferst die Texte nach. Die zwei Beiträge ohne Volltext blende ich aus, bis es Text gibt. Projekttitel übersetze ich für DE. |
| F | Docker für den Home-VPS baut mit `node:20`. Angular 22 braucht mindestens Node 22.22.3, der Docker-Build schlägt mit dem neuen Projekt also fehl. | **Im Dockerfile nur `node:20-alpine` auf `node:24-alpine` ändern.** Der Rest bleibt. Braucht dein OK. |
| G | Auf deinem zweiten Screenshot ist das Logo als „stefan.gall“ in Code-Schrift mit kleingeschriebener Navigation zu sehen und durchgestrichen. | **„Stefan Gall“ in normaler Schrift** mit normaler Navigation wie in `Portfolio-Netz.dc.html`. |

Sobald du den Plan freigibst (gern mit Antworten auf A–G), setze ich die Schritte 1–9 nacheinander auf diesem Branch um. Einen PR öffne ich erst, wenn du es sagst.
