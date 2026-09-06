import { processOwnerLandFormData } from "@/app/(public)/sell-your-land/actions";

export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = 21 * 1024 * 1024;

class PayloadTooLargeError extends Error {}

async function readBoundedFormData(request: Request): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data"))
    throw new TypeError("Expected multipart form data.");
  if (!request.body) throw new TypeError("Missing request body.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_MULTIPART_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new Response(body, { headers: { "content-type": contentType } }).formData();
}

function payloadError(status: 400 | 413 | 415, message: string) {
  return Response.json({ ok: false, state: { status: "error", message } }, { status });
}

export async function POST(request: Request) {
  const rawContentLength = request.headers.get("content-length");
  const contentLength = rawContentLength === null ? null : Number(rawContentLength);
  if (
    contentLength !== null &&
    (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > MAX_MULTIPART_BYTES)
  )
    return payloadError(413, "Attach at most 10 files with a combined size of 20 MB.");

  if (!(request.headers.get("content-type") ?? "").toLowerCase().startsWith("multipart/form-data"))
    return payloadError(415, "The submission must use multipart form data.");

  let formData: FormData;
  try {
    formData = await readBoundedFormData(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError)
      return payloadError(413, "Attach at most 10 files with a combined size of 20 MB.");
    return payloadError(400, "The submission payload could not be read. Please try again.");
  }
  const result = await processOwnerLandFormData(formData, request.headers);
  if (!result.ok) return Response.json(result, { status: 400 });
  return Response.json({
    ok: true,
    location: `/sell-your-land/thank-you?reference=${encodeURIComponent(result.submissionReference)}`,
  });
}
