import { CalendarClock } from 'lucide-react';

interface DeadlineCountdownProps {
  deadlineISO: string;
  deadlineLabel: string;
  compact?: boolean;
}

export function getDaysUntilDeadline(deadlineISO: string): number {
  const target = new Date(`${deadlineISO}T23:59:59`);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function DeadlineCountdown({ deadlineISO, deadlineLabel, compact = false }: DeadlineCountdownProps) {
  // 2099-12-31 is the placeholder for "no dated deadline stated by the sponsor": show the label only.
  const undated = deadlineISO.startsWith('2099');
  const days = getDaysUntilDeadline(deadlineISO);

  let statusText = '';
  let statusColor = 'text-slate-600 dark:text-slate-300';

  if (undated) {
    statusText = 'Check the official page for dates';
  } else if (days < 0) {
    statusText = 'Cycle closed — check next window';
    statusColor = 'text-slate-500 dark:text-slate-400';
  } else if (days === 0) {
    statusText = 'Closes today';
    statusColor = 'text-rose-700 dark:text-rose-400 font-semibold';
  } else if (days <= 30) {
    statusText = `${days} days remaining`;
    statusColor = 'text-amber-800 dark:text-amber-300 font-medium';
  } else {
    statusText = `${days} days remaining`;
    statusColor = 'text-emerald-800 dark:text-emerald-300';
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
        <CalendarClock className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
        <span>{deadlineLabel}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums">
        <CalendarClock className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" aria-hidden="true" />
        <span>{deadlineLabel}</span>
      </div>
      <span className={`text-xs tabular-nums ${statusColor}`}>{statusText}</span>
    </div>
  );
}
