/**
 * Scholarship records drawn ONLY from the programs' official pages (fetched 2026-11-16).
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
];
