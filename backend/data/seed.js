// FILE: backend/data/seed.js
// Static reference data. The app is stateless — there is no database — so the
// demo tenant, companies, and sample products live here as plain constants.
// `/auth/login` issues a guest seat in DEFAULT_COMPANY_ID; the sample products
// are what judges pick from on the landing page.

export const DEFAULT_COMPANY_ID = 'demo';

export const COMPANIES = [
  { id: 'boltleap', name: 'BoltLeap Energy', sector: 'battery', hq_city: 'Hefei, China' },
  { id: 'demo', name: 'Demo Sample Library', sector: 'consumer', hq_city: 'Shanghai, China' },
  { id: 'skywalker', name: 'Skywalker Robotics', sector: 'robotics', hq_city: 'Shenzhen, China' },
];

export const SAMPLE_PRODUCTS = [
  {
    id: 'sample_battery_nmc',
    company_id: 'demo',
    name: 'BoltLeap BL-200 NMC811 prismatic cell',
    category: 'battery_cell',
    target_country: 'EU',
    spec: {
      name: 'BL-200 NMC811 prismatic cell',
      category: 'battery_cell',
      target_country: 'EU',
      manufacturer_hq: 'Hefei, China',
      materials: 'NMC811 cathode (LiNi0.8Mn0.1Co0.1O2), graphite anode, LiPF6 electrolyte in EC/DMC, polyolefin separator, aluminum casing',
      electrical: 'Nominal voltage 3.65 V, capacity 200 Ah, energy 730 Wh, continuous discharge 1C, peak 3C, working temp -20 to 55°C',
      battery: 'Format: prismatic 173×200×72mm; weight 4.1 kg; cycle life >2000 cycles at 80% DoD; pack-level energy density ~180 Wh/kg',
      existing_certs: 'GB/T 31485 (China), UN 38.3, IEC 62133-2 (cell level, BoltLeap lab)',
      annual_eu_volume: '120,000 cells (60 MWh)',
      notes: 'Targets European OEM PSA / Stellantis tier-1 packaging integrators. No EU office yet.',
    },
  },
  {
    id: 'sample_humanoid_h1',
    company_id: 'demo',
    name: 'Skywalker H1 humanoid robot',
    category: 'humanoid_robot',
    target_country: 'EU',
    spec: {
      name: 'Skywalker H1 humanoid robot',
      category: 'humanoid_robot',
      target_country: 'EU',
      manufacturer_hq: 'Shenzhen, China',
      materials: 'Aluminum 6061-T6 chassis, carbon-fiber composite limbs, neodymium magnet servos, LiPo battery pack',
      electrical: '48 V DC bus, 2 kW peak, BLDC servos (×28), onboard Wi-Fi 6 + 5G modem, depth + RGB cameras, microphone array',
      battery: '48 V, 600 Wh removable LiPo pack; runtime ~2 h walking',
      existing_certs: 'CCC (China), FCC Part 15 (US), no EU testing yet',
      annual_eu_volume: '500 units (pilot programs)',
      notes: 'AI on-device perception + cloud-tuned LLM control. Customers: logistics warehouses, hotels in Europe.',
    },
  },
];

export const COMPANY_BY_ID = new Map(COMPANIES.map((c) => [c.id, c]));
export const SAMPLE_BY_ID = new Map(SAMPLE_PRODUCTS.map((p) => [p.id, p]));

export function nowSec() {
  return Math.floor(Date.now() / 1000);
}
