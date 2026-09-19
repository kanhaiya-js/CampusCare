"use client";

import dynamic from "next/dynamic";
import React from "react";

const CampusMapInner = dynamic(() => import("./campus-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-xl bg-muted/60 border border-border flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      <span className="text-xs font-medium text-muted-foreground">Loading interactive campus map...</span>
    </div>
  ),
});

export default function CampusMap(props: any) {
  return <CampusMapInner {...props} />;
}
