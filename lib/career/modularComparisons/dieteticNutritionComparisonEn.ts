import type { ModularComparisonSpec } from "../modularComparison";

const technician = 'Dietetic technician';
const dietitian = 'Dietitian or nutritionist';
const wages = {
  period: 'May 2025',
  technician: { soc: '29-2051', annual: ['$29,720', '$33,880', '$37,640', '$45,750', '$54,020'] },
  dietitian: { soc: '29-1031', annual: ['$49,090', '$63,080', '$76,400', '$89,340', '$103,720'] },
};

const sources = {
  technician: { label: 'O*NET Dietetic Technicians', href: 'https://www.onetonline.org/link/details/29-2051.00', note: 'Tasks, reported titles, work context and occupational interests.' },
  dietitian: { label: 'O*NET Dietitians and Nutritionists', href: 'https://www.onetonline.org/link/details/29-1031.00', note: 'Clinical, food service and counseling tasks for the full occupation.' },
  technicianWages: { label: 'BLS national wages for dietetic technicians', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=290000&measure=13&occupation=292051&year=2025', note: 'May 2025 OEWS, national percentiles, SOC 29-2051.' },
  dietitianWages: { label: 'BLS national wages for dietitians and nutritionists', href: 'https://data.bls.gov/oesprofile/?areas=INDUSTRY,STATE,MSA&major_group=290000&measure=13&occupation=291031&year=2025', note: 'May 2025 OEWS, national percentiles, SOC 29-1031.' },
  clinic: { label: 'Cleveland Clinic dietetic technician career guide', href: 'https://my.clevelandclinic.org/departments/health-sciences-education/careers/career-options/dietetic-technician', note: 'Employer example of menu, recipe and clinical support tasks.' },
  vaTechnician: { label: 'VA Clinical Dietetic Technician standard', href: 'https://www.va.gov/OHRM/QualificationStandards/HT38/0640-ClinicalDieteticTechnician.pdf', note: 'GS-0640 duties, entry and grade criteria, May 2024.' },
  vaCareers: { label: 'VA Nutrition and Food Services careers', href: 'https://www.nutrition.va.gov/nfsEmployment.asp', note: 'Clinical and administrative dietitian, technician and food-service job series.' },
  technicianExam: { label: 'CDR eligibility for DTR or NDTR', href: 'https://www.cdrnet.org/NDTReligibility', note: 'Associate-degree and bachelor’s-degree paths to the technician exam.' },
  dietitianExam: { label: 'CDR eligibility for RD or RDN', href: 'https://www.cdrnet.org/rdneligibility', note: 'Graduate degree, accredited coursework and supervised practice.' },
  graduateRule: { label: 'CDR January 2024 graduate-degree change', href: 'https://www.cdrnet.org/graduatedegree', note: 'First-time exam eligibility and the treatment of earlier eligibility.' },
  texas: { label: 'Texas TDLR dietetics practice and protected titles', href: 'https://www.tdlr.texas.gov/diet/telehealth.htm', note: 'See Services You Can Provide for LD title protection and practice.' },
  floridaDefinitions: { label: 'Florida definitions of dietetic technician and state license holder', href: 'https://www.flsenate.gov/Laws/Statutes/2026/468.503' },
  floridaLicense: { label: 'Florida dietitian and nutritionist licensure criteria', href: 'https://www.flsenate.gov/Laws/Statutes/2026/468.509' },
  florida: { label: 'Florida dietetics and nutrition license requirement', href: 'https://www.flsenate.gov/Laws/Statutes/2026/468.504', note: 'Florida Statutes §468.504, licensed practice.' },
  floridaExceptions: { label: 'Florida dietetics exemptions and title exceptions', href: 'https://www.flsenate.gov/Laws/Statutes/2026/468.505', note: 'Florida Statutes §468.505, including the employed technician exception.' },
  hospitalRule: { label: 'Federal hospital food and dietetic services rule', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title42-vol5/xhtml/CFR-2025-title42-vol5-sec482-28.html', note: '42 CFR 482.28(b)(2), patient diet orders.' },
  cmsManual: { label: 'CMS hospital survey guidance', href: 'https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/som107ap_a_hospitals.pdf', note: 'Appendix A, A-0630, assessment and recommendation versus diet-order privileges.' },
  mnt: { label: 'CMS Medicare medical nutrition therapy coverage', href: 'https://www.cms.gov/medicare-coverage-database/view/ncd.aspx?NCDId=252&bc=AAAAQAAAAAAA', note: 'NCD 180.1, covered conditions and benefit scope.' },
  mntReferral: { label: 'Federal Medicare MNT referral and provider requirements', href: 'https://www.govinfo.gov/content/pkg/CFR-2025-title42-vol2/xhtml/CFR-2025-title42-vol2-sec410-132.html', note: '42 CFR 410.132(a), physician referral and qualified provider.' },
  aspen: { label: 'ASPEN adult nutrition care pathway', href: 'https://nutritioncare.org/wp-content/uploads/2024/12/Adult-Nutrition-Pathway-9.14.22.pdf', note: 'Use page 1 for screening and the route to assessment.' },
  ncpQuest: { label: 'Academy and VA nutrition documentation audit manual', href: 'https://www.ncpro.org/vault/2570/web/NCP%20Quest/Nutrition%20Care%20Process%20Quality%20Evaluation%20and%20Standardization%20Tool%20%28NCP-QUEST%29%20Manual.pdf', note: 'Use the initial assessment and nutrition diagnosis rows for the evidence check.' },
  adime: { label: 'Academy Nutrition Care Process FAQ', href: 'https://www.andeal.org/files/docs/ncp_faq.pdf', note: 'Questions 3 and 17 cover care process steps and ADIME charting.' },
  overtime: { label: 'Federal overtime statute', href: 'https://uscode.house.gov/us/usc/119-120/t29/s207/', note: '29 U.S.C. 207(a), overtime floor for covered nonexempt employees.' },
  aid: { label: 'Federal Student Aid offer comparison', href: 'https://studentaid.gov/articles/evaluating-financial-aid-offers/', note: 'Compare net attendance cost and distinguish aid from borrowing.' },
  opm: { label: 'OPM 2026 General Schedule and locality tables', href: 'https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2026/general-schedule/', note: 'Grade, step and location for federal offers.' },
  foodBuyingGuide: { label: 'USDA Food Buying Guide', href: 'https://foodbuyingguide.fns.usda.gov/Home/About', note: 'Institutional meal-service yields and recipe analysis.' },
  foodData: { label: 'USDA FoodData Central data guide', href: 'https://fdc.nal.usda.gov/faq/', note: 'Food composition data sources and uses.' },
  recipeWorkbook: { label: 'USDA Recipe Analysis Workbook instructions', href: 'https://foodbuyingguide.fns.usda.gov/Appendix/ResourceAppendixA', note: 'Public recipe yield, portion and ingredient field examples.' },
  childNutritionDatabase: { label: 'USDA Child Nutrition Database', href: 'https://fdc.nal.usda.gov/cndb/', note: 'Source data and layout for child nutrition software.' },
  childNutritionFields: { label: 'USDA Child Nutrition Database data dictionary', href: 'https://fdc.nal.usda.gov/docs/CNDB_Documentation_June_2026.pdf', note: 'June 2026, pp. 5 and 9 for the FDES and NUTVAL keys.' },
};

const packet = {
  id: 'L17',
  breakfast: '25%',
  lunch: '50%',
  dinner: 'blank',
  breakfastSource: 'signed meal tally',
  lunchSource: 'unsigned tally',
  screen: 'review needed',
  reviewer: 'supervising RDN',
  draftPes: 'Inadequate intake related to poor appetite, as evidenced by two meal entries.',
};

const classroomRow = { kg: 60, cm: 160, years: 40, offset: -161 };
const restingEstimate = 10 * classroomRow.kg + 6.25 * classroomRow.cm - 5 * classroomRow.years + classroomRow.offset;

export const dieteticNutritionComparisonEnSpec: ModularComparisonSpec = {
  pairId: 'dietetic-technicians-vs-dietitians-and-nutritionists',
  locale: 'en',
  title: 'Dietetic Technicians vs. Dietitians and Nutritionists: Work, Pay, and Credentials',
  shortTitle: 'Dietetic Technicians vs. Dietitians and Nutritionists',
  description: 'Compare U.S. dietetic technician and dietitian work, NDTR and RDN credentials, May 2025 BLS wages, and who can order hospital diets. Try a five-minute paper handoff.',
  regionLabel: 'United States',
  authorName: 'FermatMind Editorial',
  datePublished: '2026-11-27',
  dateModified: '2026-11-27',
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: 'A resident sends back most of lunch. The dietetic technician records what came back and flags a missing dinner entry. The clinical dietitian looks at the wider record and decides what the team needs to assess next. Choose technician work if you like keeping meals, screening records, and follow-up information in order. Look toward registered dietitian work if you want to assess nutrition problems, lead counseling, or design food-service programs.',
    roleA: {
      badgeTitle: technician,
      riasecLabel: 'Holland SCR',
      aliases: 'Diet tech, nutrition technician, registered dietetic technician (DTR or NDTR)',
      keywords: 'Patient screening, calorie counts, standardized recipes, food service management, assisting clinical dietitians',
    },
    roleB: {
      badgeTitle: dietitian,
      riasecLabel: 'Holland SIE',
      aliases: 'Clinical dietitian, outpatient dietitian, registered dietitian (RD or RDN)',
      keywords: 'Medical nutrition therapy, ADIME documentation, diabetes and renal counseling, nutrition support',
    },
    interviewBoundaryTitle: 'Which record would you own?',
    interviewBoundaryQuestions: [
      'Would I spend this shift checking recipes and tray tickets, collecting screening data, or completing nutrition assessments and follow-up notes?',
      'When a meal record is missing and the care team is considering a diet change, who verifies the record and who can authorize the order?',
    ],
    riasecBoundaryNote: 'The badges show FermatMind’s top three interest dimensions. O*NET also puts Social first for both roles, with Conventional and Realistic tied in its technician scores. The codes describe interests. Skills and practice qualifications need their own checks.',
  },
  topology: {
    title: 'How a tray observation reaches the care team',
    summary: 'The technician’s record and the dietitian’s assessment answer different questions. One shows what was observed and what is missing. The other puts those observations in context and records the next care decision within the clinician’s scope.',
    ariaLabel: 'The dietetic technician sends an intake record to the dietitian and receives assigned follow-up fields.',
    leftZoneTitle: 'Technician',
    leftSteps: [
      { title: 'Screen', detail: 'Check criteria' },
      { title: 'Record', detail: 'Log meal intake' },
      { title: 'Hand off', detail: 'Flag missing data' },
    ],
    centerZoneTitle: 'Same meal record',
    upperBridge: { title: 'To dietitian', line1: 'Intake record', line2: 'Source and time' },
    lowerBridge: { title: 'To technician', line1: 'Follow-up fields', line2: 'Assigned owner' },
    rightZoneTitle: 'Dietitian',
    rightSteps: [
      { title: 'Assess', detail: 'Check the evidence' },
      { title: 'Plan', detail: 'Record next steps' },
      { title: 'Review', detail: 'Recheck outcomes' },
    ],
  },
  matrix: {
    title: 'Compare the shifts, records, and decisions',
    summary: 'Hospital kitchens, inpatient units and outpatient clinics all use nutrition information. The job changes with who needs that information and what they are authorized to decide.',
    roleAColumn: technician,
    roleBColumn: dietitian,
    expandButtonLabel: 'Show documentation tools, entry routes, and authority',
    collapseButtonLabel: 'Hide documentation tools, entry routes, and authority',
    rows: [
      { id: 'food-service', dimension: 'Institutional food service', roleA: 'Check portions and tray records against the current menu, help test standardized recipes, or support production and service. A school program may use the USDA Food Buying Guide to match purchase yield and serving units.', roleB: 'Design menus or set nutrition standards in food-service management roles. In a hospital, the dietitian and medical staff approve the therapeutic diet manual that kitchen and clinical teams use.', defaultVisible: true },
      { id: 'inpatient', dimension: 'Inpatient screening and chart work', roleA: 'Use the assigned screening criteria, collect food histories or calorie-count entries, and flag missing records for the supervising clinician. A clinical technician role can mix chart entry with interviews and meal observations.', roleB: 'Assess the clinical and dietary record and document what it supports. The Nutrition Care Process (NCP) links assessment, nutrition diagnosis, intervention, and monitoring and evaluation.', defaultVisible: true },
      { id: 'nutrition-support', dimension: 'Enteral and parenteral nutrition', roleA: 'Record assigned intake observations or missing entries and route concerns to the team. A screening record gives the reviewer an evidence trail.', roleB: 'On a nutrition support team, assess and monitor nutrition needs and contribute recommendations for enteral nutrition or parenteral nutrition, including total parenteral nutrition (TPN). Hospital privileges, state law and the roles of the prescriber, pharmacist and nursing team determine who handles each part.', defaultVisible: true },
      { id: 'outpatient', dimension: 'Outpatient, community, and private practice', roleA: 'Support group education, collect program or intake records, and assist with follow-up under assigned roles. Look at whether an opening combines food-service support with patient-facing work.', roleB: 'Outpatient RDNs can provide medical nutrition therapy (MNT), including counseling in diabetes and renal care. Independent practice adds responsibility for referral intake, state scope, documentation and payer requirements where insurance is billed.', defaultVisible: true },
      { id: 'workday', dimension: 'Schedule and workload', roleA: 'A meal-service role runs around tray rounds and production deadlines. A clinical support role adds chart work and conversations at the bedside. Check standing time, meal-period coverage and weekend rotations for the actual opening.', roleB: 'Inpatient work can mean moving between units and writing notes after interruptions. Clinics can schedule consecutive counseling visits, including evening or weekend slots. Compare chart time, visit length and follow-up coverage.', defaultVisible: true },
      { id: 'tools', dimension: 'Documentation and software', roleA: 'Use the tray ticket, recipe yield sheet and intake log. Nutrient databases and recipe software help with calculation once the product, portion, and unit are verified.', roleB: 'Use the electronic health record to tie evidence to decisions. ADIME is one documentation format and a PES statement links a nutrition problem, its etiology, and supporting signs and symptoms.', defaultVisible: false },
      { id: 'education', dimension: 'Education and timing', roleA: 'One NDTR route pairs an associate degree with an accredited technician program. The bachelor’s-plus-didactic-program route also qualifies for the CDR technician exam. Either path can lead to support work sooner if hiring and training line up.', roleB: 'For first-time RD exam eligibility, plan for a graduate degree plus accredited coursework and supervised practice. Compare integrated graduate programs with programs that separate coursework and internship, including placement travel and time away from paid work.', defaultVisible: false },
      { id: 'authority', dimension: 'Supervision and orders', roleA: 'A dietetic technician can collect and flag intake observations under assigned criteria. Assigned documentation and delegated support tasks have their own limits.', roleB: 'Clinical assessment and counseling belong to the qualified professional’s scope. State practice authority and facility privileges are separate. A dietitian can make recommendations even when a separate practitioner holds the authority to enter the hospital diet order.', defaultVisible: false },
    ],
  },
  incident: {
    title: 'Who handles an incomplete intake record?',
    summary: 'In this simulated hospital handoff, a meal ticket says a tray was delivered, while the intake field is empty. Delivery and consumption are separate observations.',
    triggerLabel: 'What reaches the team: ',
    triggerBody: 'The meal-service record confirms the tray went out. The ward record contains no observation of how much was eaten. The handoff needs an attributed entry or a clear statement that the amount remains unknown.',
    triggerCaveat: 'The staff and responsibilities in this example are assigned for the simulation.',
    rows: [
      { stage: 'Record the discrepancy', roleLabel: technician, tone: 'roleA', verifiedFacts: 'Tray dispatch time and the blank intake field.', openGaps: 'Whether anyone observed intake and can identify the source of that observation.', actionAndApproval: 'The technician preserves both records, flags the gap and routes it to the supervising RDN. The assigned observer can confirm or correct the entry.' },
      { stage: 'Review the evidence', roleLabel: 'Clinical dietitian', tone: 'roleB', verifiedFacts: 'Which observations have a source and which describe tray service only.', openGaps: 'Whether the missing information changes the assessment or leaves the conclusion unresolved.', actionAndApproval: 'The dietitian records the evidence gap and follow-up owner. If a hospital diet order is considered, the authorized ordering practitioner owns the order decision.' },
      { stage: 'Close the record', roleLabel: 'Technician and food-service team', tone: 'roleA', verifiedFacts: 'Whether the observer responded and whether the RDN acknowledged the handoff.', openGaps: 'Any unresolved field, or any new order that must be reconciled with the tray system.', actionAndApproval: 'The assigned records owner marks the follow-up as resolved or explicitly unavailable. Food service uses the verified active order when an authorized change exists.' },
    ],
    recoveryAcceptanceTitle: 'What counts as a complete handoff',
    recoveryAcceptanceCriteria: 'The served tray and the amount eaten stay in separate fields. The meal has an attributed intake value or a recorded reason it remains unknown. The RDN acknowledges the evidence gap. If the order changed, the approved order and meal-service record agree.',
    defenseLayerNote: 'The intake log, clinical note, and active diet order have distinct owners and record different decisions.',
  },
  payAndCerts: {
    title: 'U.S. pay, registration, and state practice rules',
    summary: 'Compare national employee wages, the actual terms of an offer, and the credentials or privileges the job requires.',
    salaryHeading: 'National percentiles and the terms behind an offer',
    salaryBody: `The dietitian and nutritionist median was about twice the dietetic technician median, yet the technician 90th percentile (${wages.technician.annual[4]}) exceeded the dietitian and nutritionist 10th percentile (${wages.dietitian.annual[0]}). In national BLS OEWS estimates for ${wages.period}, annual USD wages at the 10th, 25th, 50th, 75th and 90th percentiles were ${wages.technician.annual.join(' / ')} for dietetic technicians (SOC ${wages.technician.soc}) and ${wages.dietitian.annual.join(' / ')} for dietitians and nutritionists (SOC ${wages.dietitian.soc}). The second group covers a broader set of roles than clinical RDNs. OEWS measures straight-time gross wages for covered employees. It excludes self-employment, overtime premiums, shift differentials and employer-paid benefits.

For a technician opening paid by the hour, separate base rate and guaranteed hours from any weekend differential or overtime. An employed dietitian opening can be salaried or hourly. Identify base pay and any written productivity bonus or credential differential. Federal VA offers use job series, grade, step and duty location, with special rates where relevant. For covered nonexempt work, federal overtime starts after 40 hours in a workweek at 1.5 times the regular rate. A private practice bills for services and pays overhead, so compare its collections minus expenses separately from employee wages.

Put same-metro offers with comparable responsibility on an annual basis. Multiply the hourly base by guaranteed paid hours or use the written base salary. Show premiums, bonuses and benefits separately. Include commuting, credential costs and unpaid time. Check whether the technician grade gives credit for clinical screening or recipe-quality responsibilities and whether the dietitian grade recognizes a specialty caseload or supervisory duties. A tray-only opening and an intake-review opening build different experience even at the same hourly rate.`,
    certs: [
      {
        name: 'CDR technician registration (DTR or NDTR)',
        officialScope: 'The Commission on Dietetic Registration offers two U.S. routes to exam eligibility. Complete an associate degree and an ACEND-accredited technician program with at least 450 supervised hours, or complete a bachelor’s degree and the ACEND-accredited Didactic Program in Dietetics. The credential follows passing the CDR exam.',
        workplaceBoundary: 'Technician job titles vary by employer. Registration can support hiring or assignment to clinical support tasks. Employer supervision and state rules still shape the job.',
        verificationTips: 'Confirm the accredited program, the verification statement and the expected supervised practice before paying a deposit.',
        officialLinks: [sources.technicianExam, sources.vaTechnician],
      },
      {
        name: 'CDR dietitian registration (RD or RDN)',
        officialScope: 'Since January 1, 2024, first-time eligibility for the RD exam requires at least a graduate degree. Candidates also need the required ACEND-accredited coursework and supervised practice. The change excludes those already registered or already exam-eligible by December 31, 2023.',
        workplaceBoundary: 'RD and RDN are two names for the same registration. The Accreditation Council for Education in Nutrition and Dietetics (ACEND) accredits education programs within the Academy of Nutrition and Dietetics. CDR administers the registration exam.',
        verificationTips: 'Check how the specific program supplies the coursework, practice placements and verification for the exam. If you already have a graduate degree, verify which pieces transfer.',
        officialLinks: [sources.dietitianExam, sources.graduateRule],
      },
      {
        name: 'State practice authority and hospital privileges',
        officialScope: 'States set practice and title rules. Texas reserves Licensed Dietitian and LD for state licensees while allowing dietetics practice without that license. Florida generally requires a state license for compensated dietetics and nutrition practice or counseling, subject to statutory exceptions. Its Licensed Dietitian/Nutritionist (LDN) license is separate from the CDR RD/RDN credential. The exception for employed dietetic technicians covers their supervised support role.',
        workplaceBoundary: 'In covered hospitals, the responsible practitioner may order a patient diet. A qualified dietitian or nutrition professional may order it with medical-staff authorization and where state law permits. Clinical assessment, hospital diet-order privileges and outpatient payer enrollment are separate checks.',
        verificationTips: 'Check the rule where the service is delivered. For a hospital offer, confirm whether the job assesses and recommends or also receives ordering privileges. For a clinic, check payer enrollment separately.',
        officialLinks: [sources.texas, sources.floridaDefinitions, sources.floridaLicense, sources.florida, sources.floridaExceptions, sources.hospitalRule, sources.cmsManual],
      },
    ],
    interviewChecklistTitle: 'What to check in a written offer',
    interviewChecklistQuestions: [
      { label: 'Base and extras', question: 'Which weekly hours and base pay are guaranteed, and when do differential, productivity or overtime rules apply?' },
      { label: 'Grade progression', question: 'Which documented tasks, credentials or prior experience qualify for a higher grade or step?' },
      { label: 'First substantial assignment', question: 'Will I build a reviewed screening or recipe record, carry a supervised clinic caseload, or mainly enter routine data?' },
      { label: 'Annual comparison', question: 'What does guaranteed cash total at actual paid hours, and what benefits, travel and credential costs should sit in separate columns?' },
    ],
  },
  thirtyDayPlugin: {
    badge: 'Two paper portfolios',
    title: 'Build a 30-day dietetics work sample',
    summary: 'Choose one track. Use the public documents listed in the portfolio sources and synthetic inputs. Complete one checkable artifact each week.',
    tracks: [
      {
        id: 'food-service-records',
        title: 'Technician food-service records',
        badge: 'Technician track',
        tone: 'roleA',
        weeks: [
          { weekLabel: 'Week 1', deliverable: 'Map the USDA Recipe Analysis Workbook’s recipe ID, total yield, serving size and ingredient units onto a one-page recipe record. Give every field a source label.' },
          { weekLabel: 'Week 2', deliverable: 'Use the workbook’s eggplant yield example to build a purchasing data audit. Copy the original purchase and prepared units, keep the documented yield factor and flag any mock ingredient line whose form does not match.' },
          { weekLabel: 'Week 3', deliverable: 'Trace one food derived from a standardized recipe in the USDA Child Nutrition Database. Match its CN Code between FDES and NUTVAL, mark the Nutrient Code and check that Source Code 2 identifies the recipe-derived data. Cite the data dictionary.' },
          { weekLabel: 'Week 4', deliverable: 'Draft a shift handoff for two fictional recipe revisions. Include the active version, changed field, supporting record and reviewer. A second reader should find the current version in one lookup.' },
        ],
      },
      {
        id: 'clinical-documentation-review',
        title: 'Clinical documentation review',
        badge: 'Dietitian track',
        tone: 'roleB',
        weeks: [
          { weekLabel: 'Week 1', deliverable: 'Build a chart documentation dictionary from NCP-QUEST. Include an evidence field, its source and a way to represent unverified information for each ADIME heading.' },
          { weekLabel: 'Week 2', deliverable: 'Make a role-and-permission worksheet from the federal hospital rule and CMS survey guidance. Give the professional qualification, state authority and written facility privilege separate fields.' },
          { weekLabel: 'Week 3', deliverable: 'Draw an evidence trail for three entries in a wholly synthetic progress note. Mark which observation came from which record, and identify where a conclusion lacks a source.' },
          { weekLabel: 'Week 4', deliverable: 'Compile a two-version document audit. Use one NCP-QUEST check to show which evidence gap was closed, and leave any outstanding review with a named role and a completion condition.' },
        ],
      },
    ],
  },
  checklist: {
    title: 'Check the skills and work conditions separately',
    summary: 'Pick a skill to practice and a working condition to verify. A strong interest in nutrition leaves both decisions open.',
    skillsHeading: 'Skills I want to build',
    skillsOptions: [
      { id: 'meal-source', track: 'roleA', label: 'Trace an intake entry', summary: 'Tie each recorded observation to a tray, time and source.', interviewQuestions: ['What intake information does a new technician document and send for review?'] },
      { id: 'recipe-record', track: 'roleA', label: 'Audit a recipe record', summary: 'Find which ingredient or portion field changed across two recipe versions.', interviewQuestions: ['Which recipe or production record is a technician expected to leave for the next shift?'] },
      { id: 'evidence-chain', track: 'roleB', label: 'Build an evidence chain', summary: 'Explain what a chart entry supports and what still needs verification.', interviewQuestions: ['Can a new dietitian review a sample note with a mentor before taking a caseload?'] },
      { id: 'follow-up', track: 'roleB', label: 'Track follow-up across visits', summary: 'Link a counseling note to the next visit’s documentation without losing the reason for follow-up.', interviewQuestions: ['Who reviews chart quality and manages follow-up when the clinic schedule changes?'] },
    ],
    conditionsHeading: 'Conditions I can work with',
    conditionsOptions: [
      { id: 'meal-hours', track: 'roleA', label: 'Meal-period deadlines', summary: 'Consider early tray rounds, standing on production floors and weekend coverage.', interviewQuestions: ['What did the last weekend and early-shift rotation look like?'] },
      { id: 'bedside-and-kitchen', track: 'roleA', label: 'Switching between floors and food service', summary: 'Check whether a shift mixes kitchen work, bedside screening and time at a chart station.', interviewQuestions: ['Where would I spend the morning during a full meal-service shift?'] },
      { id: 'clinic-block', track: 'roleB', label: 'Back-to-back clinical visits', summary: 'Compare visit length, charting time and resources for difficult conversations.', interviewQuestions: ['How much scheduled time is reserved for documentation after visits?'] },
      { id: 'unit-coverage', track: 'roleB', label: 'Inpatient case coverage', summary: 'Look at unit coverage, interruptions and how the team shares pending assessments.', interviewQuestions: ['Who picks up an incomplete assessment when a dietitian leaves the unit or goes off shift?'] },
    ],
    defaultInterviewQuestions: ['Bring an opening and identify one record you would own, its reviewer and the schedule you would need to work.'],
    crossTrackNote: 'Technician experience can teach you how reliable meal and intake records are made. Decide separately whether you want the education and clinical accountability of the dietitian route.',
    offlinePrintHint: 'Save or print your questions to compare two openings side by side.',
  },
  desktopExercise: {
    sectionTitle: 'Try a five-minute nutrition documentation handoff',
    summary: 'Choose one track and write a short note on paper. These fictional meal-service records test completeness and ownership. Leave individual assessment, recommendations and diet orders outside the exercise.',
    publicLinksHeading: 'Public workflow and audit examples: ',
    publicLinks: [sources.aspen, sources.ncpQuest],
    factSummaryHeading: 'Offline evidence card: ',
    factSummary: `Public document pattern. ASPEN separates screening from assessment. The Academy and VA audit manual checks whether the nutrition diagnosis fields have evidence for the problem, cause, and signs. ADIME organizes Assessment, Diagnosis, Intervention, and Monitoring and Evaluation.

Teaching packet ${packet.id}. Breakfast ${packet.breakfast} eaten, ${packet.breakfastSource}. Lunch ${packet.lunch} eaten, ${packet.lunchSource}. Dinner is ${packet.dinner}. These percentages describe the recorded meals. The screening card says “${packet.screen}” and routes to the ${packet.reviewer}. The meal observer handles missing meal entries. No reason for the recorded intake is supplied.

The draft ADIME note copies the meal entries. Its draft PES sentence reads, “${packet.draftPes}” No intervention or monitoring entry is present. A separate invented classroom row has ${classroomRow.kg} kg, ${classroomRow.cm} cm, ${classroomRow.years} years and a supplied offset of ${classroomRow.offset}. For this Mifflin–St Jeor example, use 10 × kg + 6.25 × cm − 5 × years + offset. Label the result resting energy expenditure in kcal/day. The row is unrelated to the meal record and sets no intake target.`,
    taskA: {
      title: 'Technician track: write the screening handoff',
      instruction: `For ${packet.id}, give the existing meal entries with their provenance. Mark what needs confirmation, identify who verifies it, and name the recipient of your note. Leave daily intake uncalculated.`,
    },
    taskB: {
      title: 'Dietitian track: audit the ADIME draft',
      instruction: `For ${packet.id}, distinguish the recorded meal observations from the proposed diagnosis and its cause. Mark the missing ADIME fields. Calculate and label the separate classroom result. Name the next reviewer without filling in care decisions.`,
    },
    rubricTitle: 'Score the handoff',
    rubricHeading: 'Four checks per track',
    rubricPassRule: 'Pass with both shared checks and both checks for your chosen track.',
    rubricItems: [
      `Shared: Identify ${packet.id}, the ${packet.breakfast} breakfast, ${packet.lunch} lunch and missing dinner.`,
      'Shared: Leave daily intake unknown and name the supervising RDN as reviewer.',
      'Technician: Distinguish the signed and unsigned sources.',
      'Technician: Keep the screening flag and assign meal-entry follow-up to the observer.',
      'Dietitian: Flag the unsubstantiated PES and identify the blank Intervention and Monitoring fields.',
      'Dietitian: Show the separate classroom calculation and label the result as resting energy expenditure, with no intake goal.',
    ],
    sampleAnswerALabel: 'Sample screening handoff: ',
    sampleAnswerA: `${packet.id}. Breakfast ${packet.breakfast}, ${packet.breakfastSource}. Lunch ${packet.lunch}, ${packet.lunchSource}, needs confirmation. Dinner ${packet.dinner}. Daily intake remains unknown. Keep “${packet.screen}” on the screen. Ask the meal observer to confirm lunch and record dinner or mark it unavailable. Route to the ${packet.reviewer}.`,
    sampleAnswerBLabel: 'Sample documentation audit: ',
    sampleAnswerB: `${packet.id}. Assessment evidence shows breakfast ${packet.breakfast}, lunch ${packet.lunch} unsigned and dinner ${packet.dinner}. Daily intake is unknown. The entries do not establish the proposed problem or poor appetite as its cause. Intervention and Monitoring remain empty for review. ${classroomRow.kg} × 10 + ${classroomRow.cm} × 6.25 − ${classroomRow.years} × 5 − ${Math.abs(classroomRow.offset)} = ${restingEstimate.toLocaleString("en-US")} kcal/day of estimated resting energy expenditure for the classroom row. Send the draft to the ${packet.reviewer}.`,
  },
  tools: {
    title: 'Choose the next step for your decision',
    summary: 'Pick the tool that matches the question you are deciding now.',
    cards: [
      { id: 'compare', badge: 'Compare another pair', meta: 'Career comparison', tone: 'neutral', title: 'Compare two more job profiles', description: 'Check how another pair differs on duties, outlook and fit signals.', purposeHint: 'Use when a third role, such as food-service management, is on your shortlist.', ctaLabel: 'Open career comparison', href: '/en/career/compare' },
      { id: 'worksheet', badge: 'Record your next action', meta: 'Career worksheet', tone: 'roleA', title: 'Prepare for a job shadow or interview', description: 'Keep the work sample and your questions about supervision, charting, training and shifts together.', purposeHint: 'Use when you have an employer or program to investigate.', ctaLabel: 'Open the interest worksheet', href: '/en/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: 'Explore interests', meta: '60 questions', tone: 'roleB', title: 'Holland Career Interest Test', description: 'Explore the six RIASEC dimensions and your three-letter interest code.', purposeHint: 'Use when you are still deciding which work activities you want to try.', ctaLabel: 'Explore your career interests', href: '/en/tests/holland-career-interest-test-riasec' },
      { id: 'career', badge: 'Compare work conditions', meta: '94 questions', tone: 'accent', title: 'Career Planning and Work Style Test', description: 'Reflect on the activities, working style and conditions that fit how you want to work.', purposeHint: 'Use when the decision hinges on work environment or schedule.', ctaLabel: 'Explore your work style', href: '/en/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: 'Read the individual career profiles',
    profileLinks: [
      { label: 'Dietetic Technicians', href: '/en/career/jobs/dietetic-technicians' },
      { label: 'Dietitians and Nutritionists', href: '/en/career/jobs/dietitians-and-nutritionists' },
    ],
  },
  faqs: [
    {
      id: 'credentials',
      question: 'What is the difference between NDTR, DTR, RD and RDN?',
      answer: 'NDTR and DTR name the same CDR technician credential. RD and RDN name the same CDR dietitian credential. “Nutritionist” by itself does not establish which credential a person has. For job searches, use the credential and a concrete work term, such as NDTR patient screening or RDN renal clinic, then check the employer’s requirements and the state rules.',
    },
    {
      id: 'education',
      question: 'Which path can get me to paid work sooner?',
      answer: 'The associate-degree technician route can get you to eligibility earlier if the program and placement schedules line up. A bachelor’s graduate with an ACEND Didactic Program in Dietetics can pursue the technician exam without adding the associate-route practice requirement. To model the next five years, put tuition after grants, fees, placement travel, exams and any unpaid weeks against when you expect to start paid hours. Track your expected loan balance separately. Technician experience can help you learn the workflow while you plan the graduate degree and supervised practice needed for the RDN path. Check what counts with the academic program before committing.',
    },
    {
      id: 'pay',
      question: 'How can I tell whether a higher pay grade is worth it?',
      answer: 'Start with the grade’s actual duties. The VA technician standard gives weight to scope, complexity and independence in advanced assignments. A clinic’s senior dietitian title may come with more coverage or supervision duties, so value the added work using its written grade and terms. Compare the kinds of intake audits, recipe checks or chart reviews you would complete in the first year. If the only work is tray routing or template entry, price that as a narrower learning opportunity. Then compare guaranteed annual cash at the stated hours in the same city and calculate a second version with the stated premiums and bonuses. Track benefits, credential fees and time spent on unreimbursed training separately.',
    },
    {
      id: 'orders',
      question: 'Can an RDN order a therapeutic diet or manage tube or IV nutrition?',
      answer: 'A qualified dietitian can order a hospital therapeutic diet when state law allows it and the medical staff grants that privilege. An RDN without it can still assess and give recommendations to the responsible practitioner. Enteral tube feeding and parenteral IV nutrition bring in the facility’s nutrition support team and its scope for ordering, verification and monitoring. A registration or ordinary diet-order privilege alone does not establish authority for every nutrition support order.',
    },
    {
      id: 'independent-practice',
      question: 'Can a dietitian work independently in outpatient nutrition?',
      answer: 'Yes, where the professional meets state and service requirements. A solo practice may provide counseling within that scope, while insurance billing adds a separate provider and referral check. Medicare Part B MNT for eligible patients with diabetes or renal disease requires a physician referral and a qualified provider. A technician credential can support work inside a practice and does not itself confer this independent Medicare provider role.',
    },
    {
      id: 'setting-fit',
      question: 'How do I tell a food-service opening from a clinical one?',
      answer: 'Look at the records it names. Recipe yields, portions, tray checks and production sheets point toward food-service operations. Screening forms and observed intake point toward clinical support. Assessment notes, nutrition diagnoses and follow-up goals point toward dietitian responsibilities. If a job spans settings, look at how it divides scheduled hours and who reviews each work product.',
    },
    {
      id: 'automation-2026',
      question: 'What can dietetics software automate in 2026?',
      answer: 'The USDA Recipe Analysis Workbook can calculate how a standardized recipe contributes to child nutrition meal patterns. FoodData Central can supply values for nutrient analysis after a user matches food records and units. The technician still verifies which food and portion were served and whether an intake entry was ever observed. The dietitian still checks the clinical evidence behind a PES statement and takes responsibility for the assessment. A computed value or drafted note carries no hospital order authority.',
    },
    {
      id: 'en-dietetic-thirty-day-faq',
      requiresPlugin: 'thirtyDay',
      question: 'What can I show a supervisor without sharing a patient record?',
      answer: 'Bring a paper recipe-version audit or an ADIME documentation audit built from public references and invented records. A supervisor should be able to trace every field to an example, an explicit gap or an assigned reviewer. These samples show your documentation skills and leave clinical decisions to the qualified team.',
    },
  ],
  sourceGroups: [
    {
      id: 'dietetic-work-and-pay',
      title: 'U.S. occupational duties, work settings, and wages',
      links: [sources.technician, sources.dietitian, sources.technicianWages, sources.dietitianWages, sources.clinic, sources.vaTechnician, sources.vaCareers, sources.overtime, sources.aid, sources.opm],
    },
    {
      id: 'dietetic-registration-and-practice',
      title: 'National credentials, state laws, and clinical authority',
      links: [sources.technicianExam, sources.dietitianExam, sources.graduateRule, sources.texas, sources.floridaDefinitions, sources.floridaLicense, sources.florida, sources.floridaExceptions, sources.hospitalRule, sources.cmsManual, sources.mnt, sources.mntReferral],
    },
    {
      id: 'dietetic-workflows-and-data',
      title: 'Nutrition documentation, food-service tools, and care pathways',
      links: [sources.aspen, sources.ncpQuest, sources.adime, sources.foodBuyingGuide, sources.foodData],
    },
    {
      id: 'en-dietetic-thirty-day-sources',
      title: 'Public references for the 30-day dietetics portfolio',
      requiresPlugin: 'thirtyDay',
      links: [sources.recipeWorkbook, sources.childNutritionDatabase, sources.childNutritionFields],
    },
  ],
};
