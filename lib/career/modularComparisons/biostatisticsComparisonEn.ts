import type { ModularComparisonSpec } from '../modularComparison';

const roleA = 'Biostatistician';
const roleB = 'Statistician';

const wages = {
  period: 'May 2025',
  soc: '15-2041',
  national: ['$64,000', '$82,220', '$105,650', '$141,490', '$174,050'],
  pharma: '$140,680',
  research: '$130,310',
  college: '$81,830',
  localGovernment: '$84,200',
  stateGovernment: '$76,080',
};

const sources = {
  bio: { label: 'O*NET Biostatisticians', href: 'https://www.onetonline.org/link/summary/15-2041.01', note: 'U.S. tasks, reported titles and occupational interest code.' },
  stats: { label: 'O*NET Statisticians', href: 'https://www.onetonline.org/link/summary/15-2041.00', note: 'U.S. tasks, reported titles and occupational interest code.' },
  wages: { label: 'BLS May 2025 Statisticians wage profile', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=150000&measure=13&occupation=152041&year=2025', note: 'National and Industry tabs for SOC 15-2041, which includes biostatistics.' },
  e9: { label: 'FDA/ICH E9 statistical principles', href: 'https://www.fda.gov/media/71336/download', note: 'Sample size and advance specification of the statistical analysis.' },
  estimand: { label: 'FDA/ICH E9(R1) estimands, sections A.2–A.5', href: 'https://www.fda.gov/media/148473/download', note: 'Read how the question, events and analysis fit together.' },
  fdaData: { label: 'FDA study data standards resources', href: 'https://www.fda.gov/industry/fda-data-standards-advisory-board/study-data-standards-resources', note: 'FDA’s standards catalog and submission guidance.' },
  sdtm: { label: 'CDISC Study Data Tabulation Model', href: 'https://www.cdisc.org/standards/foundational/sdtm' },
  adam: { label: 'CDISC Analysis Data Model', href: 'https://www.cdisc.org/standards/foundational/adam' },
  define: { label: 'CDISC Define-XML', href: 'https://www.cdisc.org/standards/data-exchange/define-xml' },
  part11: { label: 'FDA guidance on the scope of 21 CFR Part 11', href: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/part-11-electronic-records-electronic-signatures-scope-and-application', note: 'Section III.B.2 covers electronic records and signatures.' },
  duke: { label: 'Duke Cancer Institute Biostatistics Shared Resource', href: 'https://www.dukecancerinstitute.org/research-programs/shared-resources/biostatistics', note: 'Durham, North Carolina. Team services and statistical software.' },
  cro: { label: 'IQVIA clinical study reporting and data standards', href: 'https://www.iqvia.com/-/media/iqvia/pdfs/library/insight-brief/2026/dssm-redefining-efficiency-2026.pdf', note: '2026 provider description of sponsor-facing work.' },
  harvard: { label: 'Harvard Chan SM in Biostatistics', href: 'https://hsph.harvard.edu/program/sm-biostatistics/', note: 'Graduate curriculum and study design competencies.' },
  stanford: { label: 'Stanford Statistics Data Science Curriculum', href: 'https://statistics.stanford.edu/academic-programs/graduate-programs/statistics-data-science-curriculum', note: 'Statistics master’s data science track.' },
  asa: { label: 'American Statistical Association GStat and PStat accreditation', href: 'https://www.amstat.org/your-career/accreditation', note: 'Requirements and professional scope.' },
  california: { label: 'California Research Data Specialist II exam bulletin', href: 'https://calcareers.ca.gov/CalHrPublic/Exams/ExamBulletin.aspx?ExamControlId=2361', note: 'Coursework and entry criteria for this civil-service classification.' },
  ai: { label: 'FDA and EMA Good AI Practice in Drug Development', href: 'https://www.fda.gov/about-fda/artificial-intelligence-drug-development/guiding-principles-good-ai-practice-drug-development', note: 'January 2026 principles on use, validation and oversight.' },
  census: { label: 'U.S. Census Bureau American Community Survey design and methodology', href: 'https://www.census.gov/programs-surveys/acs/methodology/design-and-methodology.html', note: 'Sampling, weighting and estimation chapters.' },
  bea: { label: 'BEA and Census Bureau seasonal adjustment methods', href: 'https://bea.gov/help/faq/1382', note: 'An example from U.S. trade statistics.' },
  experiments: { label: 'Microsoft Research on A/B test data quality', href: 'https://www.microsoft.com/en-us/research/articles/data-quality-fundamental-building-blocks-for-trustworthy-a-b-testing-analysis/', note: 'Group allocation, missing records and metric quality.' },
  doe: { label: 'NIST design of experiments handbook', href: 'https://www.itl.nist.gov/div898/handbook/pri/section1/pri11.htm' },
  spc: { label: 'NIST statistical process control charts', href: 'https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc3.htm' },
  sql: { label: 'PostgreSQL aggregate functions', href: 'https://www.postgresql.org/docs/current/tutorial-agg.html', note: 'Grouped counts and summaries.' },
  python: { label: 'SciPy independent-samples t test', href: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ttest_ind.html', note: 'Test inputs and assumptions.' },
  sasMacro: { label: 'Base SAS macro facility', href: 'https://support.sas.com/rnd/base/macro/index.html' },
  sasPower: { label: 'SAS/STAT POWER procedure', href: 'https://documentation.sas.com/api/collections/pgmsascdc/v_050/docsets/statug/content/power.pdf?locale=en', note: 'Prospective power and sample size from stated design inputs.' },
  survival: { label: 'R survival package', href: 'https://cran.r-project.org/web/packages/survival/index.html', note: 'Time-to-event methods and documentation.' },
  rPower: { label: 'R power for two independent proportions', href: 'https://stat.ethz.ch/R-manual/R-devel/library/stats/html/power.prop.test.html', note: 'Read the arguments for equal-sized groups: rates, error level, power and the quantity to solve for.' },
};

const exercise = {
  sap: 'QA-SAP v1.2',
  exportId: 'QX v2.1',
  plan: '12:00',
  export: '17:00',
  missing: 'A03 and B03',
  resetRun: 'A02',
  releaseCondition: 'Release only after the methods lead approves reset and missing-outcome rules and the export owner reconciles statuses by arm.',
};

export const biostatisticsComparisonEnSpec: ModularComparisonSpec = {
  pairId: 'biostatisticians-vs-statisticians',
  locale: 'en',
  title: 'Biostatisticians vs. Statisticians: Work, Pay, and Degrees',
  shortTitle: 'Biostatisticians vs. Statisticians',
  description: 'Compare U.S. biostatistics and statistics careers by daily work, graduate training and BLS wages. Try two short statistics work samples on paper.',
  regionLabel: 'United States',
  authorName: 'FermatMind Editorial',
  datePublished: '2026-11-27',
  dateModified: '2026-11-27',
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: 'A clinical research team asks how to interpret a study result if some participants stop their assigned treatment. A product team asks whether a new checkout improves completion when some sessions never log an outcome. Biostatistics is a specialization within statistics. Choose it if you want to work with clinical or public health teams on what a study can tell them, how to measure it, and how to document the result. General statistics gives you more kinds of questions to choose from, including who a survey represents, whether an A/B test supports a launch, and which factory settings affect quality.',
    roleA: { badgeTitle: roleA, riasecLabel: 'Holland ICS', aliases: 'Biometrician, biostatistical consultant', keywords: 'Clinical development, estimands, analysis plans, time-to-event analysis' },
    roleB: { badgeTitle: roleB, riasecLabel: 'Holland ICR', aliases: 'Mathematical statistician, statistical consultant', keywords: 'Sampling, weighting, A/B tests, experimental design, process control' },
    interviewBoundaryTitle: 'Find the first decision you would own',
    interviewBoundaryQuestions: [
      'On a study, would I help define the endpoint and draft the statistical analysis plan (SAP), review analysis datasets, or produce tables from an approved plan?',
      'For a survey, product test or factory study, who sets the sampling rules and who explains when the estimate should guide a decision?',
    ],
    riasecBoundaryNote: 'The badges show the top three dimensions in FermatMind’s interest profiles. O*NET separately lists IC for both roles. Investigative and Conventional interests can help you choose activities to try. Hiring and readiness depend on training, work evidence and role requirements.',
  },
  topology: {
    title: 'From a question to a result someone can review',
    summary: 'Both roles choose a population, an outcome and an analysis. In a clinical team, those choices connect to the protocol and analysis package. In a survey, product or quality team, the result has to stay tied to its sample, measured metric and intended use.',
    ariaLabel: 'Three clinical study steps and three general statistics steps share an outcome definition and a reviewable estimate.',
    leftZoneTitle: 'Clinical study',
    leftSteps: [
      { title: 'Specify the effect', detail: 'Define the estimand' },
      { title: 'Write the plan', detail: 'Record cutoff rules' },
      { title: 'Review the results', detail: 'Trace table inputs' },
    ],
    centerZoneTitle: 'Shared decisions',
    upperBridge: { title: 'Before analysis', line1: 'Population and outcome', line2: 'What counts as evidence' },
    lowerBridge: { title: 'At review', line1: 'Estimate and uncertainty', line2: 'Data and method limits' },
    rightZoneTitle: 'General statistics',
    rightSteps: [
      { title: 'Set the comparison', detail: 'Set units and metric' },
      { title: 'Check the design', detail: 'Verify group counts' },
      { title: 'Report the estimate', detail: 'Explain uncertainty' },
    ],
  },
  matrix: {
    title: 'What you work on and what you hand over',
    summary: 'Read across each row. Start with the question, the records you can use, and who will act on the result.',
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: 'Show tools, training, and work conditions (3 more)',
    collapseButtonLabel: 'Hide tools, training, and work conditions',
    rows: [
      { id: 'clinical-tech', dimension: 'Drug development and product experiments', roleA: 'A pharma or biotech sponsor defines the clinical question with its study team. A contract research organization (CRO) can supply statistical and programming support. Work can include trial design, a sample-size rationale, a statistical analysis plan, and review of results against the plan.', roleB: 'A product experimentation team defines the randomization unit, success metric and checks for unintended effects. Before reporting an A/B result, check allocation counts and missing outcomes, then explain whether the comparison supports the proposed decision.', defaultVisible: true },
      { id: 'research-surveys', dimension: 'Research and public statistics', roleA: 'In a medical school, hospital research group or public health team, help frame the question, document how measures were collected and report results for a paper, grant or report. An observational study may call for different assumptions from a randomized trial.', roleB: 'In survey statistics, document the sampling frame, weights and who the estimate represents. In applied econometrics, you might examine whether a movement in a time series persists after seasonal adjustment.', defaultVisible: true },
      { id: 'outcomes-variation', dimension: 'What changes the result', roleA: 'An estimand spells out the effect the study is meant to estimate. Under FDA/ICH E9(R1), an intercurrent event such as treatment discontinuation can change what an outcome means. Record the event strategy, missing-data assumptions and analysis cutoff in the study documents.', roleB: 'In manufacturing, design of experiments (DoE) changes process factors to measure their effects. Statistical process control (SPC) tracks a process over time. The deliverable can be an experiment recommendation or a chart with the limits of what it shows.', defaultVisible: true },
      { id: 'handoff', dimension: 'Deliverables and review', roleA: 'For relevant FDA submissions, CDISC SDTM organizes study tabulations, ADaM makes data analysis-ready and traceable, and Define-XML describes datasets and variables. The biostatistician can check methods and tables while statistical programmers implement assigned outputs. Approval follows the project’s documented roles.', roleB: 'Hand over a reproducible analysis, population and denominator notes, and an estimate with uncertainty. A survey lead, product owner or quality engineer makes the release or operating decision under the team’s rules.', defaultVisible: true },
      { id: 'state-examples', dimension: 'Two workplaces in practice', roleA: 'At Duke Cancer Institute in Durham, North Carolina, the Biostatistics Shared Resource describes protocol development, statistical analysis plans and analysis for scientific reporting. This is an example of academic clinical collaboration.', roleB: 'In California, the Research Data Specialist II exam bulletin includes statistical-methods coursework in its minimum qualifications. It illustrates how public-sector research hiring can use a civil-service classification.', defaultVisible: true },
      { id: 'tools', dimension: 'Software and methods', roleA: 'Base SAS and SAS Macro organize and repeat programming steps. SAS/STAT or the R survival package can support analysis. nQuery and PASS handle specified power or sample-size calculations. Duke’s team lists SAS, R, nQuery and PASS.', roleB: 'SQL can build auditable analysis counts. Python and R can run tests, fit models and plot results. Which skills matter depends on the assignment: survey weights, time series, A/B testing, or DoE and SPC. SAS and R can appear in both tracks.', defaultVisible: false },
      { id: 'training', dimension: 'Degrees and crossover', roleA: 'Compare MS or PhD programs in biostatistics, or a statistics degree with biomedical coursework and supervised study work. Check whether students write analysis plans and explain the rationale for their methods alongside researchers.', roleB: 'Compare MS programs in statistics or data science with a core in inference, design and computation. A bachelor’s can fit some entry positions. Look for a project that makes you explain the sample, uncertainty and limits in writing.', defaultVisible: false },
      { id: 'conditions', dimension: 'Work conditions and friction', roleA: 'Expect desk analysis in the roles described here, with review tied to events such as data cuts or reports. If revision logs and detailed reviews drain you, compare clinical development with an academic or public health opening before committing to a program.', roleB: 'A product role may have a short decision cycle. A public estimate may have a fixed release calendar. An industrial assignment can involve time with process engineers on site. Compare the schedule and the share of analysis you would own.', defaultVisible: false },
    ],
  },
  incident: {
    title: 'One export, two review notes',
    summary: 'In a mock software validation, a draft table treated a full export as evidence of completion by noon. The paper exercise shows how two reviewers correct the table from the same synthetic records.',
    triggerLabel: 'What changed: ',
    triggerBody: `${exercise.sap} measures completion by ${exercise.plan}. ${exercise.exportId} legitimately collects records through ${exercise.export}. The draft counted later completions as successes by noon. Each arm still contains all three assigned runs.`,
    triggerCaveat: 'The assigned reviewers and approvals in this example concern only documents and counts.',
    rows: [
      { stage: 'Define the result', roleLabel: roleA, tone: 'roleA', verifiedFacts: `Run ${exercise.resetRun} finished before noon after a reset. The plan leaves the reset rule open.`, openGaps: 'Is the comparison about completing without a reset, or completing by the deadline even after a reset?', actionAndApproval: 'Document both reset interpretations and the remaining unknown outcomes for the methods lead. The assigned programmer rebuilds the table using the approved rules.' },
      { stage: 'Check the comparison', roleLabel: roleB, tone: 'roleB', verifiedFacts: `B02 completed at 15:10 and missed noon. ${exercise.missing} have unknown outcomes. Each arm keeps all three assigned runs.`, openGaps: 'Can the export owner recover the missing completion times? The approved missing-outcome rule governs any that remain unknown.', actionAndApproval: 'The export owner reconciles each assigned run’s completion-by-noon status by arm. The analysis reviewer checks outcomes and denominators for accuracy.' },
    ],
    recoveryAcceptanceTitle: 'What supports the revised result',
    recoveryAcceptanceCriteria: `Record the plan and export versions, noon endpoint, and status for all three assigned runs per arm. ${exercise.releaseCondition}`,
    defenseLayerNote: 'A format check can pass even when the table uses the wrong time window. Have a second reader trace the outcomes to the reviewed rule and verify that all assigned runs stay in their arm.',
  },
  payAndCerts: {
    title: 'U.S. wages, offers and qualifications',
    summary: 'Start with one national wage distribution and compare the terms of the jobs you are considering.',
    salaryHeading: 'One national series, several employer groups',
    salaryBody: `In ${wages.period}, U.S. BLS Occupational Employment and Wage Statistics (OEWS) grouped biostatistics and general statistics under Statisticians (SOC ${wages.soc}). It publishes one national series for this comparison. Annual wages at the 10th, 25th, 50th, 75th and 90th percentiles were ${wages.national.join(' / ')}. These are straight-time gross wages for covered wage and salary employees. The self-employed, overtime pay, shift differentials, nonproduction bonuses and employer-paid benefits are outside the measure.

Within that occupation, pharmaceutical and medicine manufacturing (${wages.pharma}) and scientific R&D services (${wages.research}) had median wages above the national median and below its 75th percentile. Colleges, universities and professional schools (${wages.college}) and state government excluding schools and hospitals (${wages.stateGovernment}) had medians below the national 25th percentile. Local government excluding schools and hospitals (${wages.localGovernment}) was between the national 25th percentile and median. These industry figures combine specialties and levels. A written offer can include base pay, target cash bonus or equity, or a public-sector salary step and retirement contribution. Grant-funded roles may specify an appointment term and funding end date.

Match city, level and expected responsibilities first. Annualize guaranteed cash for the paid months or expected paid hours. List bonus, equity vesting, employer retirement and health contributions separately, then account for tuition, unpaid time and commute. To understand the pay grade, distinguish being responsible for a study’s analysis plan from running its tables, or owning a survey or experiment design from refreshing its reports. Use the written level criteria to see which assignments count toward the next grade.`,
    certs: [
      { name: 'Graduate degree and supervised work', officialScope: 'Biostatistics MS and PhD routes build biomedical methods and research experience. A statistics or data science MS can develop design, inference and computation. Some roles accept bachelor’s preparation.', workplaceBoundary: 'A degree supports hiring eligibility where specified. An employer and a project’s procedures govern approval and release responsibilities.', verificationTips: 'Compare course requirements, supervised projects, the first artifact you would own and whether the target role lists an MS, PhD or related experience.', officialLinks: [sources.bio, sources.stats, sources.harvard, sources.stanford] },
      { name: 'GStat and PStat', officialScope: 'The American Statistical Association offers entry-level Graduate Statistician accreditation and Professional Statistician accreditation based on education and practice evidence. Its PStat application lists at least five years of relevant work.', workplaceBoundary: 'These are professional designations. California’s Research Data Specialist II hiring route, for example, uses its own civil-service minimums.', verificationTips: 'For an employer asking about credentials, check the job’s stated qualification and which evidence of practice the employer accepts.', officialLinks: [sources.asa, sources.california] },
      { name: '21 CFR Part 11 and study records', officialScope: 'FDA’s scope guidance covers designated electronic records maintained or relied on under underlying FDA rules, qualifying electronic submissions and electronic signatures used in place of required handwritten ones.', workplaceBoundary: 'Check which records the team relies on for regulated work. A signature or release responsibility follows the project role and the records in scope.', verificationTips: 'Identify which electronic records enter the regulated workflow, who approves them and where the approved version is recorded.', officialLinks: [sources.part11, sources.fdaData] },
    ],
    interviewChecklistTitle: 'Four details to take from the written offer and level guide',
    interviewChecklistQuestions: [
      { label: 'Guaranteed pay', question: 'What base rate, paid months and guarantee appear in the offer? Which cash or equity amounts depend on a target or vesting?' },
      { label: 'Level', question: 'Does this level own a method, review an analysis plan or design, or implement an already approved approach?' },
      { label: 'First substantive assignment', question: 'Which study question, survey estimate or product analysis can a new hire own with review?' },
      { label: 'Comparable annual value', question: 'What is the same-city, same-level value after separating guaranteed cash, benefits, tuition and unpaid time?' },
    ],
  },
  thirtyDayPlugin: {
    badge: 'Two work samples',
    title: 'Build a 30-day statistics portfolio',
    summary: 'Choose one track. Use the public references in the source list and invented examples for any inputs. Each week leaves an artifact someone can review.',
    tracks: [
      { id: 'biostat-methods', title: 'Clinical research documentation', badge: 'Biostatistics track', tone: 'roleA', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Read FDA/ICH E9(R1) and make a one-page glossary and decision record for a fictional reading study. Connect its question, measured outcome and one event that changes interpretation.' },
        { weekLabel: 'Week 2', deliverable: 'Use the CDISC SDTM, ADaM and Define-XML overviews to draw a metadata map for three invented fields. Label each source, derived field and dataset description.' },
        { weekLabel: 'Week 3', deliverable: 'Use the CRAN survival reference to write a plain-language review card for fictional equipment lifetimes. Name the time origin, event, censoring assumption and the question a curve could answer.' },
        { weekLabel: 'Week 4', deliverable: 'Assemble a versioned review packet. Include the method choice, open question, input map and an independent check a reviewer could perform on paper.' },
      ] },
      { id: 'general-methods', title: 'Survey, experiment and process analysis', badge: 'Statistics track', tone: 'roleB', weeks: [
        { weekLabel: 'Week 1', deliverable: 'Read the Census ACS sampling and weighting chapter descriptions. Write a survey design card for a fictional library with a frame, response gap and target population.' },
        { weekLabel: 'Week 2', deliverable: 'Use Microsoft Research’s A/B testing data quality article to draft a test card for a fictional website. Name the randomization unit, primary metric, denominator and allocation check.' },
        { weekLabel: 'Week 3', deliverable: 'Use the NIST handbook to write a chart choice note for a fictional packaging line. Explain what a control chart would monitor and when a designed experiment would answer a different question.' },
        { weekLabel: 'Week 4', deliverable: 'Write a decision memo with one supported conclusion and one unresolved limitation for your chosen artifact. Add enough method and data definitions for a peer to review your reasoning.' },
      ] },
    ],
  },
  checklist: {
    title: 'Check the skills and the working conditions separately',
    summary: 'Pick one skill to build and one work condition to verify. Evaluate each on its own.',
    skillsHeading: 'Skills I want to build',
    skillsOptions: [
      { id: 'estimand', track: 'roleA', label: 'Write an outcome definition', summary: 'Explain what happens to interpretation when a study event changes the meaning of a measurement.', interviewQuestions: ['Which part of the analysis plan could I draft and who would review it?'] },
      { id: 'trace', track: 'roleA', label: 'Trace a table to its inputs', summary: 'Connect an analysis field to its source and explain its transformation in writing.', interviewQuestions: ['Which analysis table or derived field would I review in my first project?'] },
      { id: 'population', track: 'roleB', label: 'Explain who an estimate represents', summary: 'State who can appear in a sampling frame and who is left out.', interviewQuestions: ['Which sampling or weighting choice could I help make in my first assignment?'] },
      { id: 'experiment', track: 'roleB', label: 'Check the units before a test', summary: 'Explain the randomization unit and why an event count may differ from the number of independent units.', interviewQuestions: ['Who reviews assignment counts and metric definitions before an experiment result is used?'] },
    ],
    conditionsHeading: 'Conditions I can work with',
    conditionsOptions: [
      { id: 'cutoff', track: 'roleA', label: 'Work to cutoff and review dates', summary: 'Check how version reviews and deadlines cluster around study deliverables.', interviewQuestions: ['What changes about the workload near a cutoff, and who covers late changes?'] },
      { id: 'study-team', track: 'roleA', label: 'Work with a study team', summary: 'Compare subject-matter meetings, protected analysis time and concurrent assignments.', interviewQuestions: ['How is my time divided between studies, and who answers questions about the original measurements?'] },
      { id: 'release', track: 'roleB', label: 'Work with a release calendar', summary: 'Compare a fixed publication schedule with the cadence of product decisions.', interviewQuestions: ['How early does the team freeze its metrics before giving people the result?'] },
      { id: 'plant', track: 'roleB', label: 'Work with the people collecting data', summary: 'Check whether the job includes plant visits, field intake or work with logging engineers.', interviewQuestions: ['Where is the original evidence collected, and how much of the week is spent with that team?'] },
    ],
    defaultInterviewQuestions: ['Bring an opening and verify the deliverable, reviewer and schedule you would start with.'],
    crossTrackNote: 'Clinical, survey and product roles share statistical skills. A skill you enjoy can transfer even when the working conditions differ.',
    offlinePrintHint: 'Print the questions or add them to the career worksheet before comparing openings.',
  },
  desktopExercise: {
    sectionTitle: 'Try two kinds of statistical review in five minutes',
    summary: 'Choose a track. Review the synthetic records on paper.',
    publicLinksHeading: 'Public methods behind the exercise: ',
    publicLinks: [sources.estimand, sources.rPower],
    factSummaryHeading: 'Complete offline evidence card: ',
    factSummary: `${exercise.sap} | Endpoint: proportion completed by ${exercise.plan} | Three independent runs assigned per arm.

${exercise.releaseCondition} Keep the approved plan and reconciled arm log. Approved rules may retain Unknown after full documented reconciliation.

${exercise.exportId} | Export through ${exercise.export}. Run, arm, first completion, log note, completed by noon.

A01, A, 11:12, No reset, Yes.

${exercise.resetRun}, A, 11:48, Reset then resumed, Rule pending.

A03, A, Unknown, Incomplete log, Unknown.

B01, B, 11:22, No reset, Yes.

B02, B, 15:10, No reset, No.

B03, B, Unknown, Incomplete log, Unknown.

Validation log: Draft counted all completions as noon successes. New design: equal arms, two-sided, 5% significance, 80% power. Baseline rate and smallest worthwhile increase unknown.`,
    taskA: { title: 'Biostatistics track: review the plan', instruction: `Flag the draft error. Reconcile all runs. Explain both rules for ${exercise.resetRun}. Name the approver and release evidence.` },
    taskB: { title: 'Statistics track: review the counts', instruction: 'Flag the draft error. Reconcile all runs. State the release condition, sample-size assumptions and missing inputs.' },
    rubricTitle: 'Check your note',
    rubricHeading: 'Two shared checks and two checks for your track',
    rubricPassRule: 'Pass all four checks for your chosen track.',
    rubricItems: [
      `Shared: Distinguish the ${exercise.plan} endpoint from the ${exercise.export} export. Flag the draft’s error.`,
      `Shared: Keep three assigned per arm. Mark B02 No and ${exercise.missing} Unknown. ${exercise.releaseCondition}`,
      `Biostatistics: Score ${exercise.resetRun} No for reset-free completion and Yes for completion by noon if resumption counts.`,
      'Biostatistics: Name the methods lead, reviewed plan and export owner’s reconciliation.',
      'Statistics: Identify independent runs, two equal groups, a two-sided test, 5% significance and 80% power.',
      'Statistics: Defer a sample size until you have the baseline rate and the smallest worthwhile difference.',
    ],
    sampleAnswerALabel: 'Sample biostatistics note: ',
    sampleAnswerA: `The draft used the ${exercise.export} export as ${exercise.plan} outcomes. Keep three assigned per arm. A01 and B01 met noon. B02 missed noon at 15:10. ${exercise.missing} are Unknown. ${exercise.resetRun} finished at 11:48 after a reset: No for reset-free completion, Yes if resumption counts. Cite the approved plan and reconciled arm log. ${exercise.releaseCondition}`,
    sampleAnswerBLabel: 'Sample statistics note: ',
    sampleAnswerB: `The draft used the ${exercise.export} export as ${exercise.plan} outcomes. Keep three assigned per arm. A01 and B01 met noon. B02 missed noon at 15:10. ${exercise.missing} are Unknown. ${exercise.resetRun} awaits the reset rule. ${exercise.releaseCondition} Plan independent runs, equal arms, a two-sided test, 5% significance and 80% power. Wait for the baseline rate and smallest worthwhile increase.`,
  },
  tools: {
    title: 'Choose a next step for your decision',
    summary: 'Use the tool that matches the question you still have.',
    cards: [
      { id: 'compare', badge: 'Compare another pair', meta: 'Career comparison', tone: 'neutral', title: 'Compare a neighboring role', description: 'Put two profiles side by side by duties and work context.', purposeHint: 'Use this when a neighboring role is still on your shortlist.', ctaLabel: 'Open career comparison', href: '/en/career/compare' },
      { id: 'worksheet', badge: 'Record evidence', meta: 'Career worksheet', tone: 'roleA', title: 'Keep your work sample and questions together', description: 'Record which task you chose and the work conditions you want to verify.', purposeHint: 'Use this while preparing for an interview or program visit.', ctaLabel: 'Open the interest worksheet', href: '/en/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: 'Explore interests', meta: '60 questions', tone: 'roleB', title: 'Holland Career Interest Test', description: 'Explore six RIASEC interest dimensions and your three-letter code.', purposeHint: 'Use this when you want to decide which activities to try next.', ctaLabel: 'Explore your career interests', href: '/en/tests/holland-career-interest-test-riasec' },
      { id: 'career', badge: 'Compare work conditions', meta: '94 questions', tone: 'accent', title: 'Career Planning and Work Style Test', description: 'Reflect on work activities, work style and conditions that matter to you.', purposeHint: 'Use this when schedule, collaboration or the work environment is central to your choice.', ctaLabel: 'Explore your work style', href: '/en/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: 'Read the individual career profiles',
    profileLinks: [
      { label: 'Biostatisticians', href: '/en/career/jobs/biostatisticians' },
      { label: 'Statisticians', href: '/en/career/jobs/statisticians' },
    ],
  },
  faqs: [
    { id: 'degree-choice', question: 'Should I get a master’s in statistics or biostatistics?', answer: 'Choose biostatistics if you want graduate coursework built around study design and biomedical evidence. If you want to keep surveys, economics, product or manufacturing open, choose a statistics or data science program with strong inference and design. To keep both options, look for the ability to take biomedical methods and do supervised research alongside a broad statistics core.' },
    { id: 'phd', question: 'Do I need a PhD for clinical biostatistics?', answer: 'Use the PhD route when your target is independent methods research or a job explicitly requiring doctoral training. For a role that accepts an MS, assess whether the role expects you to draft analysis plans, support more senior study statisticians, or spend most of the time implementing outputs. Those are different starting points.' },
    { id: 'switch', question: 'Can a general statistician move into biostatistics?', answer: 'Yes, especially if you can pair inference and programming experience with biomedical study design and supervised work. A useful work sample is a short plan that states an endpoint, explains an event affecting interpretation, and shows how the reported result would trace to the data.' },
    { id: 'pay-structure', question: 'How do I compare a CRO offer with a university or public-sector offer?', answer: 'Start by checking the appointment term and your actual pay step. A contract, grant or bonus can change what arrives in year one and what continues in year two. For a promotion path, look for a written example of the next level’s work. In a study team that could be a reviewed analysis-plan section. In a survey team that could be documented ownership of weighting and uncertainty. Confirm the hours, start step and vesting dates before comparing totals.' },
    { id: 'software-choice', question: 'Should I learn SAS, R or Python first?', answer: 'Learn the tool used in the first deliverable you are targeting. For clinical programming, practice tracing a result in the environment the team uses, such as SAS or R. For a product or survey assignment, practice building auditable counts and explain a result from R or Python. The transferable skill is showing how data definitions and assumptions determine the result.' },
    { id: 'automation-2026', question: 'What can statistics software and AI automate in 2026?', answer: 'Software can repeat specified SAS programming steps, solve an R or SAS/STAT power calculation once the inputs are set, and produce standard checks and tables. A person still decides which question the calculation answers, whether the groups and denominators make sense, and how to handle exceptions. For drug development, the January 2026 FDA and EMA principles tie AI validation and oversight to the intended use and risk. A generated draft still needs review by the person responsible for the analysis.' },
    { id: 'credentials', question: 'Does GStat or PStat let me sign off on a clinical submission?', answer: 'ASA accreditation recognizes education and professional practice. For a clinical submission, the study’s written responsibilities identify who approves the analysis and releases the package. Electronic records and signatures are a separate FDA scope question.' },
  ],
  sourceGroups: [
    { id: 'occupation-pay', title: 'U.S. occupations and wages', links: [sources.bio, sources.stats, sources.wages] },
    { id: 'clinical', title: 'Clinical design, datasets and records', links: [sources.e9, sources.estimand, sources.fdaData, sources.sdtm, sources.adam, sources.define, sources.part11, sources.ai] },
    { id: 'work-education', title: 'Workplace examples, education and accreditation', links: [sources.duke, sources.cro, sources.harvard, sources.stanford, sources.asa, sources.california] },
    { id: 'general-statistics', title: 'Survey, econometrics, product and industrial statistics', links: [sources.census, sources.bea, sources.experiments, sources.doe, sources.spc, sources.sql, sources.python] },
    { id: 'statistical-software', title: 'Statistical software documentation', links: [sources.sasMacro, sources.sasPower, sources.survival, sources.rPower] },
  ],
};
