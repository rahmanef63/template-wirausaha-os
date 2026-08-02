"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/features/_shared/ui/section-head";
import { UpdateCard } from "@/components/admin/update-card";
import { BackupCard } from "@/components/admin/backup-card";
import { ThemePresetSwitcher } from "@/features/theme-presets";
import { ResetLandingCard } from "@/features/_shared/ui/reset-landing-card";
import { BrandSettingsForm } from "./BrandSettingsForm";

export function SettingsView() {
  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Pengaturan" title="Settings" subtitle="Konfigurasi multi-unit dan AI laporan." />

      <BrandSettingsForm />

      <Card className="border-border/60 bg-card/60">
        <CardContent className="space-y-3 p-5">
          <h3 className="text-base font-medium">AI laporan</h3>
          <p className="text-sm text-muted-foreground">
            AI menulis ringkasan laporan bulanan dari catatan finance dan order. Bahasa: Indonesia formal.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="flex items-center justify-between gap-4 p-5 text-sm">
          <div>
            <p className="font-medium text-foreground">Appearance</p>
            <p className="text-muted-foreground">
              Pilih display mode (light/dark/system) + color preset. Tersimpan
              di browser, berlaku ke seluruh dashboard &amp; situs publik.
            </p>
          </div>
          <ThemePresetSwitcher />
        </CardContent>
      </Card>

      <ResetLandingCard />

      <div className="grid gap-5 md:grid-cols-2">
        <UpdateCard />
        <BackupCard />
      </div>
    </div>
  );
}
