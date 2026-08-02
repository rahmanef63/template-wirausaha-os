import { CatalogEditorView } from "@/features/admin/catalog/CatalogEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CatalogEditorView id={id} />;
}
