import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { Candidate } from '../types';
import type { ThemeTokens } from '../theme';

interface Props {
  candidates: Candidate[];
  scores: Record<number, number>;
  winners: number[];
  tokens: ThemeTokens;
  // 0 → 1 ballot-counting progress. Bars climb from zero as the count comes in.
  progress?: number;
}

export function VoteChart({ candidates, scores, winners, tokens, progress = 1 }: Props) {
  const counting = progress < 1;
  // Keep the Y-axis steady on the final totals so bars visibly climb toward a
  // fixed ceiling instead of the axis rescaling on every frame.
  const maxScore = candidates.reduce((m, c) => Math.max(m, scores[c.id] ?? 0), 0);

  const data = candidates
    .filter((c) => scores[c.id] !== undefined)
    .map((c) => {
      const target = scores[c.id] ?? 0;
      const shown = target * progress;
      return {
        id: c.id,
        name: String.fromCharCode(65 + candidates.indexOf(c)),
        value: shown,
        // Whole ballots while counting; precise total once it settles.
        label: counting ? Math.round(shown) : Math.round(target * 10) / 10,
        color: c.color,
        // Hold the winner highlight until the count finishes — results in.
        isWinner: !counting && winners.includes(c.id),
      };
    });

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 14, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="name" tick={{ fill: tokens.textDim, fontSize: 11 }} axisLine={{ stroke: tokens.border }} tickLine={false} />
          <YAxis
            domain={[0, maxScore > 0 ? Math.ceil(maxScore) : 'auto']}
            tick={{ fill: tokens.textDim, fontSize: 10 }}
            axisLine={{ stroke: tokens.border }}
            tickLine={false}
            width={28}
          />
          <Bar dataKey="value" isAnimationActive={false} radius={[3, 3, 0, 0]}>
            <LabelList dataKey="label" position="top" fill={tokens.textDim} fontSize={10} />
            {data.map((d) => (
              <Cell
                key={d.id}
                fill={d.color}
                stroke={d.isWinner ? tokens.warning : 'transparent'}
                strokeWidth={d.isWinner ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
