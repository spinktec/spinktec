// A pop-up shown at the start of each election: one ballot per active voting
// method, marked by a voter in real time. Plurality fills a single bubble,
// approval ticks the acceptable candidates, and ranked methods (IRV, STV,
// Borda, Condorcet) write preference numbers. When the marking finishes it
// dismisses itself via onDone so the count can begin. Honors reduced-motion.

import { useEffect, useMemo, useState } from 'react';
import type { VotingMethod } from '../types';
import type { ThemeTokens } from '../theme';
import { CANDIDATE_COLORS } from '../theme';
import { METHOD_DESCRIPTIONS, METHOD_LABELS } from '../constants';

interface Props {
  methods: VotingMethod[];
  candidateCount: number;
  tokens: ThemeTokens;
  onDone: () => void;
}

type MarkKind = 'fill' | 'check' | 'rank';
interface RowMark {
  seq: number; // reveal order
  kind: MarkKind;
  label?: string;
}
interface Ballot {
  method: VotingMethod;
  instruction: string;
  rows: number; // candidate rows shown
  marks: Map<number, RowMark>; // row index → mark
  steps: number; // number of marks to reveal
}

// Marking pace, slowed by 200% (3×) so the ballot-casting animation is easy to
// follow before the "Ballots complete" state appears.
const STEP_MS = 780;
const SETTLE_MS = 2550;

function shuffle(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBallot(method: VotingMethod, rows: number): Ballot {
  const order = shuffle(rows);
  const marks = new Map<number, RowMark>();
  let instruction: string;

  if (method === 'plurality') {
    instruction = 'Choose one';
    marks.set(order[0], { seq: 0, kind: 'fill' });
  } else if (method === 'approval') {
    instruction = 'Approve any you find acceptable';
    const k = Math.max(2, Math.min(rows, 2 + (Math.random() < 0.5 ? 0 : 1)));
    order.slice(0, k).forEach((row, i) => marks.set(row, { seq: i, kind: 'check' }));
  } else {
    instruction = 'Rank the candidates';
    order.forEach((row, i) => marks.set(row, { seq: i, kind: 'rank', label: String(i + 1) }));
  }

  return { method, instruction, rows, marks, steps: marks.size };
}

export function BallotOverlay({ methods, candidateCount, tokens, onDone }: Props) {
  const rows = Math.max(3, Math.min(candidateCount, 5));
  const ballots = useMemo(() => methods.map((m) => buildBallot(m, rows)), [methods, rows]);
  const maxSteps = useMemo(() => ballots.reduce((m, b) => Math.max(m, b.steps), 1), [ballots]);

  // 'intro'  → opening message + start button, no ballots yet
  // 'marking'→ ballots appear and are filled out
  // 'done'   → marking finished, results button shown
  const [phase, setPhase] = useState<'intro' | 'marking' | 'done'>('intro');
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(false);
  const done = phase === 'done';

  // Begin generating/filling the ballots once the voter heads to the polls.
  const goToPolls = (): void => setPhase('marking');

  useEffect(() => {
    if (phase !== 'marking') return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // Show the completed ballots and the results button immediately.
      setShown(true);
      setStep(maxSteps);
      setPhase('done');
      return;
    }

    // Trigger the card pop-in on the next frame.
    const raf = requestAnimationFrame(() => setShown(true));
    let s = 0;
    const id = window.setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= maxSteps) {
        window.clearInterval(id);
        window.setTimeout(() => setPhase('done'), SETTLE_MS);
      }
    }, STEP_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [phase, maxSteps]);

  const letter = (i: number): string => String.fromCharCode(65 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 backdrop-blur-sm sm:items-center sm:p-4"
      style={{ background: tokens.bg + 'E6' }}
      role="status"
      aria-label="Voters are filling out their ballots"
    >
      <div className="my-auto flex w-full max-w-[1000px] flex-col gap-4 py-4">
        <h2 className="text-center text-sm font-bold sm:text-base" style={{ color: tokens.text }}>
          {phase === 'intro' && '🗳️ A voter fills out a ballot for each voting method'}
          {phase === 'marking' && '✍️ Marking the ballots…'}
          {phase === 'done' && '✅ Ballots complete — the count is ready'}
        </h2>

        {phase === 'intro' && (
          <div className="flex flex-col items-center gap-4">
            <p
              className="max-w-2xl text-center text-xs leading-relaxed sm:text-sm"
              style={{ color: tokens.textDim }}
            >
              Even in a system where each person casts a single vote, there is no one
              “right” way to turn those votes into winners. The same ballots can be
              counted by several different voting methods — plurality, ranked-choice,
              approval, and more — and each method prioritizes a different reading of
              the voters’ intent: a candidate’s most passionate supporters, the
              broadest acceptable consensus, or the choice that would beat every rival
              head-to-head. Pick a scenario and watch how the method you choose can
              change who wins, even when nobody’s vote changes.
            </p>
            <button
              type="button"
              onClick={goToPolls}
              autoFocus
              className="min-h-11 w-full max-w-sm rounded-lg px-6 py-2 text-center text-sm font-bold leading-tight focus:outline-none focus-visible:ring-2 sm:w-auto"
              style={{ background: tokens.accent, color: tokens.bg }}
            >
              Let's go to the polling stations and vote →
            </button>
          </div>
        )}

        {phase !== 'intro' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ballots.map((b, bi) => (
            <div
              key={b.method}
              tabIndex={0}
              aria-describedby={`ballot-tip-${b.method}`}
              className="group relative rounded-xl border p-3 shadow-lg transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2"
              style={{
                background: tokens.surface,
                borderColor: tokens.border,
                opacity: shown ? 1 : 0,
                transform: shown ? 'scale(1)' : 'scale(0.92)',
                transitionDelay: `${bi * 70}ms`,
              }}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: tokens.textDim }}
                >
                  Official Ballot
                </span>
                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: tokens.accent }}>
                  {METHOD_LABELS[b.method]}
                  <span
                    aria-hidden
                    className="flex h-4 w-4 items-center justify-center rounded-full border text-[9px]"
                    style={{ borderColor: tokens.accent }}
                  >
                    i
                  </span>
                </span>
              </div>

              {/* Hover/focus balloon: explains this method's rules. */}
              <span
                id={`ballot-tip-${b.method}`}
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-60 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border p-2 text-xs leading-snug opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
                style={{ background: tokens.bg, borderColor: tokens.border, color: tokens.textDim }}
              >
                <span className="mb-0.5 block font-semibold" style={{ color: tokens.text }}>
                  {METHOD_LABELS[b.method]}
                </span>
                {METHOD_DESCRIPTIONS[b.method]}
              </span>
              <p className="mb-2 text-[11px] italic" style={{ color: tokens.textDim }}>
                {b.instruction}
              </p>

              <div className="flex flex-col gap-1.5">
                {Array.from({ length: b.rows }, (_, r) => {
                  const mark = b.marks.get(r);
                  const revealed = mark !== undefined && mark.seq < step;
                  const color = CANDIDATE_COLORS[r % CANDIDATE_COLORS.length];
                  return (
                    <div key={r} className="flex items-center gap-2">
                      {/* Marking box */}
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold transition-all duration-200"
                        style={{
                          border: `2px solid ${revealed ? tokens.accent : tokens.border}`,
                          borderRadius: mark?.kind === 'fill' ? '9999px' : '0.25rem',
                          background: revealed && mark?.kind !== 'rank' ? tokens.accent : 'transparent',
                          color: mark?.kind === 'rank' ? tokens.accent : tokens.bg,
                          transform: revealed ? 'scale(1)' : 'scale(0.9)',
                        }}
                      >
                        {revealed && mark?.kind === 'rank' && mark.label}
                        {revealed && mark?.kind === 'check' && '✓'}
                        {revealed && mark?.kind === 'fill' && '✓'}
                      </span>
                      {/* Candidate identity */}
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="text-xs font-semibold" style={{ color: tokens.text }}>
                        Candidate {letter(r)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="flex min-h-[2.75rem] justify-center px-3">
          {done && (
            <button
              type="button"
              onClick={onDone}
              autoFocus
              className="min-h-11 w-full max-w-sm rounded-lg px-6 py-2 text-center text-sm font-bold leading-tight transition-opacity focus:outline-none focus-visible:ring-2 sm:w-auto"
              style={{ background: tokens.accent, color: tokens.bg }}
            >
              View Election Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
