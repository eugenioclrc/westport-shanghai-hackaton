// Pre-baked sample report so judges can see a finished roadmap instantly,
// with zero backend / AI dependency and no ~90s wait. Loaded from the
// landing page via openSampleReport(). Shapes mirror what Running.svelte's
// SSE stream and the backend orchestrator would produce.
import { screen, currentProduct, lastReport, agentState } from './store.js';

export const sampleProduct = {
  name: 'BL-200 NMC811 Prismatic Battery Pack',
  category: 'battery_pack',
  target_country: 'DE',
  manufacturer_hq: 'Hefei, China',
};

const chemicalsFindings = [
  {
    severity: 'high',
    regulation: 'REACH (EC) 1907/2006',
    citation: 'Annex XVII + Candidate List',
    requirement: 'No SVHC above 0.1% w/w without notification; SCIP dossier filed.',
    gap: 'LiPF6 electrolyte additives not screened against the Candidate List.',
    recommendation: 'Run a full-material declaration and submit the SCIP dossier.',
    estimated_cost_eur: 8000,
    estimated_weeks: 4,
  },
  {
    severity: 'medium',
    regulation: 'RoHS 2 (2011/65/EU)',
    citation: 'Annex II',
    requirement: 'Pb/Cd/Hg/Cr(VI) within limits; CE-marked Declaration of Conformity.',
    gap: 'No RoHS test report on the BMS PCBA or solder joints.',
    recommendation: 'Commission IEC 62321 testing on the electronics.',
    estimated_cost_eur: 4000,
    estimated_weeks: 3,
  },
  {
    severity: 'medium',
    regulation: 'EU Battery Regulation 2023/1542',
    citation: 'Art. 6 / Annex I',
    requirement: 'Restricted-substance limits and a hazardous-substance dossier.',
    gap: 'Cobalt and nickel supply-chain substances are undocumented.',
    recommendation: 'Compile the substance dossier with supplier declarations.',
    estimated_cost_eur: 5000,
    estimated_weeks: 4,
  },
];

const electricalFindings = [
  {
    severity: 'high',
    regulation: 'IEC 62619 / IEC 62133-2',
    citation: 'Cell and pack safety',
    requirement: 'Accredited type-test report at pack level required before CE.',
    gap: 'Only cell-level testing exists; no EU-recognised pack-level safety test.',
    recommendation: 'Book pack-level safety testing at a notified laboratory.',
    estimated_cost_eur: 14000,
    estimated_weeks: 6,
  },
  {
    severity: 'medium',
    regulation: 'EMC Directive 2014/30/EU',
    citation: 'Annex II / III',
    requirement: 'Emissions and immunity testing plus a Declaration of Conformity.',
    gap: 'BMS not tested to EN 55032 / EN 55035.',
    recommendation: 'Run an EMC test campaign on the BMS.',
    estimated_cost_eur: 6000,
    estimated_weeks: 3,
  },
  {
    severity: 'low',
    regulation: 'UN 38.3',
    citation: 'Tests T1–T8',
    requirement: 'Transport safety certification at the assembled-pack level.',
    gap: 'UN 38.3 certified at cell level only.',
    recommendation: 'Extend UN 38.3 coverage to the assembled pack.',
    estimated_cost_eur: 1500,
    estimated_weeks: 1,
  },
];

const carbonFindings = [
  {
    severity: 'high',
    regulation: 'EU Battery Regulation 2023/1542',
    citation: 'Art. 7 + Art. 77 (Digital Product Passport)',
    requirement: 'Carbon-footprint declaration and a Digital Product Passport.',
    gap: 'No life-cycle assessment or carbon-footprint study exists.',
    recommendation: 'Commission an ISO 14067 LCA and build the DPP data model.',
    estimated_cost_eur: 12000,
    estimated_weeks: 8,
  },
  {
    severity: 'medium',
    regulation: 'EU Battery Regulation 2023/1542',
    citation: 'Art. 48–53',
    requirement: 'Documented supply-chain due-diligence policy, third-party audited.',
    gap: 'No due-diligence policy is in place.',
    recommendation: 'Draft the policy and schedule a third-party audit.',
    estimated_cost_eur: 7000,
    estimated_weeks: 5,
  },
  {
    severity: 'medium',
    regulation: 'WEEE 2012/19/EU',
    citation: 'EPR + recycled content',
    requirement: 'EPR registration in Germany and documented recyclate content.',
    gap: 'No EPR registration in DE; recyclate percentage unknown.',
    recommendation: 'Register with stiftung ear and document recycled content.',
    estimated_cost_eur: 4500,
    estimated_weeks: 4,
  },
];

export const sampleReport = {
  score: 58,
  summary:
    'BL-200 is close to EU-ready but blocked on accredited pack-level safety testing and the carbon-footprint declaration required by the EU Battery Regulation 2023/1542. The chemicals and electrical pathways are well-scoped; the largest gaps are the Battery Regulation carbon-footprint and Digital Product Passport obligations and a notified-body safety test. With the eight prioritized actions below, a first EU shipment is realistic in about 10 weeks.',
  cost: 62000,
  weeks: 10,
  actions: [
    { priority: 1, title: 'Book accredited pack-level safety testing', regulation: 'IEC 62619 / CE', weeks: 6, cost_eur: 14000 },
    { priority: 2, title: 'Commission an ISO 14067 carbon-footprint LCA', regulation: 'Battery Reg 2023/1542 Art. 7', weeks: 8, cost_eur: 12000 },
    { priority: 3, title: 'Full-material declaration + REACH/SCIP screening', regulation: 'REACH (EC) 1907/2006', weeks: 4, cost_eur: 8000 },
    { priority: 4, title: 'EMC test campaign for the BMS', regulation: 'EMC Directive 2014/30/EU', weeks: 3, cost_eur: 6000 },
    { priority: 5, title: 'Draft supply-chain due-diligence policy', regulation: 'Battery Reg Art. 48–53', weeks: 5, cost_eur: 7000 },
    { priority: 6, title: 'Register EPR + document recyclate content', regulation: 'WEEE 2012/19/EU', weeks: 4, cost_eur: 4500 },
    { priority: 7, title: 'RoHS IEC 62321 test report for electronics', regulation: 'RoHS 2 (2011/65/EU)', weeks: 3, cost_eur: 4000 },
    { priority: 8, title: 'Compile hazardous-substance dossier', regulation: 'Battery Reg Annex I', weeks: 4, cost_eur: 5000 },
  ],
  notified_bodies: [
    { name: 'TÜV SÜD', country: 'Germany', number: '0123', scope: 'Battery safety, CE, EMC' },
    { name: 'DEKRA', country: 'Germany', number: '0158', scope: 'EMC and product safety' },
    { name: 'Bureau Veritas', country: 'France', number: '0062', scope: 'Battery testing, due diligence' },
  ],
};

const sampleAgentState = {
  chemicals: { status: 'complete', findings: chemicalsFindings, costUsd: 0.0631, progress: null },
  electrical: { status: 'complete', findings: electricalFindings, costUsd: 0.0689, progress: null },
  carbon: { status: 'complete', findings: carbonFindings, costUsd: 0.0724, progress: null },
  orchestrator: { status: 'complete' },
};

// Opens the pre-baked report instantly. Pure store writes — no network.
export function openSampleReport() {
  currentProduct.set({ ...sampleProduct });
  agentState.set(structuredClone(sampleAgentState));
  lastReport.set({ ...sampleReport });
  screen.set('report');
}
