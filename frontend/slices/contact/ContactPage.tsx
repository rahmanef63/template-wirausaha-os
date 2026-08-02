"use client";

import * as React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHead } from "@/features/_shared/ui/section-head";
import { DEFAULT_SITE_CONFIG } from "@/features/_app/site-config";

export function ContactPage() {
  // Admin-editable email wins; fall back to template default while the
  // settings row is loading/empty.
  const settings = useQuery(api.settings.get);
  const email = settings?.contactEmail || DEFAULT_SITE_CONFIG.email;
  const phone = settings?.contactPhone || "+62 812-3456-7890";
  const address = settings?.contactAddress || "Jl. Lorem No. 42, Bandung";

  const createLead = useMutation(api.leads.create);
  const [name, setName] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [senderEmail, setSenderEmail] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [hp, setHp] = React.useState(""); // honeypot — bots fill it, humans never see it
  const [sending, setSending] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return; // bot
    if (!name.trim() || message.trim().length < 4 || (!senderEmail.includes("@") && !whatsapp.trim())) {
      toast.error("Lengkapi nama, pesan, dan email/WhatsApp.");
      return;
    }
    setSending(true);
    try {
      await createLead({
        name: name.trim(),
        whatsapp: whatsapp.trim() || undefined,
        email: senderEmail.trim() || undefined,
        topic: topic.trim() || undefined,
        message: message.trim(),
      });
      toast.success("Pesan terkirim — tim kami akan menghubungi kamu.");
      setName(""); setWhatsapp(""); setSenderEmail(""); setTopic(""); setMessage("");
    } catch {
      toast.error("Gagal mengirim. Coba lagi.");
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        eyebrow="Kontak"
        title="Hubungi kami"
        subtitle="Untuk pertanyaan kerjasama, supplier, atau partnership multi-unit."
      />

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-3">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-xs">Nama</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">No. WhatsApp</Label>
                  <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+62..." className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="email@kamu.com" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Topik</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Kerjasama / supplier / lainnya" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Pesan</Label>
                <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Detail pertanyaan..." className="mt-1" />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Mengirim…" : "Kirim pesan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-4 p-6 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                <p>{email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</p>
                <p>{phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Alamat</p>
                <p>{address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
