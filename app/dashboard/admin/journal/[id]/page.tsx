import { JournalEditorView } from "@/features/admin/journal/JournalEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JournalEditorView id={id} />;
}
