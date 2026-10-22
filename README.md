# Borefield Design — GitHub Pages edition

An open-source borehole heat-pump design explorer. Compares single/double U-tube and coaxial exchangers, finite-length pygfunction ground models, layered-geology screening, lifetime brine temperatures, and costs against gas heating.

## Publish to GitHub Pages

1. Commit this complete project at the root of `floriansmit/borefield-design` on branch `main`.
2. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Open **Actions → Test and deploy GitHub Pages → Run workflow** if the initial push has already completed before enabling Pages.
4. After the deployment succeeds, the expected URL is `https://floriansmit.github.io/borefield-design/`. This URL is not live until GitHub reports a successful deployment.

The workflow tests and builds the app, then deploys `_site/`. Pull requests run tests/build only. If your default branch has a different name, update `pages.yml` before publishing. Ordinary GitHub Pages sites are publicly accessible; private-repository eligibility depends on your GitHub plan.

## What works without a backend

All numerical calculations run locally in the browser. pygfunction 2.3.1, NumPy and SciPy run through Pyodide 0.27.7; the Python runtime downloads on first advanced calculation. Address lookup calls PDOK directly. REGIS columns are fetched from TNO OPeNDAP directly and converted using the exact same `worker/api.mjs` logic as the original hosted edition. Dutch WKO overlays query the public ArcGIS service. These services currently expose cross-origin access; their availability and CORS policies remain external dependencies. No original ChatGPT Sites deployment is required.

The GitHub Pages edition does not publish server `/api/*` endpoints. The optional server handler remains in `worker/api.mjs` for reuse, and the Pages build copies it to `browser-api.mjs`. Source and API documentation reflect this distinction.

## Run locally

Node.js 22 or later is recommended. There are no npm dependencies to install.

```sh
npm test
npm run dev
```

Open `http://localhost:4173/borefield-design/`. For a static production build, run `npm run build:pages` and serve `_site/` with any HTTP host. Do not open `index.html` through a `file://` URL: workers, module loading and remote data requests require HTTP(S).

Application licence: MIT (`LICENSE`). Third-party licences and data attribution remain in `public/THIRD_PARTY_NOTICES.txt` and the app. Map records are neither bundled nor relicensed.

---

## Model documentation

# Borefield Explorer v0.4
MIT application, browser-based closed-loop brine/water heat-pump screening and preliminary borefield comparison.

## Run
Node 20+ (Node 22+ recommended), no npm dependencies:

    npm run dev

Open http://localhost:4173. `npm test` runs deterministic physics/API tests. `npm run build` produces a Worker ESM with embedded assets in dist/server/index.js. Hosting identity is deliberately omitted from the source download; add your own deployment manifest as appropriate. To build from the source download, create `.openai/hosting.json` containing `{ "d1": null, "r2": null }`.

`public/kernel.py` uses actual pygfunction 2.3.1. Browser runtime is Pyodide 0.27.7, NumPy 2.0.2, SciPy 1.14.1, SecondaryCoolantProps 1.3. Browser kernels are cached per geometry/properties. Installation errors are shown; there is no fallback disguised as pygfunction.

For native Python checking:

    python -m pip install pygfunction==2.3.1
    python test-kernel.py

## Important model limits
Both ILS and pygfunction use equivalent homogeneous ground properties averaged over the drilled length. The advanced engines resolve finite borehole length and mutual response, but not explicit geological layer heat transfer, groundwater advection, detailed pipe temperatures or hydraulics. They use a lumped supplied borehole resistance. A fixed 1 m buried top depth applies to the pygfunction line source (modeled source length = entered depth). Thus “depth” is an active-length approximation; the additional buried top metre is not separately costed.

Heat-pump performance uses a Carnot approximation with fixed approaches; not a manufacturer map. Monthly equal-duration loads and a short peak pulse, heating only. Final-year SPF and yearly predicted electricity used in NPV. Cost search covers equal-depth rectangular fields only. Site/permit constraints, subsidies and residual value not included. Do not use as an unverified installation design.

## Geological source
REGIS service reads only a 132-unit column from TNO's official OPeNDAP dataset, not entire national grids. All queries are fixed-origin and validated; this is not an arbitrary proxy. See public/api-docs.html. REGIS surfaces are NAP elevations, and are explicitly converted to below-ground depths. Thermal values are not delivered by REGIS. Regional model resolution is 100 m.

Presets: GEUS Ditlefsen et al. (2014), conductivity means and sample ranges, plus explicitly identified interpretive values. Heat capacity is separately labelled as illustrative mixture estimates. Comparable Dutch lithologies use the same screening analogues, not a claim of measured Dutch national defaults.

## Currency
Canonical money inputs are EUR. DKK display converts every monetary field and result using an editable planning rate (7.46 initially), not a live quote. JSON schema v2 stores canonical EUR plus display preference; v0.1 DKK files are converted on import using 7.46.


## Comparisons and household demand
Editable custom layouts (up to six, each 1–8 holes and 30–600 m) run through the selected engine alongside the search grid. The A/B comparison dropdowns can select any calculated design, including flagged infeasible layouts. Ground coverage is checked against all requested depths; there are no hardcoded reference evaluations.

Gas comparison uses identical delivered annual heat and the entered boiler efficiency. Initial CAPEX, energy tariff, gas standing charge, maintenance and component replacement costs are explicit editable assumptions, not quotations. Heat-pump maintenance/replacement enter both optimized NPV and comparison NPV. Borefield replacement is not assumed. Replacement payments occur at interval boundaries strictly before the terminal year. Discounted and undiscounted real cumulative costs are separate; all inputs are real. A sustained break-even is the first year after which HP cumulative cost remains no higher than gas through the horizon. Existing-boiler scenarios can set upfront gas CAPEX to zero. Avoidable gas standing charge should be zero when a gas connection is retained.

Demand estimator offers floor area × specific design heat loss / 30 K and degree days, or annual gas consumption corrected for other use and seasonal efficiency. Hot-water heat is estimated from occupants, litres and temperature rise; annual space heat and design peak load are distinguished. Inputs are illustrative; no local weather dataset or energy-label certification is inferred. The estimator never claims to replace room-by-room heat-loss design.


## Live lithology log
The ground-profile editor includes a live true-depth 1D borehole column, a depth ruler and an interval/colour-key table. Units retain their REGIS codes. Unclassified intervals use hatching; all colour assignments are illustrative rather than an official stratigraphic legend. Editing, adding, removing, loading or importing layers redraws the column. Selecting a column unit focuses its editor. Invalid depth ordering shows an input message rather than a misleading column.


## Economic input precision and exchanger construction
Economic controls display three decimal places (whole-year intervals remain integers). Full numeric values are retained for calculations and currency conversion until edited.

Calculated construction modes use actual pygfunction SingleUTube, MultipleUTube (two parallel circuits), or Coaxial models. Compare mode calculates single U-tube and coaxial for every candidate layout, preserving construction identity throughout selection, plots and exports. Inputs include dimensions, conductivities, grout, fluid mass flow and fixed bulk brine properties. Effective Rb incorporates the pipe model's axial thermal short-circuiting, then couples to the selected field-average ground response. This is an effective-resistance reduction, not a fully coupled segmented ground/pipe simulation.

Coaxial flow is inner down/annulus up. Convection uses pygfunction correlations. Circuit pressure uses circular Darcy friction and an exact laminar concentric-annulus formula, with a 2300–4000 Reynolds transition and hydraulic-diameter turbulent approximation. The entered additional header/heat-pump pressure is added once per circuit; no static lift is added to a closed loop. Pump power is pressure × total volumetric flow / wire-to-water efficiency, and annual pump energy uses user-entered hours. It replaces the percentage electricity allowance. Loop delta-T is calculated from ground extraction / (mass flow × cp), replacing the fixed manual delta-T. Pump heat is not credited to useful output. Loop installation cost is per drilled metre and additional to drilling cost. Fluid properties, flow and pump hours are not temperature/control dependent.

Manual mode preserves the former user-supplied Rb, delta-T and pumping allowance. Older input files without construction settings load in manual mode. New input files save pipe geometry and construction selection. Validate supplied fluid, pipe and grout data against the proposed installation; defaults and prices are illustrative.


## Workspace navigation
Model setup and Results are separate accessible tabs. All panels stay mounted to retain input values and result selections. Setup uses the full width, pairs the map with location controls, and places a true-depth geology log beside a bounded, scrollable layer editor. Ground/exchanger settings have their own card. Input save/load and gas/maintenance assumptions are in setup. Calculations start explicitly, open Results with progress, and preserve old results when rerunning. Input changes are marked as stale. Tabs support Left/Right, Home and End keyboard navigation; map size is refreshed when returning to setup.

Monthly delivered heat is entered in twelve named kWh fields with annual percentage shares. Editing a month updates annual demand; editing annual demand rescales the existing monthly distribution. Seasonal/equal presets, saved legacy weight profiles and the house estimator populate the same editor.

The location map offers live Dutch open-system, closed-system and groundwater-abstraction overlays from the public WKO_service_public_view ArcGIS service (RVO / LGR / BIJ12). Queries are restricted to the visible extent at zoom 12+, filter installation status IN_GEBRUIK, paginate in batches of 500, and stop at 2,000 features per layer with a zoom-in notice. Requests are cancelled on navigation and time out after 20 seconds. These third-party records are not bundled or relicensed under the application's MIT licence. Registration is incomplete and locations may be approximate; overlays are context only and do not feed the thermal or permitting calculations.

Technical setup fields have keyboard- and touch-accessible question-mark help dialogs with definitions, illustrative starting values, model effects and references. Guidance is also attached to dynamically added geology layers and custom designs. Example costs are explicitly labelled as allowances rather than current quotes.
