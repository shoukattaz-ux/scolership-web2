import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DegreeLevel, QuizAnswers } from '../types/scholarship';
import { SeoHead } from '../components/SeoHead';
import { Breadcrumbs, buildBreadcrumbSchema } from '../components/Breadcrumbs';
import { ScholarshipCard } from '../components/ScholarshipCard';

const INITIAL_ANSWERS: QuizAnswers = {
  degreeLevel: '',
  minGpa: 3.5,
  fieldOfStudy: 'Any',
  preferredFunding: 'any',
  backgroundFocus: 'none',
  preferredState: 'Any',
};

export function QuizPage() {
  const { scholarships } = useAppContext();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>(INITIAL_ANSWERS);
  const [submitted, setSubmitted] = useState(false);

  const states = useMemo(() => Array.from(new Set(scholarships.map((s) => s.state))).sort(), [scholarships]);

  const matchedScholarships = useMemo(() => {
    if (!submitted) return [];

    return scholarships
      .map((s) => {
        let score = 0;
        const reasons: string[] = [];

        if (answers.degreeLevel && s.degreeLevels.includes(answers.degreeLevel as DegreeLevel)) {
          score += 35;
          reasons.push(`Open to ${answers.degreeLevel}`);
        } else if (!answers.degreeLevel) {
          score += 10;
        } else {
          return { scholarship: s, score: -1, reasons: [] };
        }

        if (answers.minGpa >= s.gpaMin) {
          score += 25;
          reasons.push(`Meets ${s.gpaMin.toFixed(1)} GPA minimum`);
        } else if (answers.minGpa >= s.gpaMin - 0.2) {
          score += 5;
        } else {
          score -= 20;
        }

        if (
          answers.fieldOfStudy === 'Any' ||
          s.fieldsOfStudy.includes('All Majors') ||
          s.fieldsOfStudy.some((f) => f.toLowerCase().includes(answers.fieldOfStudy.toLowerCase()))
        ) {
          score += 15;
        }

        if (answers.preferredFunding === 'any') {
          score += 10;
        } else if (
          s.category === answers.preferredFunding ||
          s.secondaryCategories?.includes(answers.preferredFunding)
        ) {
          score += 25;
          reasons.push('Matches preferred funding tier');
        }

        if (
          answers.backgroundFocus !== 'none' &&
          (s.category === answers.backgroundFocus ||
            s.secondaryCategories?.includes(answers.backgroundFocus))
        ) {
          score += 25;
          reasons.push('Matches background/pathway focus');
        }

        if (answers.preferredState !== 'Any' && s.state === answers.preferredState) {
          score += 15;
          reasons.push(`Located in ${s.state}`);
        }

        return { scholarship: s, score, reasons };
      })
      .filter((item) => item.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);
  }, [scholarships, answers, submitted]);

  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Eligibility Quiz' }];

  const resetQuiz = () => {
    setAnswers(INITIAL_ANSWERS);
    setStep(1);
    setSubmitted(false);
  };

  return (
    <>
      <SeoHead
        title="Scholarship Eligibility Quiz | ScholarPath USA"
        description="Answer 5 quick questions about your GPA, degree level, major, and aid goals to find matching U.S. university scholarships."
        canonicalPath="/quiz"
        schemas={[buildBreadcrumbSchema(breadcrumbs, typeof window !== 'undefined' ? window.location.origin : '')]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Find Scholarships That Match You
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-2">
            Complete this 5-step eligibility matcher to rank U.S. university scholarships suited to your profile.
          </p>
        </header>

        {!submitted ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              <span>Step {step} of 5</span>
              <div className="w-40 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-navy-900 dark:bg-gold-500 transition-all duration-200"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  1. What is your current academic stage?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['High School Senior', 'Undergraduate', 'Transfer', 'Graduate / PhD'] as DegreeLevel[]).map(
                    (deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, degreeLevel: deg }))}
                        className={`p-4 text-left rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                          answers.degreeLevel === deg
                            ? 'bg-navy-900 text-white border-navy-900 dark:bg-gold-500 dark:text-slate-950 dark:border-gold-500'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {deg}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  2. What is your cumulative unweighted GPA?
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Selected GPA: <strong className="tabular-nums text-navy-900 dark:text-gold-400">{answers.minGpa.toFixed(2)}</strong>
                </p>
                <input
                  type="range"
                  min={2.4}
                  max={4.0}
                  step={0.05}
                  value={answers.minGpa}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, minGpa: parseFloat(e.target.value) }))}
                  className="w-full accent-navy-900 dark:accent-gold-500"
                />
                <div className="flex justify-between text-xs text-slate-500 tabular-nums">
                  <span>2.40</span>
                  <span>3.00</span>
                  <span>3.50</span>
                  <span>4.00</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  3. Intended field of study?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'Any',
                    'Computer Science',
                    'Engineering',
                    'Business',
                    'Journalism',
                    'Arts & Humanities',
                    'Public Policy',
                    'Biology',
                  ].map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, fieldOfStudy: field }))}
                      className={`p-3.5 text-left rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                        answers.fieldOfStudy === field
                          ? 'bg-navy-900 text-white border-navy-900 dark:bg-gold-500 dark:text-slate-950 dark:border-gold-500'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {field === 'Any' ? 'Undecided / All Majors' : field}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  4. Preferred funding level &amp; pathway focus?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quiz-funding" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Primary Funding Preference
                    </label>
                    <select
                      id="quiz-funding"
                      value={answers.preferredFunding}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, preferredFunding: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="any">Show All Funding Levels</option>
                      <option value="fully-funded">Fully Funded (100% Full Ride)</option>
                      <option value="full-tuition">Full Tuition</option>
                      <option value="half-funded">Half Funded (50%)</option>
                      <option value="partial-funded">Partial / Quarter Funded</option>
                      <option value="merit-based">Merit-Based</option>
                      <option value="need-based">Need-Based</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quiz-background" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Optional Student Background Focus
                    </label>
                    <select
                      id="quiz-background"
                      value={answers.backgroundFocus}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, backgroundFocus: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="none">General / No Specific Focus</option>
                      <option value="first-generation">First-Generation Student</option>
                      <option value="minority-diversity">Minority / Diversity</option>
                      <option value="women-in-stem">Women in STEM</option>
                      <option value="military-veterans">Military / Veterans / Dependent</option>
                      <option value="need-based">Significant Financial Need</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  5. Preferred U.S. state?
                </h2>
                <select
                  value={answers.preferredState}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, preferredState: e.target.value }))}
                  aria-label="Preferred U.S. state"
                  className="w-full max-w-sm px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
                >
                  <option value="Any">Anywhere in the United States</option>
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Back
              </button>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(5, s + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  <span>See Matching Scholarships</span>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  {matchedScholarships.length} Matched Scholarships Found
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Profile: {answers.degreeLevel || 'All Degrees'} · GPA {answers.minGpa.toFixed(2)} · {answers.fieldOfStudy}
                </p>
              </div>
              <button
                type="button"
                onClick={resetQuiz}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer self-start"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Retake Quiz</span>
              </button>
            </div>

            {matchedScholarships.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No exact matches met every filter combination. Browse all awards or adjust your GPA/stage preferences.
                </p>
                <Link to="/scholarships" className="text-sm font-semibold text-navy-900 dark:text-gold-400 underline">
                  Browse Full Directory
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedScholarships.map(({ scholarship, reasons }) => (
                  <div key={scholarship.id} className="flex flex-col gap-2">
                    <ScholarshipCard scholarship={scholarship} />
                    {reasons.length > 0 && (
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 px-1">
                        Match: {reasons.join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
