import { StaffEditorView } from "@/features/admin/staff/StaffEditorView";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StaffEditorView id={id} />;
}
