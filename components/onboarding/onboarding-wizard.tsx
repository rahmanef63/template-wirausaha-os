"use client";

// Host adapter for the onboarding-wizard slice (rr onboarding-wizard 0.1.0).
// Wires Convex (settings.upsert / seed.seedSample / setup.status) and the
// theme-presets bridge (grouped registry + swatches + live preview) into the
// props-driven wizard. No ImageField host control in this template — logo and
// favicon stay editable in admin Settings.

import * as React from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  groupTweakcnPresets,
  tweakcnSwatches,
  useThemePreset,
} from "@/features/theme-presets";
import {
  OnboardingWizard as WizardView,
  type PresetOption,
} from "@/features/onboarding-wizard";

export function OnboardingWizard({ onDone }: { onDone: () => void }) {
  const upsert = useMutation(api.settings.upsert);
  const convex = useConvex();
  const seedSample = useMutation(api.seed.seedSample);
  const importAll = useMutation(api.backup.importAll);
  const status = useQuery(api.setup.status);
  const { registry, preview } = useThemePreset();

  const presetOptions = React.useMemo<PresetOption[]>(() => {
    if (!registry) return [];
    return groupTweakcnPresets(registry.items).flatMap((g) =>
      g.items.map((p) => ({
        name: p.name,
        group: g.label,
        swatches: tweakcnSwatches(p),
      })),
    );
  }, [registry]);

  return (
    <WizardView
      onDone={onDone}
      save={(fields) => upsert(fields)}
      seedSample={() => seedSample({})}
      seeded={status?.seeded}
      exportJson={() => convex.query(api.backup.exportAll, {})}
      importJson={(snapshot) => importAll({ snapshot })}
      presetOptions={presetOptions}
      defaultPresetLabel="Bawaan template"
      onPresetPreview={preview}
    />
  );
}
