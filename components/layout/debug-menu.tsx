"use client";

import { setSegment } from "@/app/actions";

type DebugMenuProps = {
  segment: string;
};

const AVAILABLE_SEGMENTS = ["home", "shops", ""] as const;

export function DebugMenu({ segment: currentSegment }: DebugMenuProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white px-4 py-3 rounded-lg text-sm z-50 backdrop-blur-md border border-gray-600 shadow-lg">
      <div className="text-xs uppercase tracking-wider font-semibold mb-2 text-gray-400">Debug Menu</div>
      <div className="font-mono">
        <select
          className="bg-gray-800/80 border border-gray-600 rounded-md px-3 py-1.5 w-full text-green-400 hover:border-gray-500 transition-colors focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          value={currentSegment}
          onChange={(e) => setSegment(e.target.value)}
        >
          {AVAILABLE_SEGMENTS.map((segment) => (
            <option key={segment} value={segment} className="text-green-400 bg-gray-800">
              {segment || "none"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
