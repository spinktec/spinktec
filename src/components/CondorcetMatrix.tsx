import type { Candidate } from '../types';
import type { ThemeTokens } from '../theme';

interface Props {
  candidates: Candidate[];
  matrix: number[][];
  tokens: ThemeTokens;
}

// Head-to-head grid. cell[i][j] = voters preferring row i over column j.
// Scrolls horizontally on narrow screens rather than breaking the layout.
export function CondorcetMatrix({ candidates, matrix, tokens }: Props) {
  const letter = (i: number): string => String.fromCharCode(65 + i);
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="border-collapse text-xs" style={{ color: tokens.text }}>
        <thead>
          <tr>
            <th className="p-1" />
            {candidates.map((_, j) => (
              <th key={j} className="p-1 font-semibold" style={{ color: tokens.textDim }}>
                {letter(j)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((_, i) => (
            <tr key={i}>
              <th className="p-1 text-left font-semibold" style={{ color: tokens.textDim }}>
                {letter(i)}
              </th>
              {candidates.map((_, j) => {
                if (i === j) {
                  return (
                    <td key={j} className="p-1 text-center" style={{ color: tokens.textVeryDim }}>
                      —
                    </td>
                  );
                }
                const win = matrix[i][j] > matrix[j][i];
                return (
                  <td
                    key={j}
                    className="p-1 text-center tabular-nums"
                    style={{ color: win ? tokens.success : tokens.textDim }}
                  >
                    {matrix[i][j]}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
