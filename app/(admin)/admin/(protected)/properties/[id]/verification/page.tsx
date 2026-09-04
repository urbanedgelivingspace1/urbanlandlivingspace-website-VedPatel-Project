import { redirect } from "next/navigation";

export default async function PropertyVerificationAlias({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  redirect(`/admin/verification/${id}`);
}
