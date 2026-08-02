"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { optimizeImage } from "@/lib/optimize-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeColorPicker } from "@/features/_shared/ui/theme-color-picker";
import { Label } from "@/components/ui/label";
import { ImagePickerButton } from "@/features/image-picker";
import { parseSocials } from "@/features/_shared/ui/site-footer";
import { DEFAULT_SITE_CONFIG } from "@/features/_app/site-config";

// Fields mirror the names accepted by convex/settings.ts → settings.upsert.
// The social* fields are serialized to the JSON `socials` string on save.
type BrandFields = {
  siteName: string;
  tagline: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  brandColor: string;
  logoUrl: string;
  socialX: string;
  socialLinkedin: string;
  socialGithub: string;
  socialYoutube: string;
};

const c = DEFAULT_SITE_CONFIG;

function emptyFields(): BrandFields {
  return {
    siteName: "",
    tagline: "",
    ownerName: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    brandColor: "",
    logoUrl: "",
    socialX: "",
    socialLinkedin: "",
    socialGithub: "",
    socialYoutube: "",
  };
}

/** Controlled brand form: hydrates from settings.get, persists via settings.upsert. */
export function BrandSettingsForm() {
  const settings = useQuery(api.settings.get);
  const upsert = useMutation(api.settings.upsert);
  const genUploadUrl = useMutation(api.files.generateUploadUrl);
  const getFileUrl = useMutation(api.files.getUrl);
  const [fields, setFields] = React.useState<BrandFields>(emptyFields);
  const [saving, setSaving] = React.useState(false);

  // Upload a picked file to Convex storage and resolve its served URL.
  const onUpload = async (file: File): Promise<string> => {
    const upload = await optimizeImage(file);
    const uploadUrl = await genUploadUrl();
    const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": upload.type }, body: upload });
    const { storageId } = (await res.json()) as { storageId: string };
    return ((await getFileUrl({ storageId: storageId as never })) as string) ?? "";
  };

  // Hydrate once settings resolve (falls back to template defaults per field).
  React.useEffect(() => {
    if (settings === undefined) return;
    const sc = parseSocials(settings?.socials);
    setFields({
      siteName: settings?.siteName ?? c.brandName,
      tagline: settings?.tagline ?? c.tagline,
      ownerName: settings?.ownerName ?? c.ownerName,
      contactEmail: settings?.contactEmail ?? c.email,
      contactPhone: settings?.contactPhone ?? "",
      contactAddress: settings?.contactAddress ?? "",
      brandColor: settings?.brandColor ?? c.themeColor,
      logoUrl: settings?.logoUrl ?? "",
      socialX: sc.x ?? "",
      socialLinkedin: sc.linkedin ?? "",
      socialGithub: sc.github ?? "",
      socialYoutube: sc.youtube ?? "",
    });
  }, [settings]);

  const set = (k: keyof BrandFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    try {
      const { socialX, socialLinkedin, socialGithub, socialYoutube, ...brand } = fields;
      const socialsMap = Object.fromEntries(
        ([["x", socialX], ["linkedin", socialLinkedin], ["github", socialGithub], ["youtube", socialYoutube]] as const)
          .filter(([, v]) => v.trim()),
      );
      await upsert({
        ...brand,
        contactPhone: brand.contactPhone || undefined,
        contactAddress: brand.contactAddress || undefined,
        socials: Object.keys(socialsMap).length ? JSON.stringify(socialsMap) : undefined,
      });
      toast.success("Pengaturan brand tersimpan.");
    } catch {
      toast.error("Gagal menyimpan. Pastikan kamu login sebagai admin.");
    } finally {
      setSaving(false);
    }
  }

  const loading = settings === undefined;

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="space-y-3 p-5">
        <h3 className="text-base font-medium">Brand</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-xs">Brand name</Label>
            <Input value={fields.siteName} onChange={set("siteName")} disabled={loading} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Owner</Label>
            <Input value={fields.ownerName} onChange={set("ownerName")} disabled={loading} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input value={fields.contactEmail} onChange={set("contactEmail")} disabled={loading} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Telepon / WhatsApp</Label>
            <Input value={fields.contactPhone} onChange={set("contactPhone")} disabled={loading} placeholder="+62 812-3456-7890" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Alamat</Label>
            <Input value={fields.contactAddress} onChange={set("contactAddress")} disabled={loading} placeholder="Jl. ... , Kota" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Tagline</Label>
            <Input value={fields.tagline} onChange={set("tagline")} disabled={loading} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Brand color</Label>
            <div className="mt-1">
              <ThemeColorPicker
                value={fields.brandColor}
                onChange={(c) => setFields((prev) => ({ ...prev, brandColor: c }))}
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Logo</Label>
            <div className="mt-1 flex items-center gap-3">
              {fields.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fields.logoUrl}
                  alt="Logo"
                  className="h-10 w-auto rounded-md border border-border/60 object-contain"
                />
              ) : null}
              <ImagePickerButton
                label={fields.logoUrl ? "Ganti logo" : "Upload logo"}
                title="Logo"
                onUpload={onUpload}
                searchUnsplash={undefined}
                onChange={(img) => setFields((prev) => ({ ...prev, logoUrl: img?.value ?? "" }))}
              />
            </div>
            <Input
              value={fields.logoUrl}
              onChange={set("logoUrl")}
              disabled={loading}
              placeholder="https://… (atau upload di atas)"
              className="mt-2"
            />
          </div>
          <div>
            <Label className="text-xs">X / Twitter URL</Label>
            <Input value={fields.socialX} onChange={set("socialX")} disabled={loading} placeholder="https://x.com/username" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">LinkedIn URL</Label>
            <Input value={fields.socialLinkedin} onChange={set("socialLinkedin")} disabled={loading} placeholder="https://linkedin.com/in/username" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">GitHub URL</Label>
            <Input value={fields.socialGithub} onChange={set("socialGithub")} disabled={loading} placeholder="https://github.com/username" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">YouTube URL</Label>
            <Input value={fields.socialYoutube} onChange={set("socialYoutube")} disabled={loading} placeholder="https://youtube.com/@username" className="mt-1" />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button onClick={save} disabled={loading || saving} className="gap-1">
            {saving && <Loader2 className="size-4 animate-spin" />}
            Simpan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
