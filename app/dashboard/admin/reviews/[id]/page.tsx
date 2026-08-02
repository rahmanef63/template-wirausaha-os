import { ReviewEditorView } from "@/features/admin/reviews/ReviewEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReviewEditorView id={id} />;
}
