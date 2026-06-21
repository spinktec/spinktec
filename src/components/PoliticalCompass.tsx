import { useMemo, useRef, useState } from 'react';
import type { Candidate, Voter, VoterBloc } from '../types';
import type { ThemeTokens } from '../theme';
import { clamp } from '../algorithms/spatialModel';

const SIZE = 400; // viewBox units (≈ pixels at full mobile width)

// Quadrant tints by hue (TL blue, TR red, BL green, BR amber). Opacity keeps
// them subtle in both themes.
const QUADRANTS = [
  { x: 0, y: 0, fill: '#3B82F6' }, // top-left
  { x: SIZE / 2, y: 0, fill: '#EF4444' }, // top-right
  { x: 0, y: SIZE / 2, fill: '#22C55E' }, // bottom-left
  { x: SIZE / 2, y: SIZE / 2, fill: '#F59E0B' }, // bottom-right
];

interface Props {
  candidates: Candidate[];
  voters: Voter[];
  tokens: ThemeTokens;
  elected?: number[];
  eliminated?: number[];
  blocs?: VoterBloc[];
  editable?: boolean;
  onCandidateMove?: (id: number, x: number, y: number) => void;
}

const toX = (x: number): number => ((x + 1) / 2) * SIZE;
const toY = (y: number): number => ((1 - y) / 2) * SIZE; // y=1 is top (liberal)

export function PoliticalCompass({
  candidates,
  voters,
  tokens,
  elected = [],
  eliminated = [],
  blocs,
  editable = false,
  onCandidateMove,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<number | null>(null);

  const colorById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of candidates) m.set(c.id, c.color);
    return m;
  }, [candidates]);

  const pointToCompass = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const px = ((clientX - rect.left) / rect.width) * SIZE;
    const py = ((clientY - rect.top) / rect.height) * SIZE;
    return {
      x: clamp((px / SIZE) * 2 - 1, -1, 1),
      y: clamp(1 - (py / SIZE) * 2, -1, 1),
    };
  };

  const handlePointerDown = (e: React.PointerEvent, id: number): void => {
    if (!editable || !onCandidateMove) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setDragId(id);
  };

  const handlePointerMove = (e: React.PointerEvent): void => {
    if (dragId === null || !onCandidateMove) return;
    const p = pointToCompass(e.clientX, e.clientY);
    if (p) onCandidateMove(dragId, p.x, p.y);
  };

  const endDrag = (e: React.PointerEvent): void => {
    if (dragId === null) return;
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    setDragId(null);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Political compass showing voters and candidates"
      className="w-full max-w-[400px] mx-auto block rounded-lg border"
      style={{
        background: tokens.compassBg,
        borderColor: tokens.border,
        willChange: 'transform',
        touchAction: editable ? 'none' : undefined,
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {QUADRANTS.map((q, i) => (
        <rect key={i} x={q.x} y={q.y} width={SIZE / 2} height={SIZE / 2} fill={q.fill} opacity={0.07} />
      ))}

      {/* Axes */}
      <line x1={SIZE / 2} y1={0} x2={SIZE / 2} y2={SIZE} stroke={tokens.border} strokeWidth={1} />
      <line x1={0} y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} stroke={tokens.border} strokeWidth={1} />

      {/* Axis labels */}
      <text x={SIZE / 2} y={12} textAnchor="middle" fontSize={10} fill={tokens.textDim}>Liberal</text>
      <text x={SIZE / 2} y={SIZE - 4} textAnchor="middle" fontSize={10} fill={tokens.textDim}>Conservative</text>
      <text x={4} y={SIZE / 2 - 4} textAnchor="start" fontSize={10} fill={tokens.textDim}>Econ Left</text>
      <text x={SIZE - 4} y={SIZE / 2 - 4} textAnchor="end" fontSize={10} fill={tokens.textDim}>Econ Right</text>

      {/* Voter-bloc ellipses (custom scenario builder preview). 2σ ≈ main spread. */}
      {blocs?.map((b, i) => (
        <ellipse
          key={i}
          cx={toX(b.x)}
          cy={toY(b.y)}
          rx={Math.max(4, b.spread * 2 * (SIZE / 2))}
          ry={Math.max(4, b.spread * 2 * (SIZE / 2))}
          fill={tokens.accent}
          opacity={0.12}
          stroke={tokens.accent}
          strokeOpacity={0.4}
          strokeWidth={1}
        />
      ))}

      {/* Voter dots, colored by first choice */}
      {voters.map((v, i) => (
        <circle
          key={i}
          cx={toX(v.x)}
          cy={toY(v.y)}
          r={1.8}
          fill={colorById.get(v.preferences[0]) ?? tokens.textDim}
          opacity={0.28}
        />
      ))}

      {/* Candidate markers */}
      {candidates.map((c, i) => {
        const isElected = elected.includes(c.id);
        const isOut = eliminated.includes(c.id);
        const cx = toX(c.x);
        const cy = toY(c.y);
        return (
          <g
            key={c.id}
            opacity={isOut ? 0.35 : 1}
            onPointerDown={(e) => handlePointerDown(e, c.id)}
            style={{ cursor: editable ? (dragId === c.id ? 'grabbing' : 'grab') : 'default' }}
          >
            {/* Larger transparent hit area for easier touch dragging */}
            {editable && <circle cx={cx} cy={cy} r={20} fill="transparent" />}
            <circle
              cx={cx}
              cy={cy}
              r={10}
              fill={isOut ? tokens.textDim : c.color}
              stroke={isElected ? tokens.warning : tokens.surface}
              strokeWidth={isElected ? 3 : 1.5}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={tokens.bg}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {String.fromCharCode(65 + i)}
            </text>
            {isElected && (
              <text x={cx} y={cy - 13} textAnchor="middle" fontSize={14} style={{ pointerEvents: 'none' }}>
                🏆
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
