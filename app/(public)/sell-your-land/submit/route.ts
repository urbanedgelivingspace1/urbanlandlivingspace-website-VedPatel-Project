import { processOwnerLandFormData } from "@/app/(public)/sell-your-land/actions";

export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = 21 * 1024 * 1024;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES)
    return Response.json(
      {
        ok: false,
        state: {
          status: "error",
          message: "Attach at most 10 files with a combined size of 20 MB.",
        },
      },
      { status: 413 },
    );

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      {
        ok: false,
        state: {
          status: "error",
          message: "The submission payload could not be read. Please try again.",
        },
      },
      { status: 400 },
    );
  }
  const result = await processOwnerLandFormData(formData, request.headers);
  if (!result.ok) return Response.json(result, { status: 400 });
  return Response.json({
    ok: true,
    location: `/sell-your-land/thank-you?reference=${encodeURIComponent(result.submissionReference)}`,
  });
}
