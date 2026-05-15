// FILE: backend/seed.js
// Idempotent seed: one demo company (BoltLeap Energy, fictional Series B
// battery cell maker), an admin user, and two sample products judges can pick
// from on the landing page (cathode-NMC EV battery cell + humanoid robot).
import db, { nowSec } from './db.js';

const upsertCompanyStmt = db.prepare(
  `INSERT INTO companies (id, name, sector, hq_city, created_at)
   VALUES (?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET name = excluded.name, sector = excluded.sector`
);
const upsertUserStmt = db.prepare(
  `INSERT INTO users (id, company_id, email, display_name, role, created_at)
   VALUES (?, ?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET company_id = excluded.company_id, role = excluded.role`
);
const upsertProductStmt = db.prepare(
  `INSERT INTO products (id, company_id, name, category, spec, target_country, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)
   ON CONFLICT(id) DO UPDATE SET spec = excluded.spec`
);

const now = nowSec();

// Demo tenant: companies the user "is" when logging in as guest.
upsertCompanyStmt.run('boltleap', 'BoltLeap Energy', 'battery', 'Hefei, China', now);
upsertCompanyStmt.run('demo', 'Demo Sample Library', 'consumer', 'Shanghai, China', now);
upsertCompanyStmt.run('skywalker', 'Skywalker Robotics', 'robotics', 'Shenzhen, China', now);

upsertUserStmt.run('admin_001', 'boltleap', 'admin@boltleap.cn', 'Admin', 'admin', now);

const products = [
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

for (const p of products) {
  upsertProductStmt.run(p.id, p.company_id, p.name, p.category, JSON.stringify(p.spec), p.target_country, now);
}

console.log('[seed] WestPort.ai seed complete.');
console.log('  companies:', db.prepare('SELECT COUNT(*) AS c FROM companies').get().c);
console.log('  products :', db.prepare('SELECT COUNT(*) AS c FROM products').get().c);
console.log('  users    :', db.prepare('SELECT COUNT(*) AS c FROM users').get().c);
