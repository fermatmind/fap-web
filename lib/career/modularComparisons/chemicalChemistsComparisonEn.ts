import type { ModularComparisonSpec } from "../modularComparison";

const engineer = 'Chemical engineer';
const chemist = 'Chemist';

const wages = {
  period: 'May 2025',
  engineering: { soc: '17-2041', annual: ['$79,420', '$97,820', '$125,040', '$157,190', '$182,880'] },
  chemistry: { soc: '19-2031', annual: ['$58,460', '$69,460', '$91,240', '$125,550', '$160,830'] },
};

const sources = {
  engineer: { label: 'O*NET Chemical Engineers', href: 'https://www.onetonline.org/link/summary/17-2041.00', note: 'Tasks, reported job titles and RIC interest code.' },
  chemist: { label: 'O*NET Chemists', href: 'https://www.onetonline.org/link/summary/19-2031.00', note: 'Analysis, method development, QC and IRC interest code.' },
  engineeringPay: { label: 'BLS OEWS Chemical Engineers', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=170000&measure=13&occupation=172041&year=2025', note: 'National wage percentiles, May 2025, SOC 17-2041.' },
  chemistryPay: { label: 'BLS OEWS Chemists', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=190000&measure=13&occupation=192031&year=2025', note: 'National wage percentiles, May 2025, SOC 19-2031.' },
  abet: { label: 'ABET accredited program search', href: 'https://amspub.abet.org/aps/category-search?countries=US&disciplines=13&disciplines=47', note: 'Check the exact campus, degree and engineering program.' },
  acs: { label: 'University of Florida example of ACS-certified coursework', href: 'https://chem.ufl.edu/academics/undergrad-program/acs-certified-program/', note: 'One school’s distinction between approval of the program and certification of a degree.' },
  licensure: { label: 'NCEES U.S. engineering licensure pathway', href: 'https://ncees.org/licensure/', note: 'Education, supervised experience and exams. Verify the state board pathway.' },
  fe: { label: 'NCEES Fundamentals of Engineering exam', href: 'https://ncees.org/exams/fe-exam/' },
  pe: { label: 'NCEES PE Chemical exam', href: 'https://ncees.org/exams/pe-exam/chemical/' },
  california: { label: 'California Professional Engineers Act', href: 'https://www.bpelsg.ca.gov/laws/pe_act.pdf', note: 'Classification of engineering disciplines and industrial exemption, §§ 6732, 6747–6748.' },
  californiaBoard: { label: 'California Board guide to PE license categories', href: 'https://bpelsg.ca.gov/applicants/appintrope.shtml', note: 'Chemical is a title-act branch. The Board distinguishes title protection from practice restrictions.' },
  texas: { label: 'Texas engineering board Acts and Rules', href: 'https://pels.texas.gov/downloads/lawrules.pdf', note: 'Private-entity exemption in § 1001.057 and sealing procedures in § 137.33.' },
  aid: { label: 'Federal Student Aid guide to aid offers', href: 'https://fsapartners.ed.gov/fsa-print/publication/1003536', note: 'Compare net price and distinguish scholarships, grants and loan obligations.' },
  flsa: { label: 'Federal overtime rules', href: 'https://www.govinfo.gov/content/pkg/USCODE-2024-title29/pdf/USCODE-2024-title29-chap8-sec207.pdf', note: '29 U.S.C. § 207, including overtime for covered nonexempt workers.' },
  exemption: { label: 'Learned professional exemption', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title29-vol3/pdf/CFR-2025-title29-vol3-part541.pdf', note: '29 CFR §§ 541.300–541.301 and Subpart G.' },
  psm: { label: 'OSHA Process Safety Management standard', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title29-vol5/pdf/CFR-2025-title29-vol5-sec1910-119.pdf', note: '29 CFR 1910.119, scope, process safety information, hazard analysis and change control.' },
  rmp: { label: 'EPA Risk Management Program overview', href: 'https://www.epa.gov/rmp/risk-management-program-rmp-rule-overview', note: 'Covered processes, accident prevention and emergency response.' },
  rmpPha: { label: 'EPA Program 3 process hazard analysis', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title40-vol17/pdf/CFR-2025-title40-vol17-sec68-67.pdf', note: '40 CFR 68.67 lists HAZOP among the available methods.' },
  sds: { label: 'OSHA Hazard Communication and safety data sheets', href: 'https://www.govinfo.gov/content/pkg/CFR-2024-title29-vol6/xhtml/CFR-2024-title29-vol6-sec1910-1200.html', note: '29 CFR 1910.1200, Appendix D, Table D.1.' },
  glp: { label: 'FDA GLP scope for nonclinical studies', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol1/pdf/CFR-2025-title21-vol1-sec58-1.pdf', note: '21 CFR 58.1 defines covered nonclinical laboratory studies.' },
  qualityUnit: { label: 'Drug CGMP quality control unit responsibilities', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol4/pdf/CFR-2025-title21-vol4-sec211-22.pdf', note: '21 CFR 211.22 covers quality unit authority and production-record review.' },
  release: { label: 'Drug CGMP testing and release for distribution', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol4/pdf/CFR-2025-title21-vol4-sec211-165.pdf', note: '21 CFR 211.165 covers final specifications, acceptance criteria and rejection.' },
  laboratoryRecords: { label: 'Drug CGMP laboratory records', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol4/pdf/CFR-2025-title21-vol4-sec211-194.pdf', note: '21 CFR 211.194 covers sample identity, method, original data, result, and second-person review.' },
  investigation: { label: 'Drug CGMP production record review', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title21-vol4/pdf/CFR-2025-title21-vol4-sec211-192.pdf', note: '21 CFR 211.192 covers discrepancy investigation and documentation.' },
  analytical: { label: 'ICH Q2(R2) analytical procedure validation', href: 'https://database.ich.org/sites/default/files/ICH_Q2%28R2%29_Guideline_2023_1130.pdf', note: 'FDA-adopted ICH guideline. Validation characteristics depend on a method’s intended purpose.' },
  manufacturing: { label: 'ICH Q13 continuous manufacturing', href: 'https://database.ich.org/sites/default/files/ICH_Q13_Step4_Guideline_2022_1116.pdf', note: 'FDA-adopted ICH guideline covering process dynamics and material traceability.' },
  pilot: { label: 'U.S. Department of Energy renewable-chemical scale-up case', href: 'https://www.energy.gov/cmei/fuels/articles/computational-modeling-scales-renewable-chemical-process-1000x-single-step', note: 'A published pilot-scale case, with a specialty material end use.' },
  simulator: { label: 'DWSIM simulation guide', href: 'https://dwsim.org/help/main/03-introduction.html', note: 'Steady-state and dynamic process simulation and model inputs.' },
  cdsIntegration: { label: 'Agilent OpenLab peak integration help', href: 'https://openlab.help.agilent.com/en/mergedProjects/DataAnalysis/DA_IntegrationEvents.htm', note: 'The configured processing method supplies the integrator and its events.' },
  cdsQuantification: { label: 'Agilent OpenLab quantification and reporting fields', href: 'https://openlab.help.agilent.com/2.7/en/mergedProjects/ReportTemplateEditor/80200.htm', note: 'Reported values include calculated amounts and peak measurements.' },
  nist: { label: 'NIST Chemistry WebBook reference data', href: 'https://webbook.nist.gov/chemistry/', note: 'Bibliographic records and reference data for a paper-only provenance exercise.' },
};

const record = {
  lot: 'L-24',
  specification: 'S3',
  lower: '95.0%',
  upper: '105.0%',
  result: '94.8%',
  design: 'M2',
  traveler: 'M1',
};

export const chemicalChemistsComparisonEnSpec: ModularComparisonSpec = {
  pairId: 'chemical-engineers-vs-chemists',
  locale: 'en',
  title: 'Chemical Engineers vs. Chemists: Work, Pay, and Degrees',
  shortTitle: 'Chemical Engineers vs. Chemists',
  description: 'Compare U.S. chemical engineering and chemistry by daily work, May 2025 pay, degree and PE paths, process scale-up, and laboratory quality control.',
  regionLabel: 'United States',
  authorName: 'FermatMind Editorial',
  datePublished: '2026-11-25',
  dateModified: '2026-11-25',
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: 'A new product works in a small lab batch. The chemist checks what the team made and how confidently it can measure the result. The chemical engineer works out how a larger line could make the same product consistently and safely. Consider chemical engineering if you want to own the design of the process. Consider chemistry if you want to own the evidence about the material or the test. Both roles can work in the same plant, development lab, or quality team.',
    roleA: { badgeTitle: engineer, riasecLabel: 'Holland top 3: RIC', aliases: 'Process engineer, process control engineer, refinery process engineer', keywords: 'Scale-up, material and energy balances, equipment, process controls' },
    roleB: { badgeTitle: chemist, riasecLabel: 'Holland top 3: IRC', aliases: 'Analytical chemist, research chemist, quality control chemist', keywords: 'Experiments, materials, analytical methods, quality control' },
    interviewBoundaryTitle: 'Which decision would you own?',
    interviewBoundaryQuestions: [
      'For a pilot run, would I submit the equipment and control design, or the data package explaining what the trial produced?',
      'When a result misses specification, would I trace the production change, evaluate the measurement and its records, or handle both with separate reviewers?',
    ],
    riasecBoundaryNote: 'The badges show FermatMind’s top three interest dimensions for each occupation. They match the separately published FermatMind codes and O*NET’s occupational codes: RIC for chemical engineers and IRC for chemists. R stands for Realistic, I for Investigative, and C for Conventional. The order is a prompt to try different work activities. Check skills and hiring requirements separately.',
  },
  topology: {
    title: 'How lab evidence reaches the production line',
    summary: 'In process development, chemistry describes the material, the result, and the limits of the measurement. Engineering turns those inputs into a process design and sends pilot-run context back to the lab. Quality and site leaders review different decisions according to their assigned responsibilities.',
    ariaLabel: 'A three-step engineering path exchanges pilot records and measurement evidence with a three-step chemistry path.',
    leftZoneTitle: 'Process engineering',
    leftSteps: [
      { title: 'Define the process', detail: 'Set the design basis' },
      { title: 'Plan the pilot', detail: 'Log equipment/loops' },
      { title: 'Review the run', detail: 'Trace changes' },
    ],
    centerZoneTitle: 'Same pilot lot',
    upperBridge: { title: 'Lab to line', line1: 'Test results', line2: 'Method limits' },
    lowerBridge: { title: 'Line to lab', line1: 'Lot history', line2: 'Sampling context' },
    rightZoneTitle: 'Chemistry',
    rightSteps: [
      { title: 'Define the question', detail: 'Pick what to measure' },
      { title: 'Check the method', detail: 'Check method fit' },
      { title: 'Report the result', detail: 'Record the evidence' },
    ],
  },
  matrix: {
    title: 'What each job delivers across three industries',
    summary: 'Follow the work from design or experiment to the reviewed record. The gap between the two jobs shows up in what would delay a decision and who can resolve it.',
    roleAColumn: engineer,
    roleBColumn: chemist,
    expandButtonLabel: 'Show tools, degree paths, and sign-off',
    collapseButtonLabel: 'Hide tools, degree paths, and sign-off',
    rows: [
      { id: 'process-plants', dimension: 'Chemical plants, petrochemicals, and clean energy', roleA: 'Turn pilot data into material and energy balances, equipment specifications, and a control design. At a refinery or a renewable-materials pilot, the same design must account for throughput, product quality, reliability, and what changes with scale.', roleB: 'Characterize feedstocks, products, and variation between samples. Explain whether a result points to a material change or an analytical issue. Those findings can help the plant decide which process records to examine.', defaultVisible: true },
      { id: 'development', dimension: 'Pharma, biomaterials, and specialty R&D', roleA: 'Translate a lab result into a development package that a pilot team can review. Track how equipment, material movement, and sampling affect the evidence when a process moves from the lab to a larger line.', roleB: 'Design experiments, characterize candidate materials, and explain which properties or measurements carry forward. A method-development chemist can turn an exploratory measurement into evidence for a method transfer or validation plan.', defaultVisible: true },
      { id: 'analysis-qc', dimension: 'Analytical work and quality control', roleA: 'Provide the batch timeline, sampling location, and process-change record for a quality investigation. Trace which other lots or equipment records share the same change.', roleB: 'Use the assigned method to review HPLC or GC-MS data where relevant. Retain the sample identity, chromatograms or spectra, calculations, and result. In finished-drug CGMP, the quality control unit has its own approval or rejection authority.', defaultVisible: true },
      { id: 'working-conditions', dimension: 'Where your week happens', roleA: 'Design analysis can happen at a desk. Production support can take you to plants, pilot equipment, or refineries with site access and protective equipment requirements. A startup or upset can bring extra hours. Check whether the offer includes call rotation or travel.', roleB: 'Lab work can mean extended bench or instrument time, protective equipment, and documentation before you leave a run. R&D can involve repeated experiments with inconclusive results. A QC role can put more of your day on sample queues and batch deadlines.', defaultVisible: true },
      { id: 'friction', dimension: 'What can wear you down', roleA: 'A recommendation can wait on operations, maintenance, safety, or capital approval. Look at a real project timeline if chasing incomplete records and explaining trade-offs across teams would frustrate you.', roleB: 'A result needs to survive review of the controls and raw data, even on a tight deadline. Check whether you would enjoy tracing questionable data back to the sample, method version, or instrument record before reaching a conclusion.', defaultVisible: true },
      { id: 'tools', dimension: 'Tools and work products', roleA: 'Use process models, spreadsheets, and piping and instrumentation diagrams (P&IDs) to carry design decisions into reviews. A simulation report should make its assumptions and model limits clear.', roleB: 'Use lab records and chromatography software to connect a result to the sample and the approved method. HPLC separates compounds in a liquid stream. GC-MS combines gas chromatography with mass spectrometry. The safety data sheet (SDS) describes hazards and handling information.', defaultVisible: false },
      { id: 'education', dimension: 'Degrees and first assignments', roleA: 'A bachelor’s in chemical engineering or a related field is the BLS entry path. Compare coursework in transport, thermodynamics, process design, and process hazards. A co-op can let you try a supervised engineering assignment before graduation.', roleB: 'A chemistry or related bachelor’s can qualify you for some lab and analytical roles. An M.S. or Ph.D. may be required for particular research jobs. Compare supervised lab work, instrumental analysis, and whether you can take a small project from raw data to a written conclusion.', defaultVisible: false },
      { id: 'authority', dimension: 'Who can sign or approve', roleA: 'In-house design review and legal authority to sign or seal engineering work are separate. State engineering law determines when a PE is required for the work and when an industrial exemption applies.', roleB: 'An analyst can sign their own test record under the lab’s procedures. Finished-drug CGMP calls for a second-person review of original lab records and gives the quality control unit authority over product approval or rejection.', defaultVisible: false },
    ],
  },
  incident: {
    title: 'When the pilot lot misses a drug specification',
    summary: 'In this simulated finished-drug manufacturing case, a reported assay misses the approved specification, and production records reference two revisions of an equipment drawing. The investigation needs the original lab record and the production history.',
    triggerLabel: 'What arrives: ',
    triggerBody: 'QC reports a result below the approved limit. The process engineer finds a newer drawing in the controlled index and an older revision in the lot traveler. The file has no record showing which drawing was effective for that lot.',
    triggerCaveat: 'The team assignments below are for this scenario. The plant uses separate controls for quality decisions, engineering changes, and site authorization.',
    rows: [
      { stage: 'Trace the result', roleLabel: 'QC chemist and lab reviewer', tone: 'roleB', verifiedFacts: 'Lot and sample identities, approved method and specification, reported result, and raw-data records.', openGaps: 'Whether the sample and records support the reported result and whether there is a documented analytical cause.', actionAndApproval: 'The chemist preserves the result and raw data and documents the discrepancy. The assigned reviewer checks the original record. Any change to the conclusion needs supporting evidence and the quality unit’s review.' },
      { stage: 'Trace the production record', roleLabel: 'Process engineer and operations lead', tone: 'roleA', verifiedFacts: 'Two drawing revisions appear in the document index and in the lot traveler.', openGaps: 'The effective drawing and equipment history for this lot, plus any affected lots.', actionAndApproval: 'The engineer reconciles the record with change control and checks the lot timeline with operations. The site’s designated authority approves engineering changes and directs who can carry them out.' },
      { stage: 'Decide lot disposition', roleLabel: 'Quality control unit', tone: 'roleB', verifiedFacts: 'The lab record and the production review now identify the evidence available for this lot.', openGaps: 'Unresolved discrepancies, related lots, and whether the governing specifications are satisfied.', actionAndApproval: 'The quality control unit reviews the investigation and records its decision to approve or reject the lot. The operations team acts under the site’s authorization and the approved disposition.' },
    ],
    recoveryAcceptanceTitle: 'What closes the review',
    recoveryAcceptanceCriteria: 'A closed review ties the lot to the full lab data, the approved specification, the equipment revision evidence, and a documented quality-unit disposition. If evidence is still missing, keep the question open and record its owner. A finished drug product that fails established specifications and relevant quality control criteria must be rejected under the release rule. A separate engineering change record governs any authorized change to the line.',
    defenseLayerNote: 'OSHA Process Safety Management (PSM, 29 CFR 1910.119) applies to covered processes that meet its substance and quantity criteria, subject to exclusions. Under OSHA PSM, covered processes require process safety information that includes P&IDs, and a Hazard and Operability Study (HAZOP) is one allowed method for process hazard analysis. EPA’s Risk Management Program (RMP) separately applies to covered stationary sources with a regulated substance above its threshold in a process. Program 3 lists HAZOP among its options. A product quality decision and a process safety review cover different risks.',
  },
  payAndCerts: {
    title: 'U.S. pay, degrees, and credentials',
    summary: 'Start with the national wage distribution. Then price the actual job and the education it takes to reach it.',
    salaryHeading: 'What national wages tell you about an offer',
    salaryBody: `Chemical engineers had the higher national median in ${wages.period}, and the chemist 75th percentile of ${wages.chemistry.annual[3]} was slightly above the chemical engineer median of ${wages.engineering.annual[2]}. The BLS OEWS national 10th, 25th, 50th, 75th, and 90th percentiles in U.S. dollars per year were ${wages.engineering.annual.join(' / ')} for chemical engineers (SOC ${wages.engineering.soc}) and ${wages.chemistry.annual.join(' / ')} for chemists (SOC ${wages.chemistry.soc}). These are straight-time gross wages for covered employees. The survey excludes self-employed workers and leaves out overtime pay, shift differentials, nonproduction bonuses, and employer-paid benefits. The distributions pool employers, locations, and experience levels.

A plant engineering package can include salary, a performance bonus, and separately stated shift, call, or site pay. A lab package can include salary or hourly wages, and written premiums for an evening or weekend schedule where offered. Keep a target bonus and a shift premium tied to a specific rotation in separate lines. For employees covered by federal overtime rules and classed as nonexempt, overtime is generally at least 1.5 times the regular rate after 40 hours in a workweek. The learned professional exemption depends on duties and pay tests. A job title alone cannot establish the classification.

For offers in the same metro, compare similar experience and responsibility. Put guaranteed annual cash on one line: base salary, or hourly rate times guaranteed paid hours, plus any guaranteed payments. Put conditional differentials, bonus, overtime, and employer retirement or health contributions on separate lines. Factor in travel, off-hours coverage, and training expense. Compare the level of work in the grade description: a reviewed design package and a defined area of plant responsibility, or ownership of a validated method and review of difficult data. Favor roles that give you supervised access to those decisions.`,
    certs: [
      { name: 'ABET degree, FE, and PE Chemical', officialScope: 'A common U.S. pathway is a degree accredited by ABET’s Engineering Accreditation Commission, progressive experience, and NCEES FE and PE exams. PE Chemical is a discipline-specific exam. The state or territory board grants the license.', workplaceBoundary: 'Chemical engineering staff can enter through supervised or exempt work. A role that involves regulated engineering practice or sealing final documents calls for the state’s specific rules.', verificationTips: 'Check the program’s accreditation and graduation coverage. Use the board’s instructions to verify education, acceptable experience, timing, and discipline or title rules.', officialLinks: [sources.abet, sources.licensure, sources.fe, sources.pe] },
      { name: 'Engineering practice in California and Texas', officialScope: 'California classifies Chemical Engineering as a title-act branch. The Board license governs use of the protected title. Civil, Electrical, and Mechanical Engineering are practice-act branches. California’s industrial exemption separately covers specified work tied to a company’s products, systems, or services. Texas defines a private-entity exemption for specified work and separately regulates engineering seals.', workplaceBoundary: 'Check the title you would use, the work you would perform, and whether an exemption covers the work. Direct service to the public and the purpose of the document can change the answer.', verificationTips: 'Read the state law and board rules for the employer and deliverable you are considering. Confirm who has responsible charge and whose seal is required when the work calls for one.', officialLinks: [sources.california, sources.californiaBoard, sources.texas] },
      { name: 'ACS approval and lab work authorization', officialScope: 'The American Chemical Society (ACS) approves undergraduate chemistry programs. A school can certify a graduate who completes its required coursework. FDA Good Laboratory Practice (GLP) rules cover specified nonclinical studies in support of FDA applications. Drug CGMP governs manufacturing quality controls, including finished-drug testing and records.', workplaceBoundary: 'ACS certification documents educational preparation. A laboratory assigns method training, review, and sign-off responsibilities through its own procedures and regulatory obligations.', verificationTips: 'Check whether the program is ACS-approved and whether your coursework qualifies for a certified degree. At the lab, confirm whether the work is research, a covered GLP study, or CGMP testing.', officialLinks: [sources.acs, sources.glp, sources.qualityUnit] },
    ],
    interviewChecklistTitle: 'What to get in writing',
    interviewChecklistQuestions: [
      { label: 'Grade and scope', question: 'Which design package or analytical method would I own at this grade, and which responsibilities qualify for the next grade?' },
      { label: 'Paid hours', question: 'Which hours or premiums are guaranteed, and what call, shift, travel, or overtime terms apply to this position?' },
      { label: 'Training access', question: 'Which design review or method investigation will I be allowed to join, and who signs my training record?' },
    ],
  },
  thirtyDayPlugin: {
    badge: 'Paper portfolio',
    title: 'Build four work samples in 30 days',
    summary: 'Work from public documents and keep each artifact to a page. Use fictional labels if you need an example. These are document-review exercises with no lab work, process operation, or equipment access.',
    tracks: [
      { id: 'engineering-portfolio', title: 'Chemical engineering track', badge: 'Scale-up and design review', tone: 'roleA', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Turn three O*NET engineering tasks into a one-page deliverables map. For each, name the input, the record you would submit, and who would review it in a fictional team.' },
        { weekLabel: 'Week 2', deliverable: 'Use OSHA’s PSM process safety information section to make a document index for an imaginary plant. Include a P&ID, an equipment record, and a safety-data record. Give each a revision field and a reviewer field.' },
        { weekLabel: 'Week 3', deliverable: 'Read the DOE renewable-chemical pilot case and make a timeline from lab evidence through modeling to pilot evidence. Mark each step as a reported observation or a proposed decision, and cite the supporting paragraph.' },
        { weekLabel: 'Week 4', deliverable: 'Use ICH Q13’s material traceability discussion to draft a pilot-to-quality handoff checklist. Show where lot identity, sampling context, and unresolved deviations would appear, and name a reviewer for each record.' },
      ] },
      { id: 'chemist-portfolio', title: 'Chemistry track', badge: 'Analytical evidence and reporting', tone: 'roleB', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Choose three O*NET analytical or documentation tasks and make an evidence map. Link each to one distinct artifact, such as a method record, a sample log, or a reviewed report.' },
        { weekLabel: 'Week 2', deliverable: 'Use ICH Q2(R2) to write a method-review brief. Give one plain-language reason each for checking accuracy, precision, and specificity or selectivity, and tie each reason to the intended use.' },
        { weekLabel: 'Week 3', deliverable: 'Make a provenance card from one public NIST Chemistry WebBook record. Record the data type, the cited reference if shown, and one reason a reference entry alone cannot establish the identity of an unknown sample.' },
        { weekLabel: 'Week 4', deliverable: 'Turn the drug CGMP laboratory record requirements into a reviewer checklist. Use a fictional blank report to show where sample identity, method, raw data, results, and second-person review belong.' },
      ] },
    ],
  },
  checklist: {
    title: 'Separate skills from working conditions',
    summary: 'Select tasks you want to get better at and conditions you can live with. A trade-off in one column can matter even if the other column appeals to you.',
    skillsHeading: 'Skills I want to practice',
    skillsOptions: [
      { id: 'balances', track: 'roleA', label: 'Explain a material or energy balance', summary: 'Connect a process input, output, and assumption in a checked design record.', interviewQuestions: ['What design calculation would I review with a senior engineer during my first project?'] },
      { id: 'revision-review', track: 'roleA', label: 'Trace a process change across documents', summary: 'Keep the controlled drawing, equipment record, and handover aligned.', interviewQuestions: ['Can a new engineer sit in on a design review or change-control meeting?'] },
      { id: 'methods', track: 'roleB', label: 'Judge whether a method fits the question', summary: 'Explain what a measurement supports and what still needs checking.', interviewQuestions: ['Which decisions can a new chemist make about method suitability and data review?'] },
      { id: 'trace-data', track: 'roleB', label: 'Build a traceable laboratory record', summary: 'Connect a reported result with the sample, raw data, and review.', interviewQuestions: ['Will I draft records for review, and when would I join a discrepancy investigation?'] },
    ],
    conditionsHeading: 'Working conditions I can accept',
    conditionsOptions: [
      { id: 'plant-hours', track: 'roleA', label: 'Plant access and call coverage', summary: 'Check production-site time, travel, personal protective equipment, and coverage outside regular hours.', interviewQuestions: ['What does a routine month of site coverage look like, and what happens during a startup?'] },
      { id: 'coordination', track: 'roleA', label: 'Cross-team design decisions', summary: 'Process recommendations can wait for capital, operations, or safety review.', interviewQuestions: ['Which teams review the design, and how are open decisions assigned?'] },
      { id: 'instrument-queue', track: 'roleB', label: 'Bench time and instrument queues', summary: 'Compare standing and protective equipment, scheduled batches, and desk time.', interviewQuestions: ['How do instrument or batch schedules affect the shift and breaks?'] },
      { id: 'repeat-work', track: 'roleB', label: 'Repeat work with unresolved results', summary: 'Research can require repeated checks; QC can require detailed review under a deadline.', interviewQuestions: ['How does your team allocate time for an inconclusive result or unexpected chromatogram?'] },
    ],
    defaultInterviewQuestions: ['What document does someone in this role hand over at the end of a good week?', 'What decision can I make after training, and who reviews the decisions that carry more risk?'],
    crossTrackNote: 'If both skill lists appeal, compare process development and analytical development openings using their deliverables and review responsibilities.',
    offlinePrintHint: 'Save or print the selections you want to bring to a job shadow or interview.',
  },
  desktopExercise: {
    sectionTitle: 'Try five minutes of pilot-lot record review',
    summary: 'Pick one track and use the offline record below. Spend one minute reading, three minutes writing a three-sentence note, and one minute checking it. You are reviewing paperwork for a fictional drug lot. Leave equipment, samples, and live systems out of the exercise.',
    publicLinksHeading: 'Public records guide: ',
    publicLinks: [
      { ...sources.laboratoryRecords, label: 'FDA laboratory record requirements', note: 'See the fields for sample, method, data, results, and review.' },
      { ...sources.release, label: 'FDA finished-drug release criteria', note: 'See how specifications and acceptance criteria connect to release.' },
    ],
    factSummaryHeading: 'Offline evidence card: ',
    factSummary: `The public rules link an identifiable sample to the method, original data, result, and review. A finished-drug release decision uses the approved specification and quality review. The exercise uses invented records and an invented acceptance interval.

Lot ${record.lot} has approved specification ${record.specification}, which accepts ${record.lower} through ${record.upper} inclusive. The reported result is ${record.result}. The sample and method IDs appear on the lab cover sheet. The original chromatogram and the second reviewer’s sign-off are missing from the packet.

The engineering index lists drawing revision ${record.design}. The lot traveler lists ${record.traveler}. The packet has no effective-revision entry for the lot. The assigned engineering lead reviews production history. The assigned lab reviewer checks the original lab record. The quality unit owns the lot disposition. The quality log has no disposition yet.`,
    taskA: { title: 'Engineering track — write a record discrepancy', instruction: `Name the lot and the reported result against ${record.specification}. Compare the drawing index and the lot traveler, and identify the record that would establish which revision governed the lot. Route the note to the engineering lead and state who owns disposition.` },
    taskB: { title: 'Chemistry track — write a lab review note', instruction: `Name the lot and the reported result against ${record.specification}. Tell the lab reviewer what is missing and what they would check against the cover sheet. Preserve the reported result and state who owns disposition.` },
    rubricTitle: 'Check your note',
    rubricHeading: 'Four checks for the track you picked',
    rubricPassRule: 'Pass when your note satisfies both shared checks and both checks for your track.',
    rubricItems: [
      `Shared — Identify lot ${record.lot} and report that ${record.result} is below the approved ${record.specification} lower limit of ${record.lower}.`,
      'Shared — State that the quality unit owns disposition and that none is recorded.',
      `Engineering — Distinguish index revision ${record.design} and traveler revision ${record.traveler}.`,
      'Engineering — Send the mismatch to the engineering lead and request the lot’s effective revision record.',
      'Chemistry — Retain the reported result and identify the missing original chromatogram and second-person review.',
      'Chemistry — Route the note to the lab reviewer and specify which cover-sheet information to check against the original records.',
    ],
    sampleAnswerALabel: 'Sample engineering note: ',
    sampleAnswerA: `Lot ${record.lot} was reported at ${record.result}, below the ${record.specification} lower limit of ${record.lower}. The engineering lead should reconcile index revision ${record.design} with traveler revision ${record.traveler} and obtain the effective revision record for this lot. The quality unit owns disposition and has recorded none yet.`,
    sampleAnswerBLabel: 'Sample chemistry note: ',
    sampleAnswerB: `Retain the reported ${record.result} for lot ${record.lot}, below the ${record.specification} lower limit of ${record.lower}. Send the missing original chromatogram and second-person review to the lab reviewer as open items, and ask them to match the cover sheet’s sample and method IDs to the original records. The quality unit owns disposition and has recorded none yet.`,
  },
  tools: {
    title: 'Pick your next step',
    summary: 'Choose the tool that matches the decision you have left.',
    cards: [
      { id: 'compare', badge: 'Compare adjacent roles', meta: 'Career comparison', tone: 'neutral', title: 'Put two career profiles side by side', description: 'Compare duties, outlook, and fit signals for another pair of careers.', purposeHint: 'Use this if you are also considering a neighboring role such as materials engineering.', ctaLabel: 'Open career comparison', href: '/en/career/compare' },
      { id: 'worksheet', badge: 'Prepare for a conversation', meta: 'Career worksheet', tone: 'roleA', title: 'Turn questions into an interview plan', description: 'Record the work sample, training, schedule, and approval questions you want to take to an employer or mentor.', purposeHint: 'Use this when you have a job description or lab to investigate.', ctaLabel: 'Open the interest worksheet', href: '/en/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: 'Explore your interests', meta: '60 questions', tone: 'roleB', title: 'Holland Career Interest Test', description: 'See your six RIASEC interest dimensions and three-letter code.', purposeHint: 'Use this to choose which kinds of work to try first.', ctaLabel: 'Explore career interests', href: '/en/tests/holland-career-interest-test-riasec' },
      { id: 'career', badge: 'Weigh work conditions', meta: '94 questions', tone: 'accent', title: 'Career Planning and Work Style Test', description: 'Reflect on work activities, work style, and conditions you want in a job.', purposeHint: 'Use this if the place, schedule, or working style is your biggest question.', ctaLabel: 'Explore your work style', href: '/en/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: 'Read the individual career profiles',
    profileLinks: [
      { label: 'Chemical Engineers', href: '/en/career/jobs/chemical-engineers' },
      { label: 'Chemists', href: '/en/career/jobs/chemists' },
    ],
  },
  faqs: [
    { id: 'pay-structure', question: 'What should I compare if two offers pay about the same?', answer: 'Compare the grade and the work you will own at that grade. Operations support may pay for a particular call schedule. A QC offer may pay a differential for hours on a particular shift. At the same location and level, forecast a month without conditional premium hours or bonuses, then add the documented terms for your actual schedule. Price health, retirement, and commute separately. Look for reviewed design or method work in the first six months. A title that keeps you updating drawings or logging samples without reaching the review step buys different experience.' },
    { id: 'degree-choice', question: 'Should I major in chemical engineering or chemistry?', answer: 'Choose chemical engineering for process modeling, equipment, and scale-up. Choose chemistry for experimental design, molecular or materials questions, and analytical methods. Compare the actual courses and the first work sample you could earn through a co-op or research placement. A bachelor’s is the U.S. entry baseline for both occupations, with some chemistry research positions requiring an M.S. or Ph.D. For a five-year comparison, put each program’s net price after grants and scholarships, borrowing and repayment, placement income, and months in paid work on a timeline. For a graduate route, include written funding, fees, and the time spent training. The wage distribution alone cannot price a graduate degree.' },
    { id: 'pe', question: 'Do chemical engineers need a PE license?', answer: 'A PE license is generally unnecessary for an entry-level chemical engineering job, according to BLS. State law governs professional practice and sealing. A common U.S. route is an EAC/ABET-accredited engineering degree, qualifying experience, the NCEES FE exam, and a PE exam such as PE Chemical. For a job preparing documents for another party, check the state board’s practice and sealing rules. In Texas, the private-entity exemption can cover in-house R&D or production for goods the company manufactures. Offering engineering services to the public requires a separate check under the state’s licensing rules. California treats Chemical Engineering as a title-act branch, so check whether the job uses the protected title. Check the state’s practice rules for the actual work and its industrial exemption separately.' },
    { id: 'glp-cgmp', question: 'What is the difference between a GLP lab and a GMP lab?', answer: 'FDA GLP covers specified nonclinical studies that support or are intended to support applications to FDA. A finished-drug CGMP lab generates and reviews evidence for manufacturing quality decisions such as whether a batch meets its specifications. Method development can happen before routine QC use. Ask what the data will support: a nonclinical study submission, a development decision, or a manufacturing disposition.' },
    { id: 'role-switch', question: 'Can a chemist move into process development or a chemical engineer move into a lab?', answer: 'Yes, where the work and training match. A chemist can bring materials and method expertise to a development team and add coursework or supervised experience in transport, scale-up, and process design for engineering assignments. An engineer can add instrument and data-review experience for analytical development. Compare the work sample the role requires. A validated method report, a reviewed process model, and a supervised quality investigation demonstrate different things.' },
    { id: 'automation-2026', question: 'What can chemical engineering and laboratory software automate in 2026?', answer: 'A process simulator such as DWSIM can solve the flowsheet equations for the model and inputs you specify. An OpenLab chromatography data system can integrate peaks and calculate results with a configured method. An engineer checks model assumptions and whether the results describe the real system. A chemist checks sample identity, method suitability, and flagged data or integration changes against the original records. For finished drugs, a second person reviews the original lab records and signs or initials the review. The quality control unit holds the authority to approve or reject the batch for release.' },
    { id: 'portfolio-check', requiresPlugin: 'thirtyDay', question: 'What belongs in a beginner portfolio if I lack plant or lab access?', answer: 'Bring one piece a reviewer can reproduce from a public record, such as a process document index or a method-review brief. Mark each invented field as an example and cite the public source where you used it. Be ready to explain what the artifact would help someone decide and what evidence you would still need.' },
  ],
  sourceGroups: [
    { id: 'occupations-and-pay', title: 'U.S. occupation definitions, wages, and offer terms', links: [sources.engineer, sources.chemist, sources.engineeringPay, sources.chemistryPay, sources.aid, sources.flsa, sources.exemption] },
    { id: 'education-and-licensure', title: 'Engineering licensure and chemistry degree programs', links: [sources.abet, sources.acs, sources.licensure, sources.fe, sources.pe, sources.california, sources.californiaBoard, sources.texas] },
    { id: 'plant-and-pilot', title: 'Scale-up, workplace hazards, and process safety', links: [sources.pilot, sources.psm, sources.rmp, sources.rmpPha, sources.sds, sources.simulator] },
    { id: 'laboratory-and-quality', title: 'Analytical documentation and pharmaceutical quality', links: [sources.glp, sources.qualityUnit, sources.release, sources.laboratoryRecords, sources.investigation, sources.analytical, sources.cdsIntegration, sources.cdsQuantification] },
    { id: 'portfolio', title: 'Public guidance and reference data for the portfolio', requiresPlugin: 'thirtyDay', links: [sources.manufacturing, sources.nist] },
  ],
};
