import { useTheme } from "../theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="pill-button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span className="pill-button__glyph" aria-hidden="true">
        {isDark ? "☾" : "☀"}
      </span>
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
