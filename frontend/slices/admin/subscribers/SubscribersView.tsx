"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { Ban, Download, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Admin surface for the newsletter subscribers captured by the public
// subscribe form. Reads api.subscribers.list (admin-gated) and manages rows
// via setStatus/remove. CSV export lets the owner move the list into their ESP.
const STATUS_TONE: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15",
  pending: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/15",
  unsubscribed: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/15",
};

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function SubscribersView() {
  const subscribers = useQuery(api.subscribers.list, {});
  const setStatus = useMutation(api.subscribers.setStatus);
  const remove = useMutation(api.subscribers.remove);
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const rows = subscribers ?? [];
    const needle = q.toLowerCase().trim();
    if (!needle) return rows;
    return rows.filter((s) => s.email.toLowerCase().includes(needle));
  }, [subscribers, q]);

  function exportCsv() {
    const rows = subscribers ?? [];
    if (rows.length === 0) {
      toast.error("Belum ada pelanggan untuk diekspor.");
      return;
    }
    const header = "email,status,source,joined_at";
    const body = rows
      .map((s) => `${s.email},${s.status},${s.source},${new Date(s.ts).toISOString()}`)
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-sm text-muted-foreground">
            {(subscribers ?? []).length} pelanggan newsletter
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={exportCsv}>
            <Download className="size-3.5" /> Export CSV
          </Button>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari email..."
            className="h-9 w-56"
          />
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {subscribers === undefined ? (
            <p className="p-10 text-center text-sm text-muted-foreground">Memuat...</p>
          ) : filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Belum ada pelanggan. Form newsletter di situs publik akan mengisi daftar ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border/60">
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Sumber</th>
                    <th className="px-4 py-3 text-left">Bergabung</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((s) => (
                    <tr key={s._id} className="hover:bg-accent/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">{s.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={"rounded-full text-[10px] " + (STATUS_TONE[s.status] ?? "")}
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">{s.source}</td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">{fmtDate(s.ts)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {s.status !== "unsubscribed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 text-[11px] text-amber-400"
                              onClick={() => {
                                setStatus({ id: s._id, status: "unsubscribed" })
                                  .then(() => toast.success("Ditandai unsubscribe"))
                                  .catch(() => toast.error("Gagal mengubah status"));
                              }}
                            >
                              <Ban className="size-3.5" /> Unsubscribe
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() => {
                              if (!confirm(`Hapus pelanggan "${s.email}"?`)) return;
                              remove({ id: s._id })
                                .then(() => toast.success("Pelanggan dihapus"))
                                .catch(() => toast.error("Gagal menghapus"));
                            }}
                          >
                            <Trash2 className="size-3.5 text-rose-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
