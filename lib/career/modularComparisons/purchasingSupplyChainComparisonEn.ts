import type { ModularComparisonSpec } from '../modularComparison';

const purchasing = 'Purchasing manager';
const supplyChain = 'Supply chain manager';

const wage = {
  period: 'May 2025',
  purchasing: { soc: '11-3061', annual: ['$92,490', '$115,550', '$148,080', '$182,270', '$223,280'] },
  proxy: { soc: '11-3071', annual: ['$65,120', '$82,440', '$107,230', '$146,770', '$194,900'] },
};

const sources = {
  purchasing: { label: 'O*NET Purchasing Managers', href: 'https://www.onetonline.org/link/summary/11-3061.00', note: 'Tasks, reported titles, work context, and interest code EC.' },
  supplyChain: { label: 'O*NET Supply Chain Managers', href: 'https://www.onetonline.org/link/summary/11-3071.04', note: 'Tasks, reported titles, work context, and interest code EC.' },
  purchasingPay: { label: 'BLS OEWS Purchasing Managers', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=110000&measure=13&occupation=113061&year=2025' },
  proxyPay: { label: 'BLS OEWS Transportation, Storage, and Distribution Managers', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=110000&measure=13&occupation=113071&year=2025', note: 'Broader 11-3071 occupation. A proxy, with no separate BLS wage series for O*NET 11-3071.04.' },
  overtime: { label: 'Federal overtime rule on job titles', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title29-vol3/xhtml/CFR-2025-title29-vol3-part541.html', note: 'GovInfo July 2025 edition. See the section on why job titles alone are insufficient.' },
  cpsm: { label: 'ISM certification handbook and CPSM requirements', href: 'https://ffc.ismworld.org/globalassets/pub/docs/certification--handbook2.pdf' },
  apics: { label: 'Pearson VUE testing information for ASCM APICS', href: 'https://www.pearsonvue.com/us/en/apics.html' },
  federal: { label: 'Federal Acquisition Regulation on contracting officer authority', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title48-vol1/pdf/CFR-2025-title48-vol1-sec1-602-1.pdf', note: 'GovInfo October 2025 edition.' },
  quotes: { label: 'Federal Acquisition Regulation on the legal effect of quotations', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title48-vol1/pdf/CFR-2025-title48-vol1-sec13-004.pdf', note: 'GovInfo October 2025 edition.' },
  proposals: { label: 'Federal Acquisition Regulation on requests for proposals', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title48-vol1/pdf/CFR-2025-title48-vol1-sec15-203.pdf', note: 'GovInfo October 2025 edition.' },
  shouldCost: { label: 'Federal Acquisition Regulation on should-cost reviews', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title48-vol1/pdf/CFR-2025-title48-vol1-sec15-407-4.pdf', note: 'GovInfo October 2025 edition. Federal cost analysis example.' },
  texas: { label: 'Texas open market requisitions and delegation', href: 'https://comptroller.texas.gov/purchasing/contracts/development.php' },
  washingtonAuthority: { label: 'Washington state purchasing delegation', href: 'https://app.leg.wa.gov/rcw/default.aspx?cite=39.26.090' },
  washingtonCompetition: { label: 'Washington competitive solicitation rule', href: 'https://app.leg.wa.gov/rcw/default.aspx?cite=39.26.120' },
  city: { label: 'Savannah City Council network equipment agenda item', href: 'https://agenda.savannahga.gov/agendaitem/previewagendaitem?agendaitemid=11245', note: 'Read the Description for the switch count and cooperative purchasing reference. The offline card has both facts.' },
  msa: { label: 'New Jersey’s posted services master agreement and statement of work', href: 'https://nj.gov/covid19oversight/transparency/contracts/pdfs/doh_cai.prg.mngr_Redacted.pdf' },
  tco: { label: 'GSA category management and total cost of ownership', href: 'https://www.gsa.gov/buy-through-us/category-management' },
  icc: { label: 'ICC Incoterms 2020 overview', href: 'https://iccwbo.org/business-solutions/incoterms-rules/incoterms-2020/' },
  iccScope: { label: 'ICC on delivery terms, title, and payment', href: 'https://library.iccwbo.org/clp/clp-incoterms-qa-2020.htm?AGENT=ICC_FIN' },
  sap: { label: 'SAP Ariba RFQ and award integration guide', href: 'https://learning.sap.com/courses/configuring-sap-ariba-strategic-sourcing-transaction-data-integration/understanding-sap-ariba-strategic-sourcing-transaction-data-flows' },
  oraclePlan: { label: 'Oracle Sales and Operations Planning overview', href: 'https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fasop/overview-of-sales-and-operations-planning.html' },
  oracleInputs: { label: 'Oracle demand, supply, and planning master data', href: 'https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fasop/how-you-collect-different-data-types-for-supply-chain-planning.html' },
  oracleExceptions: { label: 'Oracle Supply Planning exceptions', href: 'https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faspf/predefined-supply-planning-exceptions.html' },
  oracleRelease: { label: 'Oracle plan approval and release actions', href: 'https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faupc/actions-to-manage-your-plans.html' },
  oracleAutoRelease: { label: 'Oracle automatic release options', href: 'https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/faupc/automatic-release-options.html' },
  oracleContract: { label: 'Oracle contract terms, signers, and approval', href: 'https://docs.oracle.com/en/cloud/saas/sales/fasca/how-you-author-a-procurement-contract.html' },
  scor: { label: 'ASCM SCOR Digital Standard process reference', href: 'https://scor.ascm.org/' },
};

const replay = {
  record: 'Savannah’s May 2025 council agenda item requests 15 network switches and cites a competitively awarded cooperative contract.',
  demand: 15,
  stock: 5,
  dueDay: 8,
  buffer: 2,
  a: { unitPrice: 460, freight: 300, day: 10 },
  b: { unitPrice: 480, freight: 40, day: 7 },
};
const shortfall = replay.demand - replay.stock;
const needed = shortfall + replay.buffer;
const totalA = needed * replay.a.unitPrice + replay.a.freight;
const totalB = needed * replay.b.unitPrice + replay.b.freight;
const cost = (value: number) => '$' + value.toLocaleString('en-US');

export const purchasingSupplyChainComparisonEnSpec: ModularComparisonSpec = {
  pairId: 'purchasing-managers-vs-supply-chain-managers',
  locale: 'en',
  title: 'Purchasing Managers vs. Supply Chain Managers: Work, Pay, and Certifications',
  shortTitle: 'Purchasing Managers vs. Supply Chain Managers',
  description: 'Compare U.S. purchasing and supply chain managers by daily decisions, May 2025 BLS wage benchmarks, and CPSM vs. CPIM or CSCP. Try a five-minute sourcing or planning exercise.',
  regionLabel: 'United States',
  authorName: 'FermatMind Editorial',
  datePublished: '2026-11-25',
  dateModified: '2026-11-25',
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: 'A supplier says the next shipment of circuit boards will miss the factory’s build. The purchasing manager works out what the supplier can commit to and under what terms. The supply chain manager works out which builds can still run and which customer orders need a new date. Choose purchasing if you want to own the supplier decision. Choose supply chain if you want to own the plan that gets material through production and out to customers.',
    roleA: { badgeTitle: purchasing, riasecLabel: 'Holland ECS', aliases: 'Procurement manager, commodity manager, strategic sourcing director', keywords: 'Supplier selection, bid evaluation, cost models, contract terms' },
    roleB: { badgeTitle: supplyChain, riasecLabel: 'Holland ECR', aliases: 'Global supply chain director, material requirements planning manager', keywords: 'Demand and supply planning, inventory, warehousing, fulfillment' },
    interviewBoundaryTitle: 'Which decision would I own?',
    interviewBoundaryQuestions: [
      'Would I deliver a bid comparison and negotiate capacity commitments, or publish the revised inventory and customer delivery plan?',
      'If a supplier misses its date, who can approve the price premium and who can reallocate stock?',
    ],
    riasecBoundaryNote: 'The Holland badges show the three highest dimensions in FermatMind’s role data. The FermatMind directory and O*NET’s published interest codes both list EC for the two roles. Use the scores to explore activities. Verify skills, qualifications and hiring requirements separately.',
  },
  topology: {
    title: 'From supplier terms to a delivery plan',
    summary: 'In electronics manufacturing, a supplier’s written capacity and delivery commitment becomes a planning input. The supply plan sends back the quantities and dates that purchasing needs to secure.',
    ariaLabel: 'Three purchasing steps and three supply chain steps exchange order requirements and confirmed supplier commitments.',
    leftZoneTitle: 'Purchasing',
    leftSteps: [
      { title: 'Set the bid scope', detail: 'Lock part and terms.' },
      { title: 'Compare and negotiate', detail: 'Check cost/capacity.' },
      { title: 'Record the deal', detail: 'Pass on firm dates.' },
    ],
    centerZoneTitle: 'Same material',
    upperBridge: { title: 'To planning', line1: 'Committed volume', line2: 'Delivery dates' },
    lowerBridge: { title: 'To purchasing', line1: 'Need-by dates', line2: 'Shortage quantity' },
    rightZoneTitle: 'Supply chain',
    rightSteps: [
      { title: 'Net demand and stock', detail: 'Find the shortage.' },
      { title: 'Test the options', detail: 'Match stock to dates' },
      { title: 'Release the plan', detail: 'Verify receipts.' },
    ],
  },
  matrix: {
    title: 'Compare the work in three settings',
    summary: 'Both roles can deal with suppliers. The difference shows up in what each person hands over and which risks they are responsible for.',
    roleAColumn: purchasing,
    roleBColumn: supplyChain,
    expandButtonLabel: 'Show Tools, Entry & Decision Rights (3 more)',
    collapseButtonLabel: 'Hide Tools, Entry & Decision Rights',
    rows: [
      { id: 'direct-material', dimension: 'Manufacturing and electronics', roleA: 'Run a request for quotation (RFQ) on a specified part revision. Build a should-cost estimate from material, labor and tooling assumptions and compare it with qualified supplier quotes. Put capacity and change-notice commitments in the supplier agreement.', roleB: 'Use material requirements planning (MRP) to turn the build schedule into dated component needs. Check lead time, available stock and approved substitutions against the actual build. Deliver the shortage list and revised schedule.', defaultVisible: true },
      { id: 'international', dimension: 'International logistics and fulfillment', roleA: 'Compare freight and duties on the same landed-cost basis. Use Incoterms 2020 with the named place to document which side bears costs, risk and specific delivery duties. Confirm price and payment terms in the contract.', roleB: 'Link supplier-ready dates, transit and receiving dates to the ship plan. Set the safety stock target and track on-time, in-full delivery (OTIF) against a defined customer promise and counting rule.', defaultVisible: true },
      { id: 'public-indirect', dimension: 'Public and indirect purchasing', roleA: 'Use a request for proposals (RFP) when the procurement method calls for comparing approaches, service levels and price. The master services agreement (MSA) can set recurring terms. The statement of work can define the job to deliver and how it will be accepted.', roleB: 'Where an indirect purchase affects operating capacity, turn the contract dates and service levels into receiving, rollout and contingency plans. Record availability and delivery against the agreed schedule.', defaultVisible: true },
      { id: 'metrics', dimension: 'What good work looks like', roleA: 'Leave a defendable supplier recommendation with cost, quality, capacity and terms visible. Total cost of ownership (TCO) can include use, support and end-of-life costs alongside purchase and freight.', roleB: 'Bring a workable demand and supply plan to sales and operations planning (S&OP). Show the trade-offs among service, inventory, capacity and cash. The SCOR Plan Fulfill process gives teams a reference for balancing requirements against fulfillment capacity.', defaultVisible: true },
      { id: 'work-conditions', dimension: 'Hours, travel, and pressure', roleA: 'A supplier audit or qualification visit can interrupt desk work. A bid deadline adds pressure when engineering is still changing the specification or a sole supplier is pushing back on terms.', roleB: 'A late inbound shipment can trigger an exception across a warehouse and several customer orders. Review the actual escalation rotation, time zone coverage and site travel before weighing offers.', defaultVisible: true },
      { id: 'tools', dimension: 'Systems and review', roleA: 'SAP Ariba can collect responses and pass award data to an ERP. Oracle Fusion Procurement can route contract terms and deviations for review. The authorized buyer or signer still controls the commitment under the employer’s approval rules.', roleB: 'Oracle Fusion Cloud Supply Planning can flag low stock or an infeasible lead time and suggest reschedules. Verify stock, part revisions and supplier dates before a plan is released to execution.', defaultVisible: false },
      { id: 'entry', dimension: 'Entry and switching paths', roleA: 'Start with work you can show as a buyer, purchasing agent or sourcing analyst, such as a quote comparison and a reviewed recommendation. Plan for related experience and the degree requirements in your target posting. O*NET places purchasing managers in Job Zone Four, which calls for considerable preparation.', roleB: 'Inventory analyst, materials planner or logistics coordinator work can build the evidence a manager needs. Aim to own a forecast review, exception list or service metric before taking responsibility for multiple sites or teams.', defaultVisible: false },
      { id: 'decision-rights', dimension: 'Decision rights', roleA: 'Document the evaluation and recommend an award. Check delegated limits for approving a purchase commitment and signing the agreement. Public procurement may reserve those actions for specific officials.', roleB: 'Recommend allocation, alternate dates or an inventory policy change. Approval for premium freight, a substitute part or a new customer promise depends on the cost, quality and service decisions each owner has authority to make.', defaultVisible: false },
    ],
  },
  incident: {
    title: 'What happens when a board shipment slips?',
    summary: 'In this simulated electronics plant, the board supplier misses its ship date just before a customer build. The teams need both a firm supplier commitment and a feasible build plan.',
    triggerLabel: 'The supplier update: ',
    triggerBody: 'The supplier can split the shipment. The first lot could arrive in time via premium freight, and the alternate board revision is still awaiting quality approval.',
    triggerCaveat: 'In this example, the procurement director approves the price premium, operations approves the allocation and quality clears any alternate revision.',
    rows: [
      { stage: 'Get a firm commitment', roleLabel: purchasing, tone: 'roleA', verifiedFacts: 'Purchase order revision, existing terms and the supplier’s proposed split.', openGaps: 'First-lot quantity, confirmed arrival date and freight payer.', actionAndApproval: 'Get written quantities and dates. The director approves the premium and the delegated buyer releases the purchase order change.' },
      { stage: 'Rebuild the schedule', roleLabel: supplyChain, tone: 'roleB', verifiedFacts: 'Usable inventory, open customer demand and production need-by dates.', openGaps: 'Which orders can use the first lot and when the balance will be usable.', actionAndApproval: 'Model the split against the build and include the alternate only after quality clearance. Get the operations lead’s allocation approval and have the planner update the approved schedule.' },
      { stage: 'Verify delivery', roleLabel: 'Supply chain and receiving', tone: 'roleB', verifiedFacts: 'The approved allocation and the supplier’s revised commitment.', openGaps: 'Actual receipt quantity and quality disposition.', actionAndApproval: 'Receiving logs the actual lots, quality releases usable stock, and planning reconciles the remaining gap against the next build.' },
    ],
    recoveryAcceptanceTitle: 'When the shortage is closed',
    recoveryAcceptanceCriteria: 'Match the amended order to the receipt and usable quantity by part revision. Close the shortage only when released stock covers the approved build and any remaining customers have updated promises.',
    defenseLayerNote: 'A supplier’s ship confirmation establishes a shipment milestone. A warehouse receipt and quality release establish what production can actually use.',
  },
  payAndCerts: {
    title: 'U.S. pay benchmarks and credentials',
    summary: 'For compensation, compare the occupation behind the data and the work behind the title. For credentials, start with the job you want to do.',
    salaryHeading: 'Five U.S. wage cuts and what an offer includes',
    salaryBody: `Purchasing managers had the higher U.S. median in BLS OEWS for ${wage.period}. The distributions still overlap. The 90th percentile of the transportation, storage, and distribution managers group (${wage.proxy.annual[4]}) exceeded the 75th percentile for purchasing managers (${wage.purchasing.annual[3]}). Annual U.S. wages at the 10th, 25th, 50th, 75th and 90th percentiles were ${wage.purchasing.annual.join(', ')} for purchasing managers (SOC ${wage.purchasing.soc}) and ${wage.proxy.annual.join(', ')} for transportation, storage, and distribution managers (SOC ${wage.proxy.soc}). The second group is a broad proxy. BLS publishes no standalone wage series for O*NET Supply Chain Managers (11-3071.04). OEWS measures straight-time gross wages for covered wage and salary employees and excludes overtime premiums, shift differentials, nonproduction bonuses and employer benefit costs. The percentiles describe the distribution, rather than individual job levels or total compensation.

A private-sector offer can combine base salary, a target incentive and equity where offered. In purchasing, grade and incentive design can reflect the spend, categories, approval limits and savings measures assigned to the job. In supply chain, look at ownership across sites, the inventory and service targets, and the escalation load. When a public posting uses a grade and step, use that published schedule and appointment terms. A manager title alone cannot establish overtime exemption.

For same-metro offers at similar experience levels, convert hourly pay using the stated paid hours and annual salaries using the same 12-month window. Compare recurring guaranteed cash first, then show any guaranteed one-time payment separately. Keep bonus targets, vesting equity, overtime and benefits in distinct columns. Set variable pay to zero for a downside comparison and account separately for travel costs, employer retirement contributions and any extra hours or weekend coverage.`,
    certs: [
      { name: 'ISM CPSM', officialScope: 'Certified Professional in Supply Management. ISM requires three exams and either three years of full-time qualifying professional supply management experience with a regionally accredited bachelor’s degree or accepted international equivalent, or five years of full-time qualifying experience without a qualified degree.', workplaceBoundary: 'A supply management credential for sourcing, category and supplier work. Contract signature authority comes from the employer or public agency.', verificationTips: 'Check whether your experience is professional, nonclerical and nonsupport under ISM’s requirements.', officialLinks: [sources.cpsm] },
      { name: 'ASCM APICS CPIM and CSCP', officialScope: 'CPIM means Certified in Planning and Inventory Management. CSCP means Certified Supply Chain Professional. ASCM offers both under its APICS brand. Each has its own certification exam.', workplaceBoundary: 'CPIM is the closer fit for MRP, scheduling and inventory. CSCP covers the extended supply chain from suppliers to end customers. These certifications signal knowledge and confer no public purchasing or signing authority.', verificationTips: 'Compare the current exam content and the role’s actual scope before choosing a credential.', officialLinks: [sources.apics] },
      { name: 'Public purchasing authority', officialScope: 'Federal contracting officers bind the U.S. Government only within their delegation. States run their own purchasing programs. Texas uses Comptroller delegation for certain state open-market purchases. Washington requires agency purchasing delegations to set dollar or purchasing-category limits. Its competitive solicitation rule, where practicable, also covers purchases under delegated authority.', workplaceBoundary: 'These are examples of agency purchasing and signature authority. CPSM, CPIM and CSCP are voluntary professional certifications. A specific public employer can have its own training and appointment rules.', verificationTips: 'For a given job, identify the contracting official, the authorized purchasing method, the category and dollar limits, and the approval record.', officialLinks: [sources.federal, sources.texas, sources.washingtonAuthority, sources.washingtonCompetition] },
    ],
    interviewChecklistTitle: 'Four details that change the offer',
    interviewChecklistQuestions: [
      { label: 'Guaranteed cash', question: 'What is the recurring base for stated hours, and which incentive or equity figures depend on performance or vesting?' },
      { label: 'What earns a higher grade', question: 'Does the next level add negotiation and award responsibility, or ownership of a larger inventory and service plan?' },
      { label: 'First substantive assignment', question: 'Will I build a sourcing recommendation or own part of a planning cycle alongside routine order follow-up?' },
      { label: 'Comparable workload', question: 'What time, travel and after-hours coverage should I include when comparing two offers in this metro?' },
    ],
  },
  thirtyDayPlugin: {
    badge: 'Two paper portfolios',
    title: 'Build a 30-day purchasing or planning portfolio',
    summary: 'Choose one track and use the procurement, SCOR and planning sources below. Keep the files offline and give a reviewer enough information to retrace each decision.',
    tracks: [
      { id: 'supplier-portfolio', title: 'Sourcing and contract review', badge: 'Purchasing track', tone: 'roleA', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Use the federal RFP requirements to draft a mock maintenance-services evaluation sheet. Give the price, service coverage and response-time criteria a separate pass rule or score.' },
        { weekLabel: 'Week 2', deliverable: 'Use the federal should-cost example to build a private-sector cost model for an imaginary cable assembly. Separate material, labor and tooling. Show how the unit estimate changes at two production volumes.' },
        { weekLabel: 'Week 3', deliverable: 'Use the New Jersey procurement file’s master agreement and statement of work to build a two-column terms map. Locate three master terms and three order-specific terms by section, then write one acceptance test for the proposed service.' },
        { weekLabel: 'Week 4', deliverable: 'Use ICC’s Incoterms 2020 material to compare two fictional cross-border freight offers on the same basis. Identify the named place, the risk transfer, the costs counted and the separate contract terms still needed.' },
      ] },
      { id: 'planning-portfolio', title: 'Supply and fulfillment planning', badge: 'Supply chain track', tone: 'roleB', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Use the Oracle planning data guide to build a one-page data map for a fictional two-part assembly. Label the demand, receipt, item structure and unit of measure. Demonstrate which component is short for one build.' },
        { weekLabel: 'Week 2', deliverable: 'Use the Oracle exceptions guide to build a short inventory projection for three weeks. Mark a safety stock breach and a late receipt separately. Show that fixing one may leave the other open.' },
        { weekLabel: 'Week 3', deliverable: 'Use the Oracle S&OP overview and SCOR Plan Fulfill as a guide for a one-page capacity review. Show the demand, capacity gap and service impact under two possible production plans and write a recommendation.' },
        { weekLabel: 'Week 4', deliverable: 'Use SCOR Fulfill and the Oracle release actions to map the move from approved plan to warehouse and delivery records. Define the OTIF denominator, score two fictional deliveries and name the person who verifies the result.' },
      ] },
    ],
  },
  checklist: {
    title: 'Which tasks and conditions suit you?',
    summary: 'Use the skills column to choose a task to practice. Use the conditions column to identify what you need from the job.',
    skillsHeading: 'Skills I want to build',
    skillsOptions: [
      { id: 'quote', track: 'roleA', label: 'Normalize a quote', summary: 'Match units, revision, freight and delivery window before comparing suppliers.', interviewQuestions: ['Which bid comparison can a new hire build and present for review?'] },
      { id: 'terms', track: 'roleA', label: 'Write a measurable supplier commitment', summary: 'Tie the promise to a part revision, quantity, date and acceptance record.', interviewQuestions: ['Who drafts, reviews and signs a supplier change?'] },
      { id: 'stock', track: 'roleB', label: 'Find the first stockout', summary: 'Separate usable stock from pending receipts and net both against dated requirements.', interviewQuestions: ['Which inventory exception would I own from first signal through resolution?'] },
      { id: 'service', track: 'roleB', label: 'Explain a service trade-off', summary: 'Show how a change to capacity or inventory affects the order promise.', interviewQuestions: ['Which service metric would I report, and what counts as a miss?'] },
    ],
    conditionsHeading: 'Conditions I can work with',
    conditionsOptions: [
      { id: 'supplier-travel', track: 'roleA', label: 'Supplier visits', summary: 'Separate planned supplier reviews from short-notice qualification trips.', interviewQuestions: ['How were supplier visits and travel scheduled on the last two sourcing projects?'] },
      { id: 'deadlines', track: 'roleA', label: 'Negotiation and bid deadlines', summary: 'Consider recurring disagreements about price, lead time and approved substitutes.', interviewQuestions: ['Who covers a live bid if engineering changes the part specification at the deadline?'] },
      { id: 'coverage', track: 'roleB', label: 'After-hours exceptions', summary: 'Check actual time zone coverage and weekend ownership of disrupted shipments.', interviewQuestions: ['Who handled the last missed inbound delivery after hours?'] },
      { id: 'sites', track: 'roleB', label: 'Plant and warehouse coverage', summary: 'Separate expected site time from remote planning and live inventory problem-solving.', interviewQuestions: ['Which sites would I cover, and where is the team based during a physical inventory?'] },
    ],
    defaultInterviewQuestions: ['Bring a posting and identify one deliverable, its approver and the working condition most likely to change your decision.'],
    crossTrackNote: 'You can enjoy either set of tasks and still prefer a different schedule or travel pattern. Keep the two choices separate.',
    offlinePrintHint: 'Save or print these questions to compare the same details across two openings.',
  },
  desktopExercise: {
    sectionTitle: 'Try a quote or inventory replay in five minutes',
    summary: 'Choose one track. Use this offline card and write a short note on paper. The public record supplies the type and scale of the request. The quote, schedule and delegation details in the replay are invented for practice.',
    publicLinksHeading: 'Read the public purchasing record: ',
    publicLinks: [sources.city],
    factSummaryHeading: 'Offline evidence and replay data: ',
    factSummary: `Public record. ${replay.record} Its requested delivery is as needed. Treat it as a reference for the equipment and purchasing context.

Simulated file. On Day 0, the rollout team has ${replay.stock} usable switches and no other receipts. It needs ${replay.demand} by the end of Day ${replay.dueDay}, and wants ${replay.buffer} spare switches left after deployment. Both suppliers meet the same technical requirements, can quote the entire refill quantity, and quote one shipment with freight charged per order. Quote A is ${cost(replay.a.unitPrice)} per switch plus ${cost(replay.a.freight)} freight, received Day ${replay.a.day}. Quote B is ${cost(replay.b.unitPrice)} per switch plus ${cost(replay.b.freight)} freight, received Day ${replay.b.day}. Ignore tax and all other costs for the comparison. Count inventory only after receiving accepts it. Both quotes are pending and the procurement approver must confirm the authorized buying route before the delegated buyer can release an order.`,
    taskA: { title: 'Purchasing track: draft an award recommendation', instruction: 'State the due date and both quantity needs. Compare delivered cost and ask for a written commitment before the order is released.' },
    taskB: { title: 'Supply chain track: draft a rollout note', instruction: 'State the due date and both quantity needs. Show which receipt day works and give the rollout lead a fallback if the early receipt fails.' },
    rubricTitle: 'Score your note',
    rubricHeading: 'Four checks per track',
    rubricPassRule: 'Pass when your note meets both shared checks and both checks for your chosen track.',
    rubricItems: [
      `Shared. State Day ${replay.dueDay}, ${shortfall} switches short for deployment and ${needed} needed with spares.`,
      'Shared. Identify Quote B as the only quote that arrives before the deadline, and treat it as pending confirmation.',
      'Purchasing. Give both delivered totals for the same quantity and identify the lower total.',
      'Purchasing. Require a written arrival commitment and approval of the buying route before the delegated buyer releases the order.',
      'Supply chain. Calculate usable stock left after the deployment if receiving accepts Quote B on time.',
      'Supply chain. Name a fallback tied to missing receipt or acceptance and identify who receives the exception.',
    ],
    sampleAnswerALabel: 'Sample purchasing note: ',
    sampleAnswerA: `Day ${replay.dueDay} needs ${shortfall} more switches for deployment, or ${needed} to leave spares. A totals ${cost(totalA)} delivered and arrives Day ${replay.a.day}. B is lower at ${cost(totalB)} delivered and is the only quote due before rollout. Recommend B pending a written Day ${replay.b.day} commitment and approval of the buying route. The delegated buyer can then release the order.`,
    sampleAnswerBLabel: 'Sample supply chain note: ',
    sampleAnswerB: `By Day ${replay.dueDay}, deployment is short ${shortfall} switches. Refill ${needed} to keep spares. Only B is due before rollout, pending confirmation. If receiving accepts B on Day ${replay.b.day}, deployment leaves ${replay.buffer} usable spares. If acceptance slips past the deadline, alert the rollout lead and propose staging only sites covered by the ${replay.stock} usable switches.`,
  },
  tools: {
    title: 'Choose your next step',
    summary: 'Pick the tool that fits the decision you are making.',
    cards: [
      { id: 'compare', badge: 'Compare another pair', meta: 'Career comparison', tone: 'neutral', title: 'Put two job profiles side by side', description: 'Compare two careers by duties, outlook and fit signals.', purposeHint: 'Use this if materials planning or logistics management is also on your shortlist.', ctaLabel: 'Open career comparison', href: '/en/career/compare' },
      { id: 'worksheet', badge: 'Record your next action', meta: 'Career worksheet', tone: 'roleA', title: 'Prepare for a real opening', description: 'Use the worksheet to record what the work sample revealed and what you want to verify.', purposeHint: 'Use this when you have an employer or team to investigate.', ctaLabel: 'Open the interest worksheet', href: '/en/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: 'Explore interests', meta: '60 questions', tone: 'roleB', title: 'Holland Career Interest Test', description: 'See your RIASEC interest dimensions and three-letter code.', purposeHint: 'Use this if you are still deciding which work activities to try.', ctaLabel: 'Explore your career interests', href: '/en/tests/holland-career-interest-test-riasec' },
      { id: 'career', badge: 'Compare working conditions', meta: '94 questions', tone: 'accent', title: 'Career Planning and Work Style Test', description: 'Reflect on activities, work style and work conditions.', purposeHint: 'Use this if the pace, work environment or way of working is your deciding factor.', ctaLabel: 'Explore your work style', href: '/en/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: 'Read the individual career profiles',
    profileLinks: [
      { label: 'Purchasing Managers', href: '/en/career/jobs/purchasing-managers' },
      { label: 'Supply Chain Managers', href: '/en/career/jobs/supply-chain-managers' },
    ],
  },
  faqs: [
    { id: 'ownership', question: 'Is purchasing part of supply chain management?', answer: 'Yes, purchasing can sit inside the supply chain function. Use the deliverable to tell the jobs apart. A purchasing manager may own the supplier recommendation and the terms. A supply chain manager may own the demand and supply plan and the service result. Read a hybrid description for both decisions and the people who approve each.' },
    { id: 'pay-structure', question: 'How can I tell whether a manager offer has room to grow?', answer: 'Start with the next grade’s written responsibilities. Compare whether a purchasing role adds a category, supplier negotiations or responsibility for an award recommendation, and whether a supply chain role adds a planning cycle, a site or ownership of inventory and service targets. A job centered on chasing confirmations teaches execution, so look for a next assignment where you decide what to buy or how to cover demand. If a bonus is based on savings, check the baseline and how quality or freight costs are treated. For a service bonus, check the promised date and how partial shipments count. Use those definitions to judge whether the targets are in your control.' },
    { id: 'switch', question: 'Can I move from buyer to supply chain manager?', answer: 'Yes. Move from buyer work into planning by taking on a shortage review, inventory projection or demand and supply handoff. Bring a work sample that ties confirmed supplier lead times and purchase quantities to the build schedule, then shows how you verified the revised plan. The opposite move calls for proof of bid evaluation, negotiation and contract review.' },
    { id: 'credentials', question: 'Should I take CPSM, CPIM or CSCP first?', answer: 'Choose CPSM when your next job is centered on sourcing and you can meet ISM’s experience rules. Choose CPIM for materials planning, scheduling and inventory. Choose CSCP if you need to understand handoffs across suppliers, operations and customers. Start with the tasks in the opening because the credentials test different bodies of knowledge.' },
    { id: 'public-purchasing', question: 'Who can award a government contract?', answer: 'The official with delegated authority can make the commitment within its limits. The evaluation team may score proposals or recommend an award. In federal simplified acquisitions, a quote alone cannot bind either party. The government’s order is an offer that the supplier can accept. At state level, Texas uses Comptroller delegation. In Washington, an agency can have delegated purchasing authority and still need to run a competitive solicitation where practicable. The credential and the delegation answer different questions.' },
    { id: 'trade-terms', question: 'Do Incoterms 2020 decide who owns the goods?', answer: 'Ownership follows the sales contract and governing law. Incoterms 2020 allocates specified delivery duties, costs and risk when the contract adopts a rule and named place. A buyer uses that point to align the quote and freight assumptions. A planner still needs the actual date the shipment reaches receiving and becomes usable.' },
    { id: 'automation-2026', question: 'What can purchasing and planning software automate in 2026?', answer: 'Configured SAP Ariba workflows can collect bids and transfer award data into ERP workflows. Oracle can flag a lead-time or safety stock exception, propose order moves and release eligible recommendations under configured rules. People set the criteria, verify specifications and planning inputs, and own the decision to accept a supplier exception or change the customer promise. A workflow recommendation can route the decision to the authorized person.' },
  ],
  sourceGroups: [
    { id: 'occupations-and-pay', title: 'U.S. occupation definitions, work, and wages', links: [sources.purchasing, sources.supplyChain, sources.purchasingPay, sources.proxyPay, sources.overtime] },
    { id: 'credential-issuers', title: 'ISM and ASCM APICS credential requirements', links: [sources.cpsm, sources.apics] },
    { id: 'public-purchasing', title: 'Public contracting and purchasing records', links: [sources.federal, sources.quotes, sources.proposals, sources.shouldCost, sources.texas, sources.washingtonAuthority, sources.washingtonCompetition, { ...sources.city, note: 'May 8, 2025 council agenda, item 11245. See Description, “Network Switches” and the cooperative contract discussion.' }, sources.msa, sources.tco] },
    { id: 'planning-and-sourcing', title: 'Trade terms, sourcing, and supply planning', links: [sources.icc, sources.iccScope, sources.sap, sources.oraclePlan, sources.oracleInputs, sources.oracleExceptions, sources.oracleRelease, sources.oracleAutoRelease, sources.oracleContract, sources.scor] },
  ],
};
