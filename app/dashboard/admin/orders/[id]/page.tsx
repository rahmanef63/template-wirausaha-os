import { OrderEditorView } from "@/features/admin/orders/OrderEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderEditorView id={id} />;
}
