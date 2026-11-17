/**
 * Scholarship records drawn ONLY from the programs' official pages (fetched 2026-11-16 and 2026-11-17).
 * Wording is paraphrased. They are imported as draft / pending_review and must be checked
 * by a human against the official page before anything is marked Reviewed or Published.
 * Where a page did not state a value, the field says so (amount 0, GPA 0 = none stated).
 */
export interface VerifiedScholarship {
  id: string;
  slug: string;
  title: string;
  universitySlug: string;
  universityName: string;
  state: string;
  stateCode: string;
  category: string;
  secondaryCategories: string[];
  degreeLevels: string[];
  amountDisplay: string;
  amountNumeric: number;
  coverageSummary: string;
  coversTuition: boolean;
  coversHousing: boolean;
  coversBooks: boolean;
  includesStipend: boolean;
  renewable: string;
  deadlineISO: string;
  deadlineLabel: string;
  overview: string;
  eligibility: string[];
  requiredDocuments: string[];
  applicationSteps: string[];
  officialUrl: string;
  reviewNotes: string;
}

// Far-future placeholder required by the schema when no current deadline is stated.
const NO_DATE = '2099-12-31';

export const VERIFIED_SCHOLARSHIPS: VerifiedScholarship[] = [
  {
    id: 'vs-001',
    slug: 'morehead-cain-scholarship',
    title: 'Morehead-Cain Scholarship',
    universitySlug: 'university-of-north-carolina-chapel-hill',
    universityName: 'University of North Carolina at Chapel Hill',
    state: 'North Carolina',
    stateCode: 'NC',
    category: 'fully-funded',
    secondaryCategories: ['merit-based'],
    degreeLevels: ['High School Senior', 'Undergraduate'],
    amountDisplay: 'Fully funded for four years (no dollar value stated)',
    amountNumeric: 0,
    coverageSummary:
      'Covers tuition, books, room and board and/or a semester stipend, plus four summers of enrichment, optional gap year, study abroad and discovery funds.',
    coversTuition: true,
    coversHousing: true,
    coversBooks: true,
    includesStipend: true,
    renewable: 'Four years (as described on the official page)',
    deadlineISO: NO_DATE,
    deadlineLabel: 'See official page',
    overview:
      'The official site presents this as a merit scholarship at UNC-Chapel Hill for leaders of high character and intellect. Its deadlines page for the Class of 2031 cycle lists an application opening of August 15, 2026 and a materials-due date of October 1 (the year is not explicit on the page). Confirm the current cycle before publishing.',
    eligibility: [
      'North Carolina students can enter through a school nomination, an affiliate program nomination, or self-nomination.',
      'Students elsewhere in the U.S., in Canada, the UK or abroad must attend a nominating school or affiliate program and be nominated by it.',
      'Students outside North Carolina without a nominating school may be considered through the Admissions Referral Program, which requires applying to UNC-Chapel Hill by its non-binding Early Action deadline.',
      'Current UNC sophomores may be invited through a separate sophomore selection process.',
    ],
    requiredDocuments: [
      'Online application created in the Morehead-Cain portal',
      'School information form (senior-year courses) completed by your counselor',
      'Recommendation uploaded by your recommender',
      'Essay responses',
    ],
    applicationSteps: [
      'Create your application in the portal.',
      'Add your school counselor and your recommenders.',
      'Complete the essays and other sections, then review and submit before the deadline.',
      'Check the official Application Checklist and Deadlines pages for the current cycle.',
    ],
    officialUrl: 'https://www.moreheadcain.org',
    reviewNotes:
      'Imported from moreheadcain.org pages (home, about, eligibility, checklist, deadlines) on 2026-11-16. No dollar value or GPA stated. Deadline year was inferred by the page; verify before publishing.',
  },
  {
    id: 'vs-002',
    slug: 'carolina-covenant',
    title: 'Carolina Covenant',
    universitySlug: 'university-of-north-carolina-chapel-hill',
    universityName: 'University of North Carolina at Chapel Hill',
    state: 'North Carolina',
    stateCode: 'NC',
    category: 'need-based',
    secondaryCategories: [],
    degreeLevels: ['Undergraduate'],
    amountDisplay: 'Meets full financial need (no loans)',
    amountNumeric: 0,
    coverageSummary:
      'Meets full demonstrated need up to the standard cost of attendance through grants, scholarships and Work-Study, with no loans, plus academic, career and well-being support.',
    coversTuition: true,
    coversHousing: true,
    coversBooks: true,
    includesStipend: false,
    renewable: 'For a limited number of fall and spring semesters, depending on entry point and standard time to graduate',
    deadlineISO: NO_DATE,
    deadlineLabel: 'See official page',
    overview:
      'A UNC-Chapel Hill program for eligible low-income students that pairs a loan-free aid package with support services. The official page gives no specific date; students must meet the university financial aid deadline.',
    eligibility: [
      'Incoming first-year or transfer student admitted full-time and pursuing a first undergraduate degree.',
      'North Carolina residents (dependent or independent) and dependent out-of-state students are considered; independent out-of-state students are not.',
      'Total income must not exceed 200% of the federal poverty guidelines (the page lists limits by family size, e.g. $64,300 for a family of four).',
      'Demonstrated financial need, limited assets and eligibility for federal student aid.',
      'Graduate and professional students are not eligible.',
    ],
    requiredDocuments: [
      'FAFSA, completed on time each year',
      'CSS Profile (needed for the first year; see the official page for exceptions)',
      'Any items on your ConnectCarolina to-do list',
    ],
    applicationSteps: [
      'There is no separate Covenant application; eligibility is assessed through the general financial aid process.',
      'Complete the FAFSA and CSS Profile by the university aid deadline.',
      'Selected students are notified by email.',
    ],
    officialUrl: 'https://studentaid.unc.edu/carolina-covenant/',
    reviewNotes:
      'Imported from studentaid.unc.edu/carolina-covenant on 2026-11-16 (carolinacovenant.unc.edu redirects there). Income limits change yearly; verify the figures before publishing.',
  },
  {
    id: 'vs-003',
    slug: 'jefferson-scholars-program-undergraduate',
    title: 'Jefferson Scholars Program (Undergraduate)',
    universitySlug: 'university-of-virginia',
    universityName: 'University of Virginia',
    state: 'Virginia',
    stateCode: 'VA',
    category: 'fully-funded',
    secondaryCategories: ['merit-based'],
    degreeLevels: ['High School Senior', 'Undergraduate'],
    amountDisplay: 'Over $42,000/yr (Virginians); over $83,000/yr (non-Virginians)',
    amountNumeric: 42000,
    coverageSummary:
      'Intended to cover the full cost of attendance at UVA for four years, plus enrichment such as international travel, career networking, leadership programs and an exploratory fund.',
    coversTuition: true,
    coversHousing: true,
    coversBooks: true,
    includesStipend: false,
    renewable: 'Four years',
    deadlineISO: NO_DATE,
    deadlineLabel: 'See official page',
    overview:
      'Merit award at the University of Virginia from the Jefferson Scholars Foundation. Selection has three stages: nomination, regional review and final selection. The official page does not state a current deadline.',
    eligibility: [
      'The page lists no formal criteria; it says recipients show an exceptional record and potential for impact inside and outside the classroom.',
      'Students are nominated through secondary schools the Foundation invites to nominate.',
    ],
    requiredDocuments: ['The official page does not list required materials; check with your school or the Foundation.'],
    applicationSteps: [
      'There is no direct application on the page; nomination comes through an invited school.',
      'Nominated students go through regional review and then final selection.',
    ],
    officialUrl: 'https://www.jeffersonscholars.org/scholarships',
    reviewNotes:
      'Imported from jeffersonscholars.org/scholarships on 2026-11-16. Page mentions two undergraduate programs; only the combined description was readable. Verify details and the other program.',
  },
  {
    id: 'vs-004',
    slug: 'the-gates-scholarship',
    title: 'The Gates Scholarship',
    universitySlug: 'national-program',
    universityName: 'The Gates Scholarship (Gates Foundation)',
    state: 'Nationwide',
    stateCode: 'US',
    category: 'need-based',
    secondaryCategories: ['first-generation', 'minority-diversity'],
    degreeLevels: ['High School Senior'],
    amountDisplay: 'Full cost of attendance not covered by other aid and the Student Aid Index',
    amountNumeric: 0,
    coverageSummary:
      'A last-dollar award for the remaining cost of attendance (tuition, fees, books, housing and food, and possibly personal costs) after other aid and the family contribution.',
    coversTuition: true,
    coversHousing: true,
    coversBooks: true,
    includesStipend: false,
    renewable: 'Not stated on the pages read',
    deadlineISO: '2026-09-15',
    deadlineLabel: 'September 15, 2026 (application deadline listed for this cycle)',
    overview:
      'A highly selective scholarship from the Gates Foundation for outstanding high school seniors from low-income households. The official timeline lists a July 15 opening, a September 15 deadline, semifinalist and finalist stages through March 2027, selection in April 2027 and awards in July–September 2027.',
    eligibility: [
      'High school senior',
      'Eligible for a federal Pell Grant',
      'U.S. citizen or permanent resident',
      'In good academic standing with a cumulative weighted GPA of at least 3.3 on a 4.0 scale (or equivalent)',
      'Plans to enroll full time in a four-year degree program at an accredited, not-for-profit U.S. college or university',
    ],
    requiredDocuments: ['The pages read do not list a document checklist; see the official application.'],
    applicationSteps: [
      'Check the basic eligibility requirements on the official page.',
      'Sign in and start a profile on the official scholarship site during the open window.',
      'Semifinalists are chosen in the winter, followed by finalist interviews in spring.',
    ],
    officialUrl: 'https://www.thegatesscholarship.org/scholarship/',
    reviewNotes:
      'Read 2026-11-17 from thegatesscholarship.org/scholarship. The page shows "Status: Open" next to a Sept 15, 2026 deadline; confirm whether the window is open before publishing.',
  },
  {
    id: 'vs-005',
    slug: 'questbridge-national-college-match',
    title: 'QuestBridge National College Match',
    universitySlug: 'national-program',
    universityName: 'QuestBridge (55 partner colleges)',
    state: 'Nationwide',
    stateCode: 'US',
    category: 'need-based',
    secondaryCategories: ['fully-funded', 'first-generation'],
    degreeLevels: ['High School Senior'],
    amountDisplay: 'Full four-year scholarships valued at over $360,000',
    amountNumeric: 360000,
    coverageSummary:
      'Match Scholarships cover tuition, housing, food and other expenses, with no parental contribution and no student loans, and are provided directly by partner colleges.',
    coversTuition: true,
    coversHousing: true,
    coversBooks: false,
    includesStipend: false,
    renewable: 'Four years',
    deadlineISO: '2026-10-01',
    deadlineLabel: 'October 1, 11:59 p.m. Pacific (most recent deadline listed; check next cycle)',
    overview:
      'A college admission and scholarship application process connecting high-achieving high school seniors from low-income backgrounds with full four-year scholarships at 55 partner colleges. The official page says 2,550 finalists were matched in 2025.',
    eligibility: [
      'High school senior earning primarily A’s in the most challenging courses offered, with strong writing ability and intellectual curiosity',
      'Typically from a household earning less than $65,000 a year (for a household of four) with minimal assets',
      'Shows resilience, integrity and motivation to succeed',
    ],
    requiredDocuments: ['The page read does not list documents; see the official application.'],
    applicationSteps: [
      'Review eligibility on the official QuestBridge page.',
      'Complete the National College Match application and rank partner colleges.',
      'Matched finalists receive a full four-year scholarship from their matched college.',
    ],
    officialUrl: 'https://www.questbridge.org/apply-to-college/programs/national-college-match',
    reviewNotes:
      'Read 2026-11-17 from the QuestBridge National College Match page. It states the deadline as "Thursday, October 1, 11:59 p.m. Pacific" without the year; October 1, 2026 is a Thursday. Verify the next cycle dates.',
  },
  {
    id: 'vs-006',
    slug: 'coca-cola-scholars-program',
    title: 'Coca-Cola Scholars Program Scholarship',
    universitySlug: 'national-program',
    universityName: 'Coca-Cola Scholars Foundation',
    state: 'Nationwide',
    stateCode: 'US',
    category: 'merit-based',
    secondaryCategories: [],
    degreeLevels: ['High School Senior'],
    amountDisplay: '$20,000 (150 scholars selected each year)',
    amountNumeric: 20000,
    coverageSummary: 'A $20,000 achievement-based scholarship for students in their final year of high school.',
    coversTuition: false,
    coversHousing: false,
    coversBooks: false,
    includesStipend: false,
    renewable: 'Not stated on the page read',
    deadlineISO: '2026-09-30',
    deadlineLabel: 'September 30, 2026, 5 p.m. Eastern (2027 cycle closed; opens each August 3)',
    overview:
      'Recognizes students for their capacity to lead and serve and their commitment to making an impact on their schools and communities. The 2027 application is closed; the Phase 1 application runs August 3 to September 30 each year, needs no essays, transcript or recommendations, and about 1% of applicants become semifinalists.',
    eligibility: [
      'Currently enrolled high school or home-schooled student, graduating during the 2026–2027 school year, attending school in a U.S. state, D.C., Puerto Rico or select DoD schools',
      'U.S. citizen, national, permanent resident, refugee, asylee, Cuban-Haitian entrant or humanitarian parolee (federal aid guidelines)',
      'Planning to pursue a degree at an accredited U.S. post-secondary institution',
      'Able to verify a minimum overall B/3.0 GPA',
      'Not a child or grandchild of Coca-Cola company or bottler employees, and not a high school graduate or international student',
    ],
    requiredDocuments: ['Phase 1: online application only. Semifinalists later submit essays, a transcript and a recommendation.'],
    applicationSteps: [
      'Phase 1: submit the online application between August 3 and September 30.',
      'Phase 2: semifinalists complete an application due in November.',
      'Later phases narrow to regional finalists and 150 scholars.',
    ],
    officialUrl: 'https://www.coca-colascholarsfoundation.org/apply/',
    reviewNotes: 'Read 2026-11-17 from the foundation’s /apply and FAQ pages. Dates are for the 2027 cycle, which the site says is closed.',
  },
  {
    id: 'vs-007',
    slug: 'robertson-scholars-leadership-program',
    title: 'Robertson Scholars Leadership Program',
    universitySlug: 'national-program',
    universityName: 'Robertson Scholars (Duke University and UNC–Chapel Hill)',
    state: 'North Carolina',
    stateCode: 'NC',
    category: 'merit-based',
    secondaryCategories: ['fully-funded'],
    degreeLevels: ['High School Senior'],
    amountDisplay: 'Not stated on the pages read',
    amountNumeric: 0,
    coverageSummary: 'The pages read describe a leadership community across Duke and UNC but state no award amount or coverage.',
    coversTuition: false,
    coversHousing: false,
    coversBooks: false,
    includesStipend: false,
    renewable: 'Not stated on the pages read',
    deadlineISO: '2026-11-15',
    deadlineLabel: 'November 15 each year (high school application closed; reopens August 2027)',
    overview:
      'A community of student leaders within Duke University and the University of North Carolina at Chapel Hill. The high school application opens annually on August 15 and is due November 15; the official page says it has closed and will reopen in August 2027. International students may apply with the same application.',
    eligibility: [
      'Students who have not yet matriculated at any university apply with the High School Application',
      'One application for all high school students regardless of nationality; international applicants are responsible for obtaining a U.S. student visa',
    ],
    requiredDocuments: ['See the official application and FAQ.'],
    applicationSteps: ['Apply with the High School Application when it opens in August; it is due November 15.'],
    officialUrl: 'https://robertsonscholars.org/high-school-students/',
    reviewNotes: 'Read 2026-11-17 from robertsonscholars.org. No award value or coverage was readable; add those from the official FAQ before publishing.',
  },
  {
    id: 'vs-008',
    slug: 'barry-goldwater-scholarship',
    title: 'Barry Goldwater Scholarship',
    universitySlug: 'national-program',
    universityName: 'Barry Goldwater Scholarship & Excellence in Education Foundation',
    state: 'Nationwide',
    stateCode: 'US',
    category: 'stem',
    secondaryCategories: ['merit-based'],
    degreeLevels: ['Undergraduate'],
    amountDisplay: 'Up to $7,500 per academic year',
    amountNumeric: 7500,
    coverageSummary:
      'Up to $7,500 per academic year toward tuition, mandatory fees, books, and housing and meals, after other support is considered. Sophomores may receive up to two years of support; juniors up to one year.',
    coversTuition: true,
    coversHousing: true,
    coversBooks: true,
    includesStipend: false,
    renewable: 'Up to two years for sophomores; up to one year for juniors',
    deadlineISO: '2027-01-29',
    deadlineLabel: 'Last Friday in January, 5:00 p.m. Central (campus deadlines come earlier)',
    overview:
      'Supports college sophomores and juniors planning research careers in the natural sciences, mathematics or engineering. Every applicant is nominated through their campus representative. The application opens the first Tuesday in September and scholars are announced the last Friday in March.',
    eligibility: [
      'Currently or previously matriculated sophomore or junior at an accredited 2- or 4-year U.S. institution, full time during the award period',
      'Intends a research career in a natural science, mathematics or engineering (medicine, veterinary medicine and engineering qualify only if research is central)',
      'College GPA of at least 3.00 on a 4.00 scale',
      'U.S. citizen or national, or a U.S. permanent resident',
    ],
    requiredDocuments: ['Research essay and nomination materials through your campus representative; permanent residents include a copy of their Green Card.'],
    applicationSteps: [
      'Check eligibility and find your Campus Representative.',
      'Contact your campus representative early in the fall.',
      'Complete the application and be nominated by your campus.',
    ],
    officialUrl: 'https://goldwaterscholarship.gov/students/overview/',
    reviewNotes:
      'Read 2026-11-17 from goldwaterscholarship.gov/students/overview. The site gives the deadline as a rule ("last Friday in January"); 2027-01-29 is that Friday, computed from the rule. Confirm the exact date on the key-dates page.',
  },
  {
    id: 'vs-009',
    slug: 'post-9-11-gi-bill',
    title: 'Post-9/11 GI Bill (Chapter 33)',
    universitySlug: 'national-program',
    universityName: 'U.S. Department of Veterans Affairs',
    state: 'Nationwide',
    stateCode: 'US',
    category: 'military-veterans',
    secondaryCategories: [],
    degreeLevels: ['Undergraduate', 'Graduate'],
    amountDisplay: 'Up to full in-state public tuition and fees, plus housing and book allowances',
    amountNumeric: 0,
    coverageSummary:
      'Tuition and fees (full in-state public rates at the maximum benefit; capped for private and foreign schools), a monthly housing allowance if enrolled more than half time, a books and supplies stipend, tutorial assistance, test reimbursement and work-study.',
    coversTuition: true,
    coversHousing: true,
    coversBooks: true,
    includesStipend: true,
    renewable: 'Up to 36 months of benefits in the standard case (up to 48 in some cases)',
    deadlineISO: '2099-12-31',
    deadlineLabel: 'No application deadline stated; apply through VA',
    overview:
      'An education benefit for people who served on active duty after September 10, 2001, and for some dependents using transferred benefits. Benefits for service ending on or after January 1, 2013 do not expire; earlier service expires 15 years after separation.',
    eligibility: [
      'Served at least 90 days on active duty on or after September 11, 2001, or',
      'Received a Purple Heart on or after that date and were honorably discharged, or',
      'Served at least 30 continuous days and were honorably discharged with a service-connected disability, or',
      'Are a dependent child using benefits transferred by a qualifying Veteran or service member',
    ],
    requiredDocuments: ['See the VA application for the documents it asks for.'],
    applicationSteps: ['Check eligibility on the VA page, then apply for education benefits with VA.'],
    officialUrl: 'https://www.va.gov/education/about-gi-bill-benefits/post-9-11/',
    reviewNotes: 'Read 2026-11-17 from va.gov. Federal benefit, not a university scholarship; rates are updated yearly and are on the linked VA rate page.',
  },
  {
    id: 'vs-010',
    slug: 'horatio-alger-national-scholarship',
    title: 'Horatio Alger National Scholarship',
    universitySlug: 'national-program',
    universityName: 'Horatio Alger Association of Distinguished Americans',
    state: 'Nationwide',
    stateCode: 'US',
    category: 'need-based',
    secondaryCategories: ['first-generation'],
    degreeLevels: ['High School Senior', 'Undergraduate'],
    amountDisplay: '$25,000 (105 scholarships)',
    amountNumeric: 25000,
    coverageSummary: '105 National Scholarships of $25,000 each for high school juniors who show critical financial need and perseverance.',
    coversTuition: false,
    coversHousing: false,
    coversBooks: false,
    includesStipend: false,
    renewable: 'Not stated on the page read',
    deadlineISO: '2099-12-31',
    deadlineLabel: 'Juniors: Dec 1 – Mar 1; seniors: Dec 1 – Feb 15 (year not stated)',
    overview:
      'Scholarships for students who also show critical financial need, integrity and perseverance in overcoming adversity. One application considers you for all scholarships you are eligible for, except some specialized awards. The association lists over 70 scholarship programs.',
    eligibility: [
      'Enrolled full time as a high school junior in the United States',
      'Strong commitment to pursue and complete a bachelor’s degree at an accredited non-profit U.S. institution right after high school (may start at a two-year school and transfer)',
      'Financial need: adjusted gross family income of $100,000 or less',
      'Involved in co-curricular and community service activities',
      'Integrity and perseverance in overcoming adversity',
      'Minimum GPA of 2.5 and U.S. citizenship',
    ],
    requiredDocuments: ['High school transcript (including fall grades)', 'Income verification, usually a parent tax form', 'Counselor certification form and a support form from an unrelated adult over 21'],
    applicationSteps: [
      'Determine eligibility and start the application during the application period.',
      'Write the short essay responses (your Horatio Alger story and American Dream experience).',
      'Enter your counselor and support-form provider so they receive their forms.',
      'Submit the transcript and income verification.',
    ],
    officialUrl: 'https://horatioalger.org/scholarships-and-services/undergraduate-scholarships/',
    reviewNotes: 'Read 2026-11-17 from horatioalger.org. Application windows are stated without a year; confirm for the current cycle.',
  },
];
