# Borefield Explorer

**From a building’s heat demand and local geology to a comparison of borehole layouts, heat-pump performance and lifetime costs.**

Borefield Explorer is an open-source, browser-based tool for screening closed-loop ground-source heat-pump systems. Explore whether one deep borehole or several shallower holes offer a better balance of brine temperatures, drilling costs and operating costs—and compare U-tube and coaxial constructions using the same assumptions.

**[Try the live tool →](https://floriansmit.github.io/borefield-design/)** · [Methods and data](public/api-docs.html) · [MIT licence](LICENSE)

![Results overview showing the lowest-cost feasible candidate, seasonal performance and minimum brine temperature](docs/screenshots/results.jpg)

*Illustrative 25-year calculation with 22,000 kWh/year delivered heat and an editable sand-over-clay profile. Results depend on the inputs and search bounds; the screenshots are examples, not installation recommendations.*

## What you can explore

- **Borehole depth and count:** search combinations of equal-depth boreholes and rank temperature-feasible candidates by discounted lifetime cost. Add custom layouts outside the search grid, such as **1 × 285 m versus 2 × 180 m**.
- **Heat-exchanger construction:** compare **single U-tube, double U-tube and coaxial** designs. Calculated modes account for pipe geometry, grout and brine properties, effective borehole resistance, circuit pressure losses, circulation electricity and installed loop cost. A manual resistance mode is also available.
- **Building heat demand:** enter annual delivered heat and peak heating load, or estimate them from floor area, heat loss and degree days, or a measured gas bill. Edit twelve named monthly heat demands in kWh; monthly totals and annual demand stay linked.
- **Ground conditions:** build an editable geological column with layer depths, lithology, thermal conductivity, volumetric heat capacity and drilling rates. Presets include typical Dutch/Danish lithologies with editable thermal starting values and evidence notes.
- **Location context:** select a map pin, enter coordinates or search a Dutch address. Preview and import a **TNO REGIS II** hydrogeological column, then review the inferred lithologies and any unclassified intervals.
- **Nearby registered systems:** switch on Dutch **open-system, closed-system and groundwater-abstraction overlays** from the public WKO/LGR service. Click markers for available registry details.
- **Lifetime performance and economics:** inspect brine temperatures across the project life, compare selected designs, and evaluate energy bills, maintenance and replacements against a gas-boiler reference.

The interface is available in **English and Dutch**. Use the language selector beside EUR/DKK; your choice is remembered in the browser. Labels, technical explanations, geology and result charts follow the selected language. Saved JSON inputs keep the same language-independent schema.

Technical inputs have **“?” explanations** with definitions, illustrative starting values and their effect on the calculation. Financial inputs and outputs support **EUR and DKK**, using an editable conversion rate.

## Geology you can see and edit

The 1D borehole column displays lithology colours and contacts on a true depth scale alongside the layer editor. Use a manually defined profile anywhere, or start with a Dutch REGIS import. Thermal properties remain editable because REGIS supplies hydrogeological geometry, not measured thermal conductivity or heat capacity.

![Depth-scaled lithology column beside editable sand and clay layers with thermal properties and drilling rates](docs/screenshots/geology.jpg)

The preset catalogue draws on GEUS thermal-property information for comparable lithologies. Heat-capacity defaults are separate engineering estimates. Unclassified REGIS units and gaps are identified for review rather than silently replaced with invented geology.

## Compare investment and running costs

Choose the two designs you want to compare. The results show initial **CAPEX**, first-year **OPEX**, and **cumulative lifecycle costs** against gas heating. Switch between discounted costs and undiscounted real costs; adjust energy tariffs, maintenance, equipment replacement intervals and avoidable gas standing charges.

![Cumulative discounted costs for two borefield designs and a gas-boiler reference across 25 years](docs/screenshots/economics.jpg)

The comparison also reports lifetime savings relative to gas and a sustained break-even year where one exists within the model horizon. Infeasible designs remain clearly labelled. Costs are scenario inputs, not live market quotations; subsidies and residual value are excluded.

## Follow brine temperatures through the system’s lifetime

Inspect a selected design’s cold supply and warm return temperatures month by month, or switch to an annual envelope. The plot includes the annual peak cold temperature and the chosen minimum-temperature limit, making seasonal cycling and long-term thermal drift visible.

![Monthly cold and warm brine temperatures, annual peak cold temperatures and the minimum-temperature limit over 25 years](docs/screenshots/temperatures.jpg)

The results include annual electricity use and seasonal performance factors with circulation electricity. Export temperature histories, candidate results and annual cost series as CSV; save and restore model inputs as JSON.

## A simple workflow

1. **Define demand:** enter measured heat demand or use the house estimator, then review peak load and the monthly distribution.
2. **Describe the site:** choose a location, import or enter geology, and check thermal properties and drilling costs.
3. **Choose the equipment and search:** select a heat exchanger, ground-response model, depth/count range, temperature limit and economic assumptions.
4. **Compare results:** inspect feasible designs, compare specific alternatives, review lifetime temperatures and test sensitivity to uncertain inputs.

## Calculation methods and scope

| Component | Approach |
| --- | --- |
| Ground thermal response | Fast infinite line source, or **pygfunction 2.3.1** finite-length g-functions with uniform borehole wall temperature (UBWT) or uniform heat extraction rate (UHTR) |
| Exchanger performance | pygfunction pipe models for U-tube/coaxial effective thermal resistance; simplified hydraulic losses and pumping electricity |
| Heat-pump performance | Iterated Carnot-based COP approximation with fixed temperature approaches, coupled to ground extraction |
| Heat loads | Twelve equal-duration monthly load steps repeated over the project life, plus an annual short-duration peak pulse |
| Economics | Depth-dependent drilling and loop costs, equipment/setup costs, annual electricity, maintenance and scheduled replacements; real discount and escalation rates |
| Execution | JavaScript calculations and a background worker; Python, NumPy, SciPy and pygfunction run locally in the browser through **Pyodide** |

No Python installation or calculation server is required. The Python runtime downloads on first use of a calculated pipe model or pygfunction ground engine. Address search, geology and map overlays depend on external public data services.

**This is a screening and preliminary comparison tool.** Geological layers are used to derive equivalent ground properties averaged over the drilled length; none of the ground engines resolves explicit layered heat transport or groundwater advection. A fixed buried-top-depth approximation is used for finite line sources. Heat-pump manufacturer performance maps, compressor capacity, backup heating, cooling/regeneration and detailed control schedules are not modelled. Circuits use simplified, constant brine properties and balanced flow assumptions.

The cost search only covers the specified equal-depth layout grid. Property boundaries, drilling access, permitting constraints and thermal effects from neighbouring registered systems are not automatically enforced. Verify site properties, supplier data, hydraulics and applicable requirements before using a result to select an installation.

## Open source and development

Application code is **MIT licensed**. pygfunction, Leaflet and other dependencies retain their own licences; see [third-party notices](public/THIRD_PARTY_NOTICES.txt). Geological and map services retain their source attribution and terms, and registry coverage may be incomplete.

For local development, testing and optional hosting details, see [the development guide](docs/development.md).
