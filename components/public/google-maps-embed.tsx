import { isSafeGoogleMapsEmbedUrl } from "@/lib/validation/google-maps-embed";

export function GoogleMapsEmbed({ url, title }: Readonly<{ url: string; title: string }>) {
  if (!isSafeGoogleMapsEmbedUrl(url)) return null;

  return (
    <div className="google-property-map">
      <iframe
        src={url}
        title={`${title} map`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
