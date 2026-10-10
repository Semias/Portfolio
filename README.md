# Stefan Gall's portfolio

Angular 21 portfolio using standalone components, signals, lazy routes, SCSS, and Vitest.

## Local development

Use Node.js 22.12 or newer in the Node 22 release line and npm 11.
Run `npm ci`, then `npm start`. Open http://localhost:4200.
On Windows, use `npm.cmd` if PowerShell blocks the npm script.

## Checks

- `npm run build`: production build; browser files are generated in `dist/portfolio-angular/browser`.
- `npm test -- --watch=false`: unit and routing tests.
- `npx playwright install chromium`: install the browser once.
- `npm run test:e2e`: browser accessibility, mobile overflow, navigation, and theme checks.
- `npm audit`: dependency security report.

The quality workflow runs these checks on pushes and pull requests.
Automated axe checks cover WCAG A/AA rules on every route in light/dark themes at mobile and desktop widths. Manual assistive-technology review is still useful.

## Structure

- `src/app/pages`: lazy-loaded page components and the unknown-route page.
- `src/app/shared/components/header`: responsive navigation and theme control.
- `src/app/shared/services/theme.service.ts`: validated saved preference with system fallback.
- `src/styles.scss`: theme colors, focus indicators, and reduced-motion support.
- `public`: static assets.
- `e2e`: Playwright and axe browser checks.

About, Projects, CV, and Contact content remains intentionally unchanged pending owner-provided content.
Route titles live in `app.routes.ts`; the default description is in `src/index.html`.

## Deployment

The existing Azure deployment workflow is unchanged. Its output path and SPA fallback configuration still need the separately deferred deployment review.
