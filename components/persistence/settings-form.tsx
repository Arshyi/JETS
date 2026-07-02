import {
  hardwareUseCases,
  useCaseLabels
} from "@/types/hardware";
import { updateSettingsAction } from "@/lib/supabase/persistence-actions";
import type { UserSettingsRow } from "@/types/database";

type SettingsFormProps = {
  settings: UserSettingsRow | null;
};

export function SettingsForm({ settings }: SettingsFormProps) {
  return (
    <form action={updateSettingsAction} className="rounded-lg border border-border bg-panel p-6">
      <div>
        <h2 className="text-xl font-semibold">Search defaults</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These settings are persisted in Supabase and can become defaults for
          future search, alerts, and saved-build workflows.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Minimum budget
          <input
            name="defaultBudgetMin"
            type="number"
            min="0"
            defaultValue={settings?.default_budget_min ?? ""}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Maximum budget
          <input
            name="defaultBudgetMax"
            type="number"
            min="0"
            defaultValue={settings?.default_budget_max ?? ""}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Default location
          <input
            name="defaultLocation"
            type="text"
            defaultValue={settings?.default_location ?? ""}
            placeholder="Phoenix, AZ"
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Preferred use case
          <select
            name="preferredUseCase"
            defaultValue={settings?.preferred_use_case ?? ""}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            <option value="">No preference</option>
            {hardwareUseCases.map((useCase) => (
              <option key={useCase} value={useCase}>
                {useCaseLabels[useCase]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Theme preference
          <select
            name="preferredTheme"
            defaultValue={settings?.preferred_theme ?? "system"}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3 text-sm font-medium">
          <input
            name="emailNotifications"
            type="checkbox"
            defaultChecked={settings?.email_notifications ?? false}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          Email me about saved build changes later
        </label>
      </div>

      <button
        type="submit"
        className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        Save settings
      </button>
    </form>
  );
}
