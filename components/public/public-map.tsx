"use client";

import { useEffect, useRef, useState } from "react";

import type { PublicLocationDto } from "@/features/properties/domain/contracts";

type MapState = "idle" | "loading" | "ready" | "failed";

export function PublicMap({
  location,
  styleUrl,
}: Readonly<{ location: PublicLocationDto; styleUrl: string | null }>) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<{ remove: () => void } | null>(null);
  const [state, setState] = useState<MapState>("idle");

  useEffect(
    () => () => {
      map.current?.remove();
    },
    [],
  );

  if (location.visibility === "HIDDEN" || !location.point) {
    return (
      <div className="map-fallback">
        <strong>Exact location is shared by UrbanEdge where appropriate.</strong>
        <p>No pin or coordinate is published for this property.</p>
        <p>Contact our team for property-specific location details.</p>
      </div>
    );
  }

  async function loadMap() {
    if (!styleUrl || !container.current || state === "loading" || state === "ready") return;
    setState("loading");
    try {
      const maplibre = await import("maplibre-gl");
      maplibre.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
      const instance = new maplibre.Map({
        container: container.current,
        style: styleUrl,
        center: [location.point!.longitude, location.point!.latitude],
        zoom: location.visibility === "EXACT" ? 14 : 11,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
      instance.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
      const marker = document.createElement("span");
      marker.className = location.visibility === "EXACT" ? "map-pin" : "map-approximate-marker";
      marker.setAttribute("aria-hidden", "true");
      new maplibre.Marker({ element: marker })
        .setLngLat([location.point!.longitude, location.point!.latitude])
        .addTo(instance);
      instance.once("load", () => setState("ready"));
      instance.once("error", () => setState("failed"));
      map.current = instance;
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="public-map-shell">
      <div
        ref={container}
        className="public-map-canvas"
        role="img"
        aria-label={`${location.visibility === "EXACT" ? "Exact" : "Approximate"} public property map`}
      />
      {state !== "ready" ? (
        <div className="public-map-consent">
          <strong>
            {location.visibility === "EXACT" ? "Exact public location" : "Approximate location"}
          </strong>
          <p>
            {location.visibility === "EXACT"
              ? "This listing includes a public map point for discovery."
              : "This map shows only the broader area. Contact UrbanEdge for property-specific details."}
          </p>
          {!styleUrl ? (
            <span className="map-unavailable">Interactive map provider is not configured.</span>
          ) : state === "failed" ? (
            <button type="button" className="button button-outline" onClick={loadMap}>
              Retry map
            </button>
          ) : (
            <button
              type="button"
              className="button button-primary"
              onClick={loadMap}
              disabled={state === "loading"}
            >
              {state === "loading" ? "Loading map…" : "Load interactive map"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
