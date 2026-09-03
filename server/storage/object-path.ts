import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

const id = z.uuid();
const extension = z.enum(["webp", "pdf", "jpg", "png"]);

export function propertyPrivateMediaPath(propertyId: string, mediaId: string, ext: string) {
  return `properties/${id.parse(propertyId)}/private-media/${id.parse(mediaId)}.${extension.parse(ext)}`;
}

export function propertyPublicMediaPath(propertyId: string, ext: string) {
  return `properties/${id.parse(propertyId)}/media/${randomUUID()}.${extension.parse(ext)}`;
}

export function verificationDocumentPath(propertyId: string, documentId: string, ext: string) {
  return `properties/${id.parse(propertyId)}/verification/${id.parse(documentId)}.${extension.parse(ext)}`;
}
