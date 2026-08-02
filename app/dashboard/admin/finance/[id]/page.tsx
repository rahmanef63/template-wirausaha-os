import { FinanceEditorView } from "@/features/admin/finance/FinanceEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FinanceEditorView id={id} />;
}
