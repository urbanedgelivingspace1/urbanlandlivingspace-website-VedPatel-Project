import { NextResponse } from "next/server";

import { MediaValidationError } from "@/features/media/domain/contracts";
import { createPrivateDocumentSignedUrl } from "@/server/services/property-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await createPrivateDocumentSignedUrl(id, "ADMIN_DOWNLOAD");
    return NextResponse.redirect(result.signedUrl, 303);
  } catch (error) {
    const message =
      error instanceof MediaValidationError ? error.message : "Private document access denied.";
    return NextResponse.json(
      { error: message },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  }
}
