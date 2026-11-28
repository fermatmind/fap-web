import type { ModularComparisonSpec } from "../modularComparison";

const engineer = 'Solar energy systems engineer';
const installer = 'Solar photovoltaic installer';

const wage = {
  period: 'May 2025',
  engineering: { soc: '17-2199', annual: ['$66,810', '$90,970', '$122,930', '$158,090', '$189,950'] },
  installers: { soc: '47-2231', annual: ['$41,600', '$46,700', '$53,140', '$62,870', '$79,970'] },
};

const designCard = { id: 'D-12', dcKw: 12, acKw: 10, referenceVolts: 480, referenceC: 24, coldC: -8, coldFactor: 1.1, limitVolts: 520 };
const fieldCard = { id: 'F-08', allowancesFt: [4, 2, 3], availableFt: 8 };
const designRatio = (designCard.dcKw / designCard.acKw).toFixed(2);
const coldVolts = designCard.referenceVolts * designCard.coldFactor;
const excessVolts = coldVolts - designCard.limitVolts;
const requiredFt = fieldCard.allowancesFt.reduce((sum, allowance) => sum + allowance, 0);
const missingFt = requiredFt - fieldCard.availableFt;

const sources = {
  engineer: { label: 'O*NET Solar Energy Systems Engineers', href: 'https://www.onetonline.org/link/details/17-2199.11' },
  installer: { label: 'O*NET Solar Photovoltaic Installers', href: 'https://www.onetonline.org/link/details/47-2231.00' },
  crosswalk: { label: 'O*NET crosswalk for Engineers, All Other', href: 'https://www.onetonline.org/crosswalk/SOC?s=17-2199' },
  wageA: { label: 'BLS OEWS Engineers, All Other', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=170000&measure=13&occupation=172199&year=2025', note: 'May 2025, national annual wage percentiles for the broad engineering group.' },
  wageB: { label: 'BLS OEWS Solar Photovoltaic Installers', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=470000&measure=13&occupation=472231&year=2025', note: 'May 2025, national annual wage percentiles for PV installers.' },
  doe: { label: 'U.S. Department of Energy PV system basics', href: 'https://www.energy.gov/cmei/systems/solar-photovoltaic-system-design-basics' },
  grid: { label: 'IREC Utility Interconnection Engineer profile', href: 'https://www.irecsolarcareermap.org/jobs/utility-interconnection-engineer' },
  field: { label: 'IREC Entry-Level Solar Installer profile', href: 'https://www.irecsolarcareermap.org/jobs/entry-level-pv-installer' },
  ncees: { label: 'NCEES engineering licensure pathway', href: 'https://ncees.org/licensure/' },
  cslb: { label: 'California C-46 Solar Contractor classification', href: 'https://www.cslb.ca.gov/about_us/library/licensing_classifications/Licensing_Classifications_Detail.aspx?Class=C46' },
  massBoard: { label: 'Massachusetts electricians board PV guidance', href: 'https://www.mass.gov/lists/board-policies-and-guidelines-examiners-of-electricians' },
  massUtility: { label: 'Massachusetts utility interconnection', href: 'https://www.mass.gov/info-details/utility-interconnection-in-massachusetts' },
  nec: { label: 'NFPA 70, National Electrical Code', href: 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70' },
  florida: { label: 'Hillsborough County, Florida PV plan review checklist', href: 'https://hcfl.gov/businesses/hillsgovhub/residential-and-mobile-home-checklists/solar-photovoltaic-system-checklist' },
  ferc: { label: 'FERC generator interconnection rule in the Federal Register', href: 'https://www.govinfo.gov/content/pkg/FR-2023-09-06/html/2023-16628.htm' },
  ieee: { label: 'IEEE 1547 interconnection standard', href: 'https://standards.ieee.org/ieee/1547/5915/' },
  ul: { label: 'UL Solutions PV inverter certification', href: 'https://www.ul.com/services/pv-inverter-certification' },
  osha: { label: 'U.S. CFR construction fall protection, Subpart M', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title29-vol8/xhtml/CFR-2025-title29-vol8-part1926-subpartM.html' },
  nabcep: { label: 'NABCEP PV professional credentials', href: 'https://www.nabcep.org/certifications/nabcep-board-certifications/' },
  associate: { label: 'NABCEP PV Associate program', href: 'https://www.nabcep.org/certifications/associate-program/' },
  overtime: { label: 'U.S. Department of Labor overtime and the regular rate', href: 'https://www.dol.gov/agencies/whd/fact-sheets/56a-regular-rate' },
  ibew: { label: 'Arizona NECA and IBEW Local 640 wage and benefit sheet', href: 'https://ibew640.com/Uploads/UploadedFiles/wage-sheets-07-01-25-12-31-25_20250714123957.pdf', note: 'Inside Construction Agreement, July–December 2025. Local example of separate classifications, wages and fringes.' },
  iec: { label: 'Independent Electrical Contractors training', href: 'https://ieci.org/workforce/training/' },
  aid: { label: 'U.S. Department of Education Net Price Calculator Center', href: 'https://collegecost.ed.gov/net-price' },
  drawings: { label: 'Irvine residential solar plan requirements', href: 'https://cityofirvine.gov/community-development/counter-reviews-residential-solar-photovoltaic-systems', note: 'Drawing Format: roof plan, one-line diagram, product sheets and mounting details.' },
  helioscope: { label: 'HelioScope production simulation', href: 'https://helioscope.aurorasolar.com/sim-solutions/' },
  sam: { label: 'NLR PVWatts and System Advisor Model', href: 'https://pvwatts.nlr.gov/docs/help_about.php' },
  pvsyst: { label: 'PVsyst inverter and array sizing', href: 'https://www.pvsyst.com/help/project-design/grid-connected-system-definition/inverter-array-sizing.html' },
  voltage: { label: 'PVsyst array voltage sizing', href: 'https://www.pvsyst.com/help/project-design/grid-connected-system-definition/array-voltage-sizing-according-to-inverter.html' },
  connectors: { label: 'Stäubli PV connector tools catalog', href: 'https://www.staubli.com/content/dam/ecs/catalogs-brochures/RE/SOL-PVTools-11014090-en.pdf' },
  diagnostics: { label: 'U.S. DOE PV operations and maintenance', href: 'https://www.energy.gov/cmei/femp/life-cycle-photovoltaic-systems-operate-and-maintain-existing-photovoltaic-system' },
  irradiance: { label: 'NLR outdoor PV testing', href: 'https://www.nlr.gov/pv/outdoor-test-facility' },
  optimizers: { label: 'PVsyst documentation on power optimizers', href: 'https://www.pvsyst.com/help/project-design/grid-connected-system-definition/power-optimizers/index.html' },
  aurora: { label: 'Aurora Solar SmartRoof technical overview', href: 'https://aurorasolar.com/ai-helped-speed-up-our-ai/' },
  pvwattsInputs: { label: 'NLR PVWatts inputs and Golden, Colorado example', href: 'https://pvwatts.nlr.gov/docs/help_start.php' },
  torrance: { label: 'Torrance requirements for automated PV permits', href: 'https://www.torranceca.gov/Government/Departments-Offices/Departments-Offices/Community-Development/Building-and-Safety/Solar-Photovoltaic-Information/Torrance-PV-Automated-Permitting-Requirements' },
};

export const solarPhotovoltaicsComparisonEnSpec: ModularComparisonSpec = {
  pairId: 'solar-energy-systems-engineers-vs-solar-photovoltaic-installers',
  locale: 'en',
  title: 'Solar Energy Systems Engineers vs. Solar Photovoltaic Installers: Work, Pay, and Licensing',
  shortTitle: 'Solar Energy Systems Engineers vs. Solar Photovoltaic Installers',
  description: 'Compare U.S. solar engineers and PV installers by design work, jobsite duties, BLS pay, NABCEP credentials, and licensing. Try a five-minute paper handoff.',
  regionLabel: 'United States',
  authorName: 'FermatMind Editorial',
  datePublished: '2026-11-27',
  dateModified: '2026-11-27',
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: 'A shop wants solar panels, but a new vent takes up part of the roof on the drawing. The engineer figures out what the change means for the design. The installer documents what the crew found and builds from the released plan. Choose engineering if you want to explain tradeoffs in layout, output and grid connection. Choose installation if you want to build arrays, spot discrepancies and leave a clear field record. Both careers extend from roofs to larger ground-mounted projects.',
    roleA: { badgeTitle: engineer, riasecLabel: 'Holland RIC', aliases: 'Solar design engineer, photovoltaic system designer', keywords: 'PV system design, production modeling, inverter sizing, interconnection studies' },
    roleB: { badgeTitle: installer, riasecLabel: 'Holland RCI', aliases: 'Solar PV installer, PV installation technician', keywords: 'Mechanical racking, module mounting, field records, commissioning support' },
    interviewBoundaryTitle: 'Find the work you would own',
    interviewBoundaryQuestions: [
      'Would my first project put me in charge of a production model or a released drawing review, or of checking the crew packet and documenting installed equipment?',
      'If the roof survey and layout disagree, who writes the discrepancy, who can revise the design and who releases it to the crew?',
    ],
    riasecBoundaryNote: 'FermatMind ranks the top three Holland interest dimensions for each badge. The detailed O*NET ratings also order their first three dimensions RIC and RCI. The shared R reflects interest in practical work. Use the badges to explore activities, then check training, local credentials and work authorization separately.',
  },
  topology: {
    title: 'How a PV design reaches the crew',
    summary: 'The design team sets the project assumptions and issues a drawing package. The installation team builds within its assigned scope and returns field records and discrepancies. A design revision comes back through its named reviewer and the contractor’s release process.',
    ariaLabel: 'Design and installation each have three steps, linked by a released plan and a returned field record.',
    leftZoneTitle: 'PV design',
    leftSteps: [
      { title: 'Check inputs', detail: 'Site and utility' },
      { title: 'Issue design', detail: 'Layout and one-line' },
      { title: 'Review changes', detail: 'Record disposition' },
    ],
    centerZoneTitle: 'PV array',
    upperBridge: { title: 'To the crew', line1: 'Released layout', line2: 'Equipment schedule' },
    lowerBridge: { title: 'To design', line1: 'Field discrepancy', line2: 'Closeout record' },
    rightZoneTitle: 'PV installation',
    rightSteps: [
      { title: 'Check the plan', detail: 'Match the revision' },
      { title: 'Build and log', detail: 'Record differences' },
      { title: 'Return records', detail: 'Closeout evidence' },
    ],
  },
  matrix: {
    title: 'The work on rooftops, commercial jobs and solar farms',
    summary: 'A residential contractor, commercial design firm and utility-scale builder can use the same job titles for very different assignments. Start with the setting and the deliverables.',
    roleAColumn: engineer,
    roleBColumn: installer,
    expandButtonLabel: 'Show tools, entry and authorization',
    collapseButtonLabel: 'Hide tools, entry and authorization',
    rows: [
      { id: 'residential', dimension: 'Residential rooftops', roleA: 'Use site and shading data to lay out modules, compare a string inverter with microinverters or a paired DC optimizer system, and coordinate the electrical one-line and roof review.', roleB: 'Match the plan and equipment schedule, assemble the racking and mount and label modules. Return discrepancies involving roof features or equipment before treating a change as released.', defaultVisible: true },
      { id: 'commercial', dimension: 'Commercial solar', roleA: 'Check production modeling assumptions, coordinate structural loading with the responsible structural designer, and build an inverter and equipment schedule that can survive permit and utility review.', roleB: 'Track equipment and plan revisions across roof zones or work packages. Log substitutions and installation evidence so the contractor can tie the closeout to the released design.', defaultVisible: true },
      { id: 'ground-mount', dimension: 'Ground mounts and utility-scale projects', roleA: 'Compare fixed racks and trackers, document energy losses, and coordinate plant equipment assumptions with interconnection studies. At a utility, a separate interconnection engineer can own the grid study.', roleB: 'Work on racking or tracker assemblies and module mounting. DC string wiring belongs to crews permitted to do it. Work packages and closeout records identify which array blocks were assigned and checked.', defaultVisible: true },
      { id: 'commissioning', dimension: 'Commissioning and handoff', roleA: 'Explain how the installed configuration should perform, reconcile changes to the model and answer discrepancies against the design basis.', roleB: 'Provide the installed-equipment and discrepancy records. Commissioning staff and authorized electrical workers own the tests and approvals assigned to them.', defaultVisible: true },
      { id: 'conditions', dimension: 'Hours, travel and physical demands', roleA: 'Expect modeling and drawing review at a desk, with possible site surveys, utility meetings and commissioning travel. Consider whether overlapping review deadlines and long stretches of screen work are sustainable.', roleB: 'Rooftop work can involve heights, lifting and sun exposure. Ground-mounted projects can add long walks and travel between sites. Weigh the physical work and workweek against what you want to be doing in six months.', defaultVisible: true },
      { id: 'tools', dimension: 'Tools and methods', roleA: 'HelioScope, PVsyst and the System Advisor Model (SAM) support production estimates. Inverter sizing also involves the DC-to-AC ratio and temperature-dependent string voltage. The engineering record preserves assumptions and limitations.', roleB: 'Job tools can include a torque wrench or manufacturer-specified MC4 crimp tool. PV performance testing can involve irradiance meters, and qualified maintenance crews can use infrared imaging to investigate damage. Record the equipment and which checks belong to your scope.', defaultVisible: false },
      { id: 'entry', dimension: 'Entry and advancement', roleA: 'For a PE-oriented path, price an EAC/ABET engineering degree after grants, add living costs, and separate debt and possible internship earnings from the post-degree salary. By year five, look for reviewed design work and experience that the board can count.', roleB: 'A high school diploma and on-the-job training can be an entry route. Paid electrical apprenticeship is another path if the goal includes licensed trade work. By year five, compare logged work, crew leadership and credit toward trade qualifications where available.', defaultVisible: false },
      { id: 'authorization', dimension: 'Who can sign, install or approve', roleA: 'A solar designer can prepare drawings. State practice rules and the project determine when licensed engineering and a seal are required. The organization that runs the relevant grid connection process reviews that part separately.', roleB: 'Mechanical assembly, regulated electrical work and a company’s contractor license are separate questions. California and Massachusetts illustrate why the duties assigned to a PV crew depend on where it works.', defaultVisible: false },
    ],
  },
  incident: {
    title: 'A rooftop obstruction changes the drawing',
    summary: 'In this simulated commercial project, the crew’s work package shows a module row beside a rooftop unit. A survey update shows the unit occupies more space than the layout assumed.',
    triggerLabel: 'The conflict: ',
    triggerBody: 'The affected roof zone has two records with different equipment footprints. The drawing register still points to the original layout and the utility packet still describes the original array.',
    triggerCaveat: 'This example assigns design release to the project’s engineer of record and field packet distribution to the contractor lead. Their records answer different questions from a permit inspection or utility approval.',
    rows: [
      { stage: 'Flag the row', roleLabel: 'Installer and contractor lead', tone: 'roleB', verifiedFacts: 'The roof zone, layout revision and survey record identify the conflict.', openGaps: 'Whether engineering can keep the proposed module row and what records would change.', actionAndApproval: 'The installer records the discrepancy. The contractor lead routes it to design and records the work package as awaiting a decision.' },
      { stage: 'Review the design impact', roleLabel: 'Solar engineer and engineer of record', tone: 'roleA', verifiedFacts: 'The two footprints and the array shown in the released drawing.', openGaps: 'Sales and production assumptions, mounting review, and whether the utility packet changes.', actionAndApproval: 'The solar engineer drafts the disposition and identifies affected documents. The engineer of record releases the design response and handles the seal where required.' },
      { stage: 'Close the document loop', roleLabel: 'Contractor lead, inspector and utility', tone: 'roleB', verifiedFacts: 'The design response, released revision and matching packet acknowledgment.', openGaps: 'Any separate permit update, inspection or utility milestone that is still pending.', actionAndApproval: 'The contractor lead records who received the updated packet. The local authority and utility record their own decisions when required.' },
    ],
    recoveryAcceptanceTitle: 'What closes the discrepancy',
    recoveryAcceptanceCriteria: 'The closeout log identifies the roof zone, released drawing, disposition and contractor acknowledgment. The installed record uses the same revision and identifies unresolved reviews. A permit inspection, a utility decision and an employer’s authorization for site work are separate records.',
    defenseLayerNote: 'The adopted NEC (NFPA 70) covers PV systems under Article 690 and interconnected power production under Article 705. IEEE 1547 addresses distributed energy resources connecting at typical distribution voltages, while UL 1741 covers equipment such as inverters. OSHA 1926 Subpart M addresses construction fall protection. Each applies at its own layer.',
  },
  payAndCerts: {
    title: 'Pay, credentials and work authorization',
    summary: 'Start with the national wage distributions, then compare the grade, schedule, and qualifications attached to a real offer.',
    salaryHeading: 'U.S. wages and what an offer pays for',
    salaryBody: `The installer 90th-percentile wage of ${wage.installers.annual[4]} topped the broad engineering group’s 10th-percentile wage of ${wage.engineering.annual[0]}, while staying below its 25th percentile of ${wage.engineering.annual[1]}. In BLS OEWS ${wage.period}, national annual wages in USD at P10, P25, P50, P75 and P90 were ${wage.engineering.annual.join(' / ')} for a broad engineering group that includes solar energy systems engineers (SOC ${wage.engineering.soc}), and ${wage.installers.annual.join(' / ')} for Solar Photovoltaic Installers (SOC ${wage.installers.soc}). The engineering figures cover several specialties. OEWS measures straight-time gross wages for covered employees, excluding the self-employed, overtime premiums and employer-paid benefits.

An engineering offer can include base salary and an incentive tied to the employer’s review or project terms. An hourly installer offer can add overtime, scheduled travel pay or benefit contributions. The installer OEWS category excludes solar PV electricians, who are classified under SOC 47-2111. An IBEW-covered electrical assignment can have a negotiated wage step and separate fringe schedule. An employee offer from a nonunion contractor can list its own hourly rate and benefit terms. Compare the actual classification and written terms, since OEWS gives no union premium for these roles. Covered nonexempt employees generally earn at least 1.5 times their regular rate after 40 hours in a workweek.

For offers in the same metro and at similar responsibility levels, compare guaranteed salary or hourly rate times guaranteed paid hours first. Keep bonuses, extra shifts, retirement contributions, commute and training costs on separate lines. Check where each job’s pay ladder recognizes real responsibility, such as owning the design review or moving from assisting to leading a crew. Look for supervised access to a model or installation record you can own in your first months.`,
    certs: [
      { name: 'Professional Engineer (PE)', officialScope: 'A common U.S. pathway pairs an EAC/ABET bachelor’s degree with qualifying engineering experience and the NCEES FE and PE exams.', workplaceBoundary: 'State practice rules determine when final work needs a seal and who can provide it. Engineering staff can prepare material under the level of supervision the state requires.', verificationTips: 'Identify the state board, the discipline, the person in responsible charge and the type of deliverable you want to prepare.', officialLinks: [sources.ncees, sources.florida] },
      { name: 'NABCEP PV Associate, PVDS and PVIP', officialScope: 'PV Associate is an early-career credential. PV Design Specialist (PVDS) recognizes PV design experience. PV Installation Professional (PVIP) covers a broader mix of design, installation, operations and commissioning.', workplaceBoundary: 'These credentials demonstrate training or experience at different levels. State engineering and electrical authorities determine legal work and signature rights.', verificationTips: 'Match the credential to your experience and check the issuer’s exam and experience eligibility before paying for training.', officialLinks: [sources.associate, sources.nabcep] },
      { name: 'Solar contractor and electrical work authorization', officialScope: 'California’s Contractors State License Board defines C-46 Solar Contractor for installing, maintaining, modifying and repairing solar systems within its scope. The Massachusetts electricians board treats installation of PV system components, including associated racks and modules, as licensed electrical work.', workplaceBoundary: 'The company license, each employee’s authorized tasks, and local inspection are distinct. The Massachusetts board distinguishes roof footers from installation of PV system components.', verificationTips: 'Identify who holds the license, which assignments a trainee can do under supervision, and who is responsible for the permitted work.', officialLinks: [sources.cslb, sources.massBoard] },
    ],
    interviewChecklistTitle: 'Four offer details to record',
    interviewChecklistQuestions: [
      { label: 'Cash and benefits', question: 'How much of this offer is base cash, and how much is bonus, overtime, travel, or employer-paid benefits?' },
      { label: 'Level and raises', question: 'What changes the grade: a reviewed design package, a credential, credited hours, or responsibility for a crew?' },
      { label: 'Early ownership', question: 'Which model assumption or field record would I own under supervision in the first six months?' },
      { label: 'Same-market annual comparison', question: 'How many hours and weeks are guaranteed, and what costs and reimbursements come with travel and training?' },
    ],
  },
  thirtyDayPlugin: {
    badge: 'Two paper portfolios',
    title: 'Build a 30-day solar work sample',
    summary: 'Choose the design or field documentation track. Use public U.S. materials with hypothetical projects. Keep all submissions in your own files.',
    tracks: [
      { id: 'solar-design', title: 'Design review and energy estimates', badge: 'Design track', tone: 'roleA', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Use the NLR PVWatts input guide and its Golden, Colorado example to build an assumption sheet. Show source and unit for each input, plus one unknown per site category.' },
        { weekLabel: 'Week 2', deliverable: 'Compare two preliminary production estimates for the public example, changing only one loss assumption. Save the before and after inputs and annual kWh so a reader can reproduce the comparison.' },
        { weekLabel: 'Week 3', deliverable: 'Draft a one-page design review memo that sorts inputs, modeled output and facts requiring a site reviewer. Mark three places where an assumption changes the interpretation.' },
        { weekLabel: 'Week 4', deliverable: 'Create a review index linking your estimate, assumptions and memo. Leave a clear owner and status for each unresolved question.' },
      ] },
      { id: 'solar-installation', title: 'Installation paperwork and closeout', badge: 'Field track', tone: 'roleB', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Use Torrance’s automated permit requirements to build a mock packet index. List the roof layout, line diagram and equipment data sheets, with a date and revision for each.' },
        { weekLabel: 'Week 2', deliverable: 'Create an equipment receipt log using invented model codes. Give each item a schedule reference, count and status, and flag one code that disagrees with the schedule.' },
        { weekLabel: 'Week 3', deliverable: 'Make a closeout transmittal with separate entries for the field packet, design response and inspection record. Include which document is missing in your scenario.' },
        { weekLabel: 'Week 4', deliverable: 'Ask a reader to trace one discrepancy from the receipt log to the transmittal. Record whether they found the item, original revision, response owner and disposition.' },
      ] },
    ],
  },
  checklist: {
    title: 'Compare skills and conditions separately',
    summary: 'Choose a skill for your next practice session. Then decide which conditions you could handle week after week.',
    skillsHeading: 'Skills I want to build',
    skillsOptions: [
      { id: 'model', track: 'roleA', label: 'Explain a production model', summary: 'Trace shading and equipment assumptions to one model result.', interviewQuestions: ['Which model input would I own, and how is it reviewed?'] },
      { id: 'one-line', track: 'roleA', label: 'Review a PV one-line', summary: 'Connect the drawing to the equipment schedule and utility packet.', interviewQuestions: ['Who checks my drawing review before the project submits it?'] },
      { id: 'record', track: 'roleB', label: 'Record a layout discrepancy', summary: 'Identify the zone, sheet version and field record before writing a note.', interviewQuestions: ['What level of detail does your crew lead need to act on a discrepancy?'] },
      { id: 'handoff', track: 'roleB', label: 'Identify closeout records', summary: 'Track who records installed equipment, open items and field handoff.', interviewQuestions: ['Which piece of closeout does an entry-level installer own?'] },
    ],
    conditionsHeading: 'Conditions I can work with',
    conditionsOptions: [
      { id: 'review-pressure', track: 'roleA', label: 'Several drawings in review', summary: 'Compare desk time and the interruptions that come with resubmissions and contractor questions.', interviewQuestions: ['How many active jobs was a junior designer assigned last month?'] },
      { id: 'site-days', track: 'roleA', label: 'Design and site days', summary: 'Identify whether the position includes surveys or commissioning travel.', interviewQuestions: ['How were your last two site visits scheduled and staffed?'] },
      { id: 'heights', track: 'roleB', label: 'Rooftops and lifting', summary: 'Consider time outdoors, work at height and repeated material handling.', interviewQuestions: ['What share of the current workload is rooftop versus ground-mount work?'] },
      { id: 'workweek', track: 'roleB', label: 'Travel and variable hours', summary: 'Compare job locations, paid travel and what happens when weather changes the schedule.', interviewQuestions: ['What was a typical scheduled week on the last project, and what changed it?'] },
    ],
    defaultInterviewQuestions: ['Bring one job posting and identify one deliverable, one reviewer and one working condition you want to verify.'],
    crossTrackNote: 'You can enjoy tracing a design and prefer the field schedule, or enjoy field records and prefer desk work. Choose a skill to try and treat the work setting as its own decision.',
    offlinePrintHint: 'Keep a copy of your questions beside each job description.',
  },
  desktopExercise: {
    sectionTitle: 'Try two solar job checks in five minutes',
    summary: 'Pick one track. Use the invented records and a calculator or paper. Your output is a note for review. Leave roof access, equipment selection, electrical work and approval of real work to the people responsible for the project.',
    publicLinksHeading: 'Original methods and rules: ',
    publicLinks: [sources.pvsyst, sources.voltage, sources.osha],
    factSummaryHeading: 'Offline evidence card: ',
    factSummary: `PVsyst separates the nameplate DC-to-AC ratio from checking cold string voltage against an inverter limit. The construction fall-protection rule addresses the hazard of contacting a lower level. Every value below is invented for this paper exercise.

Design card ${designCard.id}: The array is rated ${designCard.dcKw} kW DC and the string inverter ${designCard.acKw} kW AC. The fictional string shows ${designCard.referenceVolts} V open circuit at ${designCard.referenceC} °C. The card supplies a ${designCard.coldFactor.toFixed(2)} multiplier for ${designCard.coldC} °C and a mock inverter limit of ${designCard.limitVolts} V. For this card, divide the power ratings and multiply the reference voltage by the supplied factor.

Field card ${fieldCard.id}: A mock fall-clearance worksheet lists three prefilled allowances of ${fieldCard.allowancesFt.join(', ')} ft. The sketch shows ${fieldCard.availableFt} ft to a lower obstruction. Add the three entries for the paper requirement. Checklist entries: lower obstruction shown, roof-edge protection record missing, safety reviewer sign-off pending.`,
    taskA: { title: 'Design track: write a sizing review note', instruction: 'Name the card. Calculate the DC-to-AC ratio and cold string voltage. Flag the result against the mock limit for the engineer of record. Keep the review open and state that the note gives no work clearance.' },
    taskB: { title: 'Field track: fill the hazard checklist', instruction: 'Name the card. Compare required paper clearance with the distance shown. Record the obstruction, the missing roof-edge protection record and sign-off status. Send the open item to the designated site safety reviewer. State that the note gives no work clearance.' },
    rubricTitle: 'Check your calculations and handoff',
    rubricHeading: 'Four checks for either track',
    rubricPassRule: 'Hit both shared checks and the two for your track.',
    rubricItems: [
      'Shared: Name the card and flag the comparison that fails.',
      'Shared: Name the reviewer, keep the item open and give no work clearance.',
      `Design: Show the ${designRatio} DC-to-AC ratio and ${coldVolts} V cold string voltage.`,
      `Design: Flag the ${excessVolts} V excess against the mock limit.`,
      `Field: Show ${requiredFt} ft required on paper and a ${missingFt} ft shortfall.`,
      'Field: Record the obstruction, missing roof-edge protection record and pending sign-off.',
    ],
    sampleAnswerALabel: 'Sample design note: ',
    sampleAnswerA: `${designCard.id}: ${designCard.dcKw} ÷ ${designCard.acKw} = ${designRatio}. At ${designCard.coldC} °C the worksheet gives ${designCard.referenceVolts} × ${designCard.coldFactor.toFixed(2)} = ${coldVolts} V, or ${excessVolts} V above the mock limit. Flag the conflict for the engineer of record. Design review stays open. This note gives no work clearance.`,
    sampleAnswerBLabel: 'Sample field checklist: ',
    sampleAnswerB: `${fieldCard.id}: ${fieldCard.allowancesFt.join(' + ')} = ${requiredFt} ft required on paper. The lower obstruction shown leaves ${fieldCard.availableFt} ft, a ${missingFt} ft shortfall. Roof-edge protection record missing. Sign-off pending. Send the checklist to the designated site safety reviewer. Keep the item open. This note gives no work clearance.`,
  },
  tools: {
    title: 'Choose your next step',
    summary: 'Pick the tool that answers the question you have now.',
    cards: [
      { id: 'compare', badge: 'Compare two roles', meta: 'Career comparison', tone: 'neutral', title: 'Compare another career pair', description: 'Put two occupations side by side for duties, outlook and interests.', purposeHint: 'Use this if electrical work or engineering technology is also on your shortlist.', ctaLabel: 'Open career comparison', href: '/en/career/compare' },
      { id: 'worksheet', badge: 'Record your notes', meta: 'Career worksheet', tone: 'roleA', title: 'Save questions for a conversation', description: 'Record your evidence, open questions and the working conditions you want to check.', purposeHint: 'Use this when you have a job posting or training program in mind.', ctaLabel: 'Open the interest worksheet', href: '/en/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: 'Explore interests', meta: '60 questions', tone: 'roleB', title: 'Holland Career Interest Test', description: 'See how you rank across the six RIASEC interest dimensions.', purposeHint: 'Use this if you are deciding which activities are worth trying.', ctaLabel: 'Explore your career interests', href: '/en/tests/holland-career-interest-test-riasec' },
      { id: 'career', badge: 'Explore work style', meta: '94 questions', tone: 'accent', title: 'Career Planning and Work Style Test', description: 'Reflect on work activities, work style and conditions that matter to you.', purposeHint: 'Use this if job setting and how you work are the deciding factors.', ctaLabel: 'Explore your work style', href: '/en/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: 'Read the individual career profiles',
    profileLinks: [
      { label: 'Solar Energy Systems Engineers', href: '/en/career/jobs/solar-energy-systems-engineers' },
      { label: 'Solar Photovoltaic Installers', href: '/en/career/jobs/solar-photovoltaic-installers' },
    ],
  },
  faqs: [
    { id: 'pay-and-level', question: 'How do I compare a solar engineering salary with an installer offer?', answer: 'Run a guaranteed-cash comparison in the same metro at comparable responsibility levels. For an hourly offer, multiply the rate by paid hours per week and paid weeks, then price extra hours, travel compensation and employer contributions separately. Give target bonuses and unguaranteed overtime a second scenario with zero payout. An IBEW wage schedule applies to its covered classification, so compare the step and fringe package with a nonunion offer for the same trade, duties and metro. Compare grade progression too: a first reviewed production model or a supervised rack and inspection record can show a better learning path than months of redrawing layouts or hauling materials.' },
    { id: 'education-cost', question: 'Which path lets me start earning sooner?', answer: 'A paid installer opening or electrical apprenticeship lets you start earning when you are hired. The engineering route usually starts with a bachelor’s. Compare the school’s price after grants, fees and living costs with your actual paid start date and the cost of tools, travel or classes. Put loans in their own column. At year five, look for reviewed calculations and qualifying experience on the engineering track, or logged hours and crew responsibility on the installation track.' },
    { id: 'license', question: 'Do I need a license just to get started in solar?', answer: 'The U.S. has separate paths for professional engineering, contractor licensing and trade work. An entry design role can prepare documents under required supervision. A seal is tied to the project and responsible PE where required. California has a C-46 Solar Contractor classification. Massachusetts board guidance places PV components and associated racking within licensed electrical work while distinguishing roof footers. Check the specific tasks assigned to the opening before choosing a course or a crew.' },
    { id: 'nabcep-use', question: 'Which NABCEP credential fits a first solar job?', answer: 'PV Associate is the starting point for documenting fundamentals. Design specialists can work toward PVDS when they have the experience the credential requires. PVIP fits experience across a broader set of installation and project duties. Put the credential beside your actual work sample and verify whether the role requires an electrical license or engineering supervision separately.' },
    { id: 'grid-approval', question: 'Who decides when a solar system can connect to the grid?', answer: 'Identify the point of connection, whether the power is sold at retail or wholesale, and which authority governs the project. For one concrete example, Massachusetts publishes a local utility process for retail distributed generation. For transmission or wholesale projects, ask the responsible utility or grid operator which procedures or tariff govern. A wholesale generator can be subject to federal rules even when it connects to a dual-use distribution facility. Permit review and required inspections are separate. Track which organization is reviewing the equipment list and drawing revision, and which approval is still outstanding.' },
    { id: 'switch-tracks', question: 'Can installing panels lead to a design job?', answer: 'Yes. Field experience gives you examples of where drawings and site conditions diverge. A bridge role can involve checking equipment schedules, documenting changes or supporting layouts. For an engineering path, build evidence that you can explain a design assumption and take the degree, experience and licensure route that fits the work you want.' },
    { id: 'automation-2026', question: 'What can solar design software and AI automate in 2026?', answer: 'Aurora SmartRoof can draft roof models and flag obstructions from aerial and satellite imagery. PVWatts and SAM can estimate production from modeled inputs. The designer verifies geometry, equipment assumptions and the package before release. For an installation crew, a model can provide a reference. The crew still needs to record what was encountered, route discrepancies, and leave real safety decisions and commissioning sign-off to the assigned people.' },
  ],
  sourceGroups: [
    { id: 'work-and-wages', title: 'Occupation definitions, U.S. wages and career paths', links: [sources.engineer, sources.installer, sources.crosswalk, sources.wageA, sources.wageB, sources.doe, sources.grid, sources.field] },
    { id: 'licenses-and-standards', title: 'Credentials, state work scope and interconnection', links: [sources.ncees, sources.cslb, sources.massBoard, sources.massUtility, sources.ferc, sources.nec, sources.florida, sources.ieee, sources.ul, sources.osha, sources.nabcep, sources.associate] },
    { id: 'offer-and-training', title: 'Pay terms and training routes', links: [sources.overtime, sources.ibew, sources.iec, sources.aid] },
    { id: 'plans-and-tools', title: 'Public plan requirements and tool capabilities', links: [sources.drawings, sources.helioscope, sources.sam, sources.pvsyst, sources.voltage, sources.connectors, sources.diagnostics, sources.irradiance, sources.optimizers, sources.aurora] },
    { id: 'en-solar-thirty-day-materials', title: 'Public material for the 30-day solar work sample', requiresPlugin: 'thirtyDay', links: [sources.pvwattsInputs, sources.torrance] },
  ],
};
