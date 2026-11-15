import { ScholarshipCategory } from '../types/scholarship';

export const SCHOLARSHIP_CATEGORIES: ScholarshipCategory[] = [
  {
    slug: 'fully-funded',
    name: 'Fully Funded (100%)',
    shortName: 'Fully Funded',
    description:
      'Comprehensive full-ride awards covering 100% of tuition, campus housing, meal plans, books, and annual living stipends at U.S. universities.',
    seoTitle: 'Fully Funded Scholarships USA 2026 | ScholarPath USA',
    seoDescription:
      'Explore 100% fully funded full-ride scholarships in the USA covering tuition, room, board, books, and stipends for 2026 applicants.',
    swatchClass: 'bg-emerald-700 dark:bg-emerald-400',
    textClass: 'text-emerald-800 dark:text-emerald-300',
    borderClass: 'border-emerald-700/25 dark:border-emerald-400/30',
    surfaceClass: 'bg-emerald-50/70 dark:bg-emerald-950/40',
  },
  {
    slug: 'full-tuition',
    name: 'Full Tuition',
    shortName: 'Full Tuition',
    description:
      'Merit and institutional scholarships that waive 100% of undergraduate or graduate tuition and mandatory academic fees.',
    seoTitle: 'Full Tuition Scholarships at U.S. Colleges | ScholarPath USA',
    seoDescription:
      'Browse full-tuition scholarships at leading American public and private universities with renewal terms and GPA criteria.',
    swatchClass: 'bg-blue-700 dark:bg-blue-400',
    textClass: 'text-blue-800 dark:text-blue-300',
    borderClass: 'border-blue-700/25 dark:border-blue-400/30',
    surfaceClass: 'bg-blue-50/70 dark:bg-blue-950/40',
  },
  {
    slug: 'half-funded',
    name: 'Half Funded (50%)',
    shortName: 'Half Funded',
    description:
      'Half-tuition and 50% cost-of-attendance awards that significantly lower net tuition burden and pair well with federal grants.',
    seoTitle: 'Half Tuition Scholarships USA (50% Awards) | ScholarPath USA',
    seoDescription:
      'Compare 50% half-funded U.S. university scholarships for high school seniors, transfer students, and incoming undergraduates.',
    swatchClass: 'bg-amber-700 dark:bg-amber-400',
    textClass: 'text-amber-800 dark:text-amber-300',
    borderClass: 'border-amber-700/25 dark:border-amber-400/30',
    surfaceClass: 'bg-amber-50/70 dark:bg-amber-950/40',
  },
  {
    slug: 'partial-funded',
    name: 'Partial / Quarter Funded',
    shortName: 'Partial Funded',
    description:
      'Targeted annual awards ranging from $3,000 to $18,000 per year that bridge remaining family contribution gaps.',
    seoTitle: 'Partial & Quarter Tuition Scholarships USA | ScholarPath USA',
    seoDescription:
      'Discover stackable partial and quarter-tuition university scholarships across U.S. colleges for 2026–2027.',
    swatchClass: 'bg-slate-700 dark:bg-slate-300',
    textClass: 'text-slate-800 dark:text-slate-200',
    borderClass: 'border-slate-700/25 dark:border-slate-400/30',
    surfaceClass: 'bg-slate-100/80 dark:bg-slate-800/50',
  },
  {
    slug: 'merit-based',
    name: 'Merit-Based',
    shortName: 'Merit-Based',
    description:
      'Competitive academic, leadership, and civic achievement scholarships awarded regardless of household income.',
    seoTitle: 'Merit-Based College Scholarships USA | ScholarPath USA',
    seoDescription:
      'Find top merit-based scholarships awarded for GPA, leadership, research promise, and academic excellence at U.S. universities.',
    swatchClass: 'bg-indigo-700 dark:bg-indigo-400',
    textClass: 'text-indigo-800 dark:text-indigo-300',
    borderClass: 'border-indigo-700/25 dark:border-indigo-400/30',
    surfaceClass: 'bg-indigo-50/70 dark:bg-indigo-950/40',
  },
  {
    slug: 'need-based',
    name: 'Need-Based',
    shortName: 'Need-Based',
    description:
      'Loan-free institutional aid packages meeting up to 100% of demonstrated family financial need via FAFSA and CSS Profile.',
    seoTitle: 'Need-Based Financial Aid & Grants USA | ScholarPath USA',
    seoDescription:
      'Explore loan-free need-based scholarships and institutional grants at U.S. universities meeting full demonstrated financial need.',
    swatchClass: 'bg-teal-700 dark:bg-teal-400',
    textClass: 'text-teal-800 dark:text-teal-300',
    borderClass: 'border-teal-700/25 dark:border-teal-400/30',
    surfaceClass: 'bg-teal-50/70 dark:bg-teal-950/40',
  },
  {
    slug: 'athletic',
    name: 'Athletic',
    shortName: 'Athletic',
    description:
      'NCAA Division I, II, and NAIA varsity athletic scholarships supporting student-athletes across Olympic and revenue sports.',
    seoTitle: 'U.S. College Athletic Scholarships | ScholarPath USA',
    seoDescription:
      'Review NCAA and varsity athletic scholarship programs at U.S. universities including tuition, training, and academic support.',
    swatchClass: 'bg-orange-700 dark:bg-orange-400',
    textClass: 'text-orange-800 dark:text-orange-300',
    borderClass: 'border-orange-700/25 dark:border-orange-400/30',
    surfaceClass: 'bg-orange-50/70 dark:bg-orange-950/40',
  },
  {
    slug: 'stem',
    name: 'STEM',
    shortName: 'STEM',
    description:
      'Funded scholarships for science, technology, engineering, computer science, data analytics, and applied mathematics majors.',
    seoTitle: 'STEM Scholarships for U.S. College Students | ScholarPath USA',
    seoDescription:
      'Apply for STEM university scholarships supporting engineering, computer science, biology, and mathematics students.',
    swatchClass: 'bg-cyan-700 dark:bg-cyan-400',
    textClass: 'text-cyan-800 dark:text-cyan-300',
    borderClass: 'border-cyan-700/25 dark:border-cyan-400/30',
    surfaceClass: 'bg-cyan-50/70 dark:bg-cyan-950/40',
  },
  {
    slug: 'arts-humanities',
    name: 'Arts & Humanities',
    shortName: 'Arts & Humanities',
    description:
      'Portfolio, conservatory, design, journalism, and liberal arts fellowships funding creative and humanities scholarship.',
    seoTitle: 'Arts & Humanities Scholarships USA | ScholarPath USA',
    seoDescription:
      'Discover music, visual arts, architecture, literature, and humanities scholarships at accredited U.S. universities.',
    swatchClass: 'bg-rose-700 dark:bg-rose-400',
    textClass: 'text-rose-800 dark:text-rose-300',
    borderClass: 'border-rose-700/25 dark:border-rose-400/30',
    surfaceClass: 'bg-rose-50/70 dark:bg-rose-950/40',
  },
  {
    slug: 'minority-diversity',
    name: 'Minority / Diversity',
    shortName: 'Minority / Diversity',
    description:
      'Institutional and national equity fellowships expanding access for underrepresented students across U.S. higher education.',
    seoTitle: 'Minority & Diversity College Scholarships | ScholarPath USA',
    seoDescription:
      'Find diversity and underrepresented student scholarships offered by U.S. universities and partner foundations.',
    swatchClass: 'bg-purple-700 dark:bg-purple-400',
    textClass: 'text-purple-800 dark:text-purple-300',
    borderClass: 'border-purple-700/25 dark:border-purple-400/30',
    surfaceClass: 'bg-purple-50/70 dark:bg-purple-950/40',
  },
  {
    slug: 'first-generation',
    name: 'First-Generation Students',
    shortName: 'First-Generation',
    description:
      'Dedicated tuition awards, summer bridge programs, and mentorship stipends for students who are first in their family to attend college.',
    seoTitle: 'First-Generation Student Scholarships USA | ScholarPath USA',
    seoDescription:
      'Explore dedicated scholarships, bridge funding, and advising grants for first-generation U.S. college students.',
    swatchClass: 'bg-yellow-700 dark:bg-yellow-400',
    textClass: 'text-yellow-800 dark:text-yellow-300',
    borderClass: 'border-yellow-700/25 dark:border-yellow-400/30',
    surfaceClass: 'bg-yellow-50/70 dark:bg-yellow-950/40',
  },
  {
    slug: 'graduate-phd',
    name: 'Graduate / PhD Funded',
    shortName: 'Graduate / PhD',
    description:
      'Full graduate fellowships, teaching assistantships, and PhD research funding including tuition remission and living stipends.',
    seoTitle: 'Funded Graduate & PhD Scholarships USA | ScholarPath USA',
    seoDescription:
      'Compare funded Master’s and PhD fellowships at U.S. research universities with tuition waivers and annual stipends.',
    swatchClass: 'bg-sky-700 dark:bg-sky-400',
    textClass: 'text-sky-800 dark:text-sky-300',
    borderClass: 'border-sky-700/25 dark:border-sky-400/30',
    surfaceClass: 'bg-sky-50/70 dark:bg-sky-950/40',
  },
  {
    slug: 'women-in-stem',
    name: 'Women in STEM',
    shortName: 'Women in STEM',
    description:
      'Scholarships and research grants advancing women pursuing degrees in engineering, computing, physics, and biotechnology.',
    seoTitle: 'Women in STEM Scholarships USA 2026 | ScholarPath USA',
    seoDescription:
      'Browse scholarships for women in engineering, computer science, and laboratory sciences at U.S. colleges.',
    swatchClass: 'bg-fuchsia-700 dark:bg-fuchsia-400',
    textClass: 'text-fuchsia-800 dark:text-fuchsia-300',
    borderClass: 'border-fuchsia-700/25 dark:border-fuchsia-400/30',
    surfaceClass: 'bg-fuchsia-50/70 dark:bg-fuchsia-950/40',
  },
  {
    slug: 'military-veterans',
    name: 'Military / Veterans',
    shortName: 'Military / Veterans',
    description:
      'Yellow Ribbon institutional matches, ROTC scholarships, and tuition supplements for active-duty service members, veterans, and dependents.',
    seoTitle: 'Military & Veteran College Scholarships | ScholarPath USA',
    seoDescription:
      'Discover Yellow Ribbon matches, ROTC funding, and military dependent scholarships at participating U.S. universities.',
    swatchClass: 'bg-stone-700 dark:bg-stone-300',
    textClass: 'text-stone-800 dark:text-stone-200',
    borderClass: 'border-stone-700/25 dark:border-stone-400/30',
    surfaceClass: 'bg-stone-100/80 dark:bg-stone-800/50',
  },
];

export function getCategoryBySlug(slug: string): ScholarshipCategory | undefined {
  return SCHOLARSHIP_CATEGORIES.find((cat) => cat.slug === slug);
}
