"use client";

import { useEffect, useId, useRef, useState } from "react";

const MY_MAPS_URL = "https://mymaps.google.com/";

type Props = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

export function PropertyBoundaryMapGuideDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [copiedSample, setCopiedSample] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.open = true;
        }
      }
    } else {
      if (dialog.open) {
        if (typeof dialog.close === "function") {
          dialog.close();
        } else {
          dialog.open = false;
        }
      }
    }
  }, [open]);

  // Handle escape & backdrop click fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleBackdropClick);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  const handleCopySample = async () => {
    try {
      await navigator.clipboard.writeText("https://www.google.com/maps/d/viewer?mid=SAMPLE_MAP_ID");
      setCopiedSample(true);
      setTimeout(() => setCopiedSample(false), 2000);
    } catch {
      // Clipboard write failed or disallowed
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto w-[92vw] max-w-3xl rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-6 py-5 text-white">
          <div className="pr-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.587a14.28 14.28 0 002.274 1.765c.311.193.571.337.757.433.092.047.17.086.23.116.03.015.053.025.07.033l.006.003.002.001zM10 13a4 4 0 100-8 4 4 0 000 8z"
                  clipRule="evenodd"
                />
              </svg>
              Google My Maps Guide
            </div>
            <h2 id={titleId} className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
              How to Create & Embed Boundary Maps
            </h2>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">
              Show exact property boundaries and acreage context instead of a single pin so buyers
              can interactively inspect the land on their phone or computer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Close guide"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <span className="text-xs font-semibold text-slate-600">
            3 simple steps using desktop browser:
          </span>
          <a
            href={MY_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            Open Google My Maps
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6.194 12.753a.75.75 0 001.06 1.06l7.25-7.25V9.25a.75.75 0 001.5 0V4.5a.75.75 0 00-.75-.75h-4.75a.75.75 0 000 1.5h2.693l-6.953 6.953a.75.75 0 00-.05.05z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>

        {/* Steps Content */}
        <div className="space-y-4 overflow-y-auto p-6 text-sm text-slate-700">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-base font-bold text-slate-900">Create the Boundary Map</h3>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              <li>
                Open your desktop browser and go to{" "}
                <a
                  href={MY_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 underline hover:text-emerald-900"
                >
                  Google My Maps
                </a>
                .
              </li>
              <li>
                Click the <strong>Create a New Map</strong> button in the top left.
              </li>
              <li>
                Search for your property address or GPS coordinate pin to locate the land.
              </li>
              <li>
                Zoom in closely until you clearly see property lines or structures.{" "}
                <span className="text-slate-500">
                  (Tip: Switch the base map at the bottom of the left panel to <strong>Satellite</strong>{" "}
                  view to easily spot fences, roads, and landmarks).
                </span>
              </li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-base font-bold text-slate-900">Draw and Highlight the Area</h3>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              <li>
                Click the <strong>Draw a line</strong> icon (small inverted &apos;V&apos; with dots below
                the main search bar) and select <strong>Add line or shape</strong>.
              </li>
              <li>
                Click on the first corner of your property, then click sequentially on each
                subsequent corner to trace the perimeter.
              </li>
              <li>
                Close the shape by clicking back on your very first starting point.
              </li>
              <li>
                A box will pop up. Name the shape (e.g. <em>&quot;Property Boundary&quot;</em>) and
                click <strong>Save</strong>.
              </li>
              <li>
                Click the <strong>Paint Bucket</strong> icon on that shape: choose border thickness,
                pick a bright highlight color (like red or yellow), and adjust the fill transparency so
                buyers can clearly see the ground underneath.
              </li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Share &amp; Paste Link into UrbanEdge
              </h3>
            </div>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              <li>
                On the left control panel, click the <strong>Share</strong> button.
              </li>
              <li>
                Toggle the permissions so that{" "}
                <strong>&quot;Anyone with this link can view&quot;</strong> is turned{" "}
                <strong>ON</strong>.
              </li>
              <li>
                Copy the generated link (or click the three dots <strong>⋮</strong> next to the map
                title &rarr; <strong>&quot;Embed on my site&quot;</strong> and copy the embed
                iframe).
              </li>
              <li>
                Paste the copied link or iframe directly into the <strong>Google Maps Embed</strong>{" "}
                field on this form.
              </li>
            </ul>
            <div className="mt-3 rounded-lg bg-emerald-50/80 p-3 text-xs text-emerald-900 border border-emerald-200">
              <strong>Buyer Experience:</strong> When buyers open the listing, they will see your custom
              highlighted polygon laid directly over Google Maps, allowing them to clearly understand
              the layout, acreage context, and surrounding area.
            </div>
          </div>

          {/* Pro Tips Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Helpful Pro-Tips
            </h4>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2 text-xs text-slate-600">
              <div className="rounded-lg bg-white p-3 border border-slate-200">
                <p className="font-semibold text-slate-800">📏 Calculate Total Area</p>
                <p className="mt-1 leading-normal">
                  Inside Google My Maps, clicking directly on your drawn boundary shape instantly
                  calculates and displays the exact total area (sq meters, hectares, or acres) and
                  perimeter distance.
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-slate-200">
                <p className="font-semibold text-slate-800">📍 Exact Corner Coordinates</p>
                <p className="mt-1 leading-normal">
                  If you have latitude &amp; longitude coordinates from property survey papers, paste
                  each pair into the search bar to place marker pins, then snap your line between them.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                Accepted: <code>https://www.google.com/maps/d/viewer?mid=...</code>,{" "}
                <code>/d/embed?mid=...</code>, or full <code>&lt;iframe&gt;</code> code.
              </span>
              <button
                type="button"
                onClick={handleCopySample}
                className="font-semibold text-emerald-700 hover:text-emerald-900 whitespace-nowrap"
              >
                {copiedSample ? "Copied sample!" : "Copy sample URL"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <a
            href={MY_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900"
          >
            Launch mymaps.google.com &rarr;
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Got it, back to form
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function PropertyBoundaryMapQuickGuide({
  onOpenDialog,
}: Readonly<{
  onOpenDialog: () => void;
}>) {
  return (
    <details className="group rounded-xl border border-slate-200 bg-slate-50/80 md:col-span-2 transition">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-100/70">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
            ?
          </span>
          <span>
            Need help? <strong>3-step manual to draw boundary map &amp; get embed link</strong>
          </span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onOpenDialog();
            }}
            className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900"
          >
            Open Full Guide ↗
          </button>
          <span className="text-slate-400 group-open:rotate-180 transition-transform text-xs">
            ▼
          </span>
        </div>
      </summary>
      <div className="space-y-3 border-t border-slate-200 bg-white px-4 py-4 text-xs sm:text-sm text-slate-700">
        <p className="text-xs text-slate-600">
          Draw custom boundary shapes with color highlights in <strong>Google My Maps</strong> so
          buyers interactively see exact boundaries and acreage context.
        </p>
        <ol className="list-decimal space-y-2 pl-4 text-xs sm:text-sm text-slate-700">
          <li>
            <strong>Create map:</strong> Open{" "}
            <a
              href={MY_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 underline font-medium"
            >
              Google My Maps
            </a>
            , click <em>Create a New Map</em>, search address/GPS pin, zoom in closely and switch
            base map to <em>Satellite</em>.
          </li>
          <li>
            <strong>Draw &amp; highlight shape:</strong> Click <em>Draw a line</em> icon &rarr; <em>Add line or shape</em>.
            Click each corner around property perimeter and click start point to close. Name it &quot;Property Boundary&quot;,
            save, and use the <em>Paint Bucket</em> to pick bright border color and fill transparency.
          </li>
          <li>
            <strong>Share &amp; paste:</strong> Click <em>Share</em> &rarr; turn ON{" "}
            <em>&quot;Anyone with this link can view&quot;</em>. Copy the share link (or click ⋮ &rarr;{" "}
            <em>Embed on my site</em>) and paste it into the field above.
          </li>
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Click shape in My Maps anytime to view calculated acreage &amp; perimeter length.
          </span>
          <button
            type="button"
            onClick={onOpenDialog}
            className="font-semibold text-emerald-700 hover:text-emerald-900 underline"
          >
            View detailed visual walkthrough &rarr;
          </button>
        </div>
      </div>
    </details>
  );
}
