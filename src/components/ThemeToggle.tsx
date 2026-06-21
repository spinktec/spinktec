import type { ThemeTokens } from '../theme';
import type { ThemePreference } from '../hooks/useTheme';

interface Props {
  preference: ThemePreference;
  tokens: ThemeTokens;
  onCycle: () => void;
}

// Google Material Icons name + label per preference. 'system' is shown as
// "System" (follows the OS default); the others are explicit overrides.
const META: Record<ThemePreference, { icon: string; label: string }> = {
  system: { icon: 'routine', label: 'System' },
  light: { icon: 'light_mode', label: 'Light Mode' },
  dark: { icon: 'dark_mode', label: 'Dark Mode' },
};

export function ThemeToggle({ preference, tokens, onCycle }: Props) {
  const { icon, label } = META[preference];
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={`Theme: ${label}. Click to change theme.`}
      title={`Theme: ${label} — click to change`}
      className="flex h-11 items-center gap-2 rounded-lg border px-3 focus:outline-none focus-visible:ring-2"
      style={{ borderColor: tokens.border, background: tokens.surface, color: tokens.text }}
    >
      <span className="material-icons" aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>
        {icon}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
