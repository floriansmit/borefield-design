# Development and hosting

The application is a static browser app. Node.js 22 or later is recommended; there are no npm dependencies to install.

```sh
npm test
npm run dev
```

Open `http://localhost:4173/borefield-design/`. `npm run build:pages` produces `_site/`, which can be served by any static HTTP(S) host. Opening the HTML through `file://` will not support the module, worker and remote-data features.

## GitHub Pages

The repository’s `.github/workflows/pages.yml` runs the deterministic physics, geology/API, economics and Pages-path checks. Pushes to `main` build and deploy the site; pull requests test and build without deploying. The repository’s Pages source must be **GitHub Actions**.

## Browser data access

The Pages build copies `worker/api.mjs` to `browser-api.mjs` and reuses it for direct CORS-enabled PDOK and TNO requests. GitHub Pages does not expose server `/api/*` endpoints. See [the API/method documentation](../public/api-docs.html) for the optional server handler’s interface and column-conversion rules. No ChatGPT Sites backend is required by this edition.

Public services and their CORS policies can change or become unavailable. Failed requests are reported; existing geology remains in place.

## Python checks

The browser runtime uses Pyodide 0.27.7 and pygfunction 2.3.1. For additional native Python reference checks, install the pinned package in a suitable Python environment:

```sh
python -m pip install pygfunction==2.3.1
python test-kernel.py
python test-pipes.py
```

The default `npm test` suite does not run these additional Python scripts.

## Documentation screenshots

The screenshots in `screenshots/` were captured from the live tool using its illustrative sand-over-clay profile, 22,000 kWh/year heat demand, 10 kW peak, 25-year horizon and infinite-line-source ground engine. The search covered 120–320 m in 20 m steps, up to three boreholes, with single-U/coaxial comparison. They show a specific scenario, not measured installation performance.
