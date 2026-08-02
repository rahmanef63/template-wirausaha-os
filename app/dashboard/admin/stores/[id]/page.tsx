import { StoreEditorView } from "@/features/admin/stores/StoreEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoreEditorView id={id} />;
}
