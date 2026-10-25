# Brine pump profiles

Facts independently transcribed from manufacturer documents; checked 25 October 2026. Exact variants and document revisions are stored in `public/pump-catalog.js`, with source URLs visible in the interface and saved profile IDs in JSON. No claim of market-share ranking is made.

- NIBE S1256-8/-13/-18: red 100% brine-side external available-pressure diagrams, IHB EN 2023 p.33. Approximate chart readings; 3 kPa screening margin subtracted. These are not minimum operating-flow limits.
- Bosch Compress 7800i LW 6/8/12/16 M/MF: 6721844021, September 2025 p.42. Propylene glycol with −15 °C freeze protection. Only the interval between published radiator and floor-heating flows is represented, using the lower available pressure throughout. It is a conservative screening envelope, not a full curve.
- Viessmann Vitocal 333-G BWT 331.C06/C12 SC: 5837959 DK p.4; 300-G BWC 301.C06/C12/C16 SC: 6152914 DK April 2021 p.3. Constant nominal available pressure between published minimum and nominal flow. No extrapolation to higher flows.
- Vaillant flexoTHERM VWF 57/87/117/157/197 /4, 400 V: 0020213394_05 January 2023 p.69. Ethylene glycol 30 vol.%; nominal residual pressure conservatively held constant inside the stated continuous-operation min/max flow range.
- Stiebel Eltron WPE-I 07.1/12.1 Plus H/HW 230/400 V: 367753-47001-0030 p.26. Isolated verified heat-source flow/available-pressure points; hPa converted to kPa. No inferred full curve.
- alpha innotec WZSV 62H3M/92H3M/122H3M: 83056900kUK pp.24–25. Isolated free-pressure points; bar converted to kPa and l/h to m³/h. K cooling versions differ and are not represented.
- Ecoforest: official ecoGEO+ B/C 4–16 PRO 2024 data sheet identified. No external available-pressure curve verified. Older quoted ecoGEO 4–16 variant unconfirmed. Both remain blocked for manufacturer hydraulic verification until a supplier curve is entered through Custom.

## Boundaries and uncertainty

Pressure is external available differential pressure, never static fill pressure. Parallel boreholes share head; total field flow is summed. Enter external headers, valves and other losses in shared pipe settings without counting internal losses twice. Published fluid conditions may differ from manually entered density/viscosity: selecting a profile does not automatically change fluid properties or correct the curve. Screening profiles must be checked against the exact installed unit and fluid.

Selecting a manufacturer does not validate compressor capacity, minimum compressor modulation, backup heat, control behavior, or a full temperature-dependent operating envelope. Only explicitly recorded source temperature bounds are checked against the modeled warm/incoming brine temperatures. Financial pump consumption remains the existing hydraulic estimate with user efficiency/hours, not manufacturer speed-dependent total electrical input.

Restricted ranges may reject genuinely feasible designs outside the verified domain; such rejection means outside the supported data, not proof the physical pump cannot operate there. No-flow candidates are reported separately.
