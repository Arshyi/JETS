const themeScript = `(() => {
  try {
    const stored = window.localStorage.getItem("jets-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {}
})();`;

export function ThemeScript() {
  return (
    <script id="jets-theme" dangerouslySetInnerHTML={{ __html: themeScript }} />
  );
}
