"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

function resolveTheme(): Theme {
  const stored = window.localStorage.getItem("jets-theme");

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(resolveTheme());
  }, []);

  useEffect(() => {
    if (!theme) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("jets-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-panel text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={cn("h-4 w-4", isDark && "hidden")} aria-hidden="true" />
      <Moon className={cn("h-4 w-4", !isDark && "hidden")} aria-hidden="true" />
    </button>
  );
}
