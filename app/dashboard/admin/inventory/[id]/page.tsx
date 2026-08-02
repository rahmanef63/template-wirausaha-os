import { ProductEditorView } from "@/features/admin/inventory/ProductEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditorView id={id} />;
}
