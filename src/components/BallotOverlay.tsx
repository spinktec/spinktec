// A pop-up shown at the start of each election: one ballot per active voting
// method, marked by a voter in real time. Plurality fills a single bubble,
// approval ticks the acceptable candidates, and ranked methods (IRV, STV,
// Borda, Condorcet) write preference numbers. When the marking finishes it
// dismisses itself via onDone so the count can begin. Honors reduced-motion.

import { useEffect, useMemo, useState } from 'react';
import type { VotingMethod } from '../types';
import type { ThemeTokens } from '../theme';
import { CANDIDATE_COLORS } from '../theme';
import { METHOD_LABELS } from '../constants';

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

const STEP_MS = 260;
const SETTLE_MS = 850;

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

  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(false);
  // Marking is finished; show the button that reveals the results.
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // Show the completed ballots and the button immediately.
      setShown(true);
      setStep(maxSteps);
      setDone(true);
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
        window.setTimeout(() => setDone(true), SETTLE_MS);
      }
    }, STEP_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, [maxSteps]);

  const letter = (i: number): string => String.fromCharCode(65 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: tokens.bg + 'E6' }}
      role="status"
      aria-label="Voters are filling out their ballots"
    >
      <div className="flex w-full max-w-[1000px] flex-col gap-4">
        <h2 className="text-center text-sm font-bold sm:text-base" style={{ color: tokens.text }}>
          {done
            ? '✅ Ballots complete — the count is ready'
            : '✍️ A voter fills out a ballot for each voting method…'}
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ballots.map((b, bi) => (
            <div
              key={b.method}
              className="rounded-xl border p-3 shadow-lg transition-all duration-300 ease-out"
              style={{
                background: tokens.surface,
                borderColor: tokens.border,
                opacity: shown ? 1 : 0,
                transform: shown ? 'scale(1)' : 'scale(0.92)',
                transitionDelay: `${bi * 70}ms`,
              }}
            >
              <div className="mb-1 flex items-baseline justify-between">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: tokens.textDim }}
                >
                  Official Ballot
                </span>
                <span className="text-xs font-bold" style={{ color: tokens.accent }}>
                  {METHOD_LABELS[b.method]}
                </span>
              </div>
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

        <div className="flex min-h-[2.75rem] justify-center">
          {done && (
            <button
              type="button"
              onClick={onDone}
              autoFocus
              className="h-11 rounded-lg px-6 text-sm font-bold transition-opacity focus:outline-none focus-visible:ring-2"
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
