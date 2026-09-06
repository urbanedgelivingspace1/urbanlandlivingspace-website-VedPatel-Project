import { notFound, redirect } from "next/navigation";

import { AdminAuthorizationError } from "@/features/admin/domain/authorization";
import { createOwnerDocumentDownload } from "@/server/services/owner-submissions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const { documentId } = await params;
  let signedUrl: string;
  try {
    signedUrl = await createOwnerDocumentDownload(documentId);
  } catch (error) {
    if (error instanceof AdminAuthorizationError) redirect("/admin/login?reason=unauthorized");
    notFound();
  }
  redirect(signedUrl);
}
