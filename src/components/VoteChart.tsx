import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { Candidate } from '../types';
import type { ThemeTokens } from '../theme';

interface Props {
  candidates: Candidate[];
  scores: Record<number, number>;
  winners: number[];
  tokens: ThemeTokens;
}

export function VoteChart({ candidates, scores, winners, tokens }: Props) {
  const data = candidates
    .filter((c) => scores[c.id] !== undefined)
    .map((c) => ({
      id: c.id,
      name: String.fromCharCode(65 + candidates.indexOf(c)),
      value: Math.round((scores[c.id] ?? 0) * 10) / 10,
      color: c.color,
      isWinner: winners.includes(c.id),
    }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="name" tick={{ fill: tokens.textDim, fontSize: 11 }} axisLine={{ stroke: tokens.border }} tickLine={false} />
          <YAxis tick={{ fill: tokens.textDim, fontSize: 10 }} axisLine={{ stroke: tokens.border }} tickLine={false} width={28} />
          <Bar dataKey="value" isAnimationActive={false} radius={[3, 3, 0, 0]}>
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
