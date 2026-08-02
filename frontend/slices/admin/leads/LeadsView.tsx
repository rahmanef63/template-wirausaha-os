"use client";

import { useMutation, useQuery } from "convex/react";
import { Mail, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/features/_shared/ui/section-head";

const NEXT_STATUS = { new: "contacted", contacted: "closed", closed: "new" } as const;

export function LeadsView() {
  const leads = useQuery(api.leads.list);
  const setStatus = useMutation(api.leads.setStatus);
  const remove = useMutation(api.leads.remove);

  return (
    <div className="space-y-5">
      <SectionHead eyebrow="Inbox" title="Leads" subtitle="Pesan masuk dari form kontak publik." />

      {leads === undefined ? (
        <p className="text-sm text-muted-foreground">Memuat…</p>
      ) : leads.length === 0 ? (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6 text-sm text-muted-foreground">Belum ada pesan masuk.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => (
            <Card key={l._id} className="border-border/60 bg-card/60">
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{l.name}</span>
                    {l.topic ? <span className="text-xs text-muted-foreground">· {l.topic}</span> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={l.status === "new" ? "default" : l.status === "contacted" ? "secondary" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() =>
                        setStatus({ id: l._id, status: NEXT_STATUS[l.status] }).catch(() => toast.error("Gagal update status"))
                      }
                    >
                      {l.status}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Hapus"
                      onClick={() => remove({ id: l._id }).catch(() => toast.error("Gagal hapus"))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-foreground/85">{l.message}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {l.whatsapp ? (
                    <span className="flex items-center gap-1"><MessageCircle className="size-3" /> {l.whatsapp}</span>
                  ) : null}
                  {l.email ? (
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1 hover:text-foreground">
                      <Mail className="size-3" /> {l.email}
                    </a>
                  ) : null}
                  <span>{new Date(l.ts).toLocaleString("id-ID")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
