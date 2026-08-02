"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Theme preset tokens. Picking one stores `var(--token)`, so the color tracks
// the active theme preset live (light/dark + brand). "Custom…" stores a hex.
const THEME_TOKENS: { label: string; value: string }[] = [
  { label: "Primary", value: "var(--primary)" },
  { label: "Secondary", value: "var(--secondary)" },
  { label: "Accent", value: "var(--accent)" },
  { label: "Background", value: "var(--background)" },
  { label: "Foreground", value: "var(--foreground)" },
  { label: "Muted", value: "var(--muted)" },
  { label: "Card", value: "var(--card)" },
  { label: "Border", value: "var(--border)" },
  { label: "Destructive", value: "var(--destructive)" },
];

const CUSTOM = "__custom__";
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Color control with a theme-preset dropdown. `value` is either a theme token
 * (`var(--primary)`) that follows the active preset, or a raw hex for a fixed
 * color. Picking "Custom…" reveals a native color input + hex field.
 */
export function ThemeColorPicker({
  value,
  onChange,
  placeholder = "#000000",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const isToken = value.startsWith("var(");
  const hexForInput = HEX_RE.test(value) ? value : "#000000";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-8 shrink-0 rounded border border-border/60"
          style={{ background: value || "transparent" }}
        />
        <Select
          value={isToken ? value : CUSTOM}
          onValueChange={(v) =>
            onChange(v === CUSTOM ? (isToken ? "#000000" : value || "#000000") : v)
          }
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Pilih warna" />
          </SelectTrigger>
          <SelectContent>
            {THEME_TOKENS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label} <span className="text-muted-foreground">· theme</span>
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM}>Custom…</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {!isToken && (
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={hexForInput}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 shrink-0 p-1"
            aria-label="Custom color"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-xs"
          />
        </div>
      )}
    </div>
  );
}
