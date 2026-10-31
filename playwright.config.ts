import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;

/**
 * End-to-End-Tests gegen den fertigen Build in dist/ (vorher npm run build).
 * Screenshot-Vergleiche (@visual) laufen im Playwright-Docker-Image, damit lokale Läufe und CI
 * dieselbe Schriftdarstellung haben: npm run e2e:visual bzw. npm run e2e:visual:update.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}-{platform}{ext}',
  expect: {
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.002 },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Lokal kann ein installierter Browser genutzt werden statt eines Downloads: PW_CHANNEL=chrome
    channel: process.env['PW_CHANNEL'] || undefined,
    trace: 'retain-on-failure',
    // WebGL ohne GPU (Headless): Software-Rendering über SwiftShader
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
  },
  webServer: {
    command: `node scripts/serve-dist.mjs ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env['CI'],
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      grepInvert: /@mobile/,
    },
    {
      // Touch-Gerät: nur Tests, die ausdrücklich mobil gelten
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      grep: /@mobile/,
    },
  ],
});
