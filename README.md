# NutriGator

A nutrition tracking frontend with a welcome/sign-in page and a home dashboard inspired by the supplied fitness dashboard reference: white cards, a light background, cyan and coral accents, and a simple sidebar.

## Run the frontend

Use Node.js 22.12 or newer. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend runs without a database or environment variables. Fonts are bundled locally.

Choose **Take a look around**, or use these public demo credentials:

| Email | Password |
| --- | --- |
| `demo@nutrigator.app` | `Track2026!` |

The demo includes login validation, show/hide password, a session that survives reloads in the same tab, sign-out, and responsive navigation. The overview links to sample food diary and goals views. The water card can add glasses up to its sample daily target; this interaction resets when the dashboard reloads.

**Authentication is a frontend demo.** The existing Express server has no authentication endpoint. The demo credentials are public fixtures, and the browser session flag is not an authentication boundary. No passwords are stored. Registration, real user login, calorie calculations, and saved food logging still need backend integration. Do not use real account credentials in this preview.

## Checks

```sh
npm run lint
npm run build
npx playwright install chromium
npm test
```

Playwright starts the frontend automatically. Ten browser scenarios run in desktop Chromium and Pixel 7 mobile emulation (20 checks), including automated WCAG A/AA checks with axe. `npm run build` also type-checks application code, test code, and configuration. Automated accessibility checks do not replace a manual accessibility audit.

```sh
npm run test:ui
npm test -- --project=desktop-chromium
npx playwright show-report client/playwright-report
```

The layout test captures login and dashboard screenshots under `client/test-results/`. Failure traces and the HTML report are generated locally and excluded from Git. GitHub Actions runs lint, build, and browser tests for frontend changes.

The [test-case table](docs/test-cases.md) follows the supplied spreadsheet columns and maps the implementation to SP1-1, SP1-4, and SP1-5. It also records the unimplemented SP1-2 and SP1-3 cases separately.

## Structure

- `client/`: React, TypeScript, and Vite frontend; styles and local font imports in `client/src/`.
- `client/tests/login.spec.ts`: browser tests for login, validation, sessions, navigation, layout, and accessibility.
- `docs/test-cases.md`: reproducible manual test cases and automated coverage.
- `server/`: existing Express/PostgreSQL scaffold, managed separately with its own package and lockfile. Root npm commands target the frontend workspace.
