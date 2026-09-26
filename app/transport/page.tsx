"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bus,
  Clock,
  MapPin,
  AlertCircle,
  Phone,
  Shield,
  ArrowRight,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransportRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  stops?: string | null;
  timings?: string | null;
  busNumber?: string | null;
  driverName?: string | null;
  active: boolean;
}

export default function TransportPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch("/api/transport");
      const data = await res.json();
      if (data.success && data.data) {
        setRoutes(data.data);
        if (data.data.length > 0) {
          setSelectedRoute(data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseStopsList = (stopsStr?: string | null) => {
    if (!stopsStr) return [];
    return stopsStr.split(",").map((s) => s.trim()).filter(Boolean);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
            <Bus className="w-3.5 h-3.5" />
            GLBITM Greater Noida • Academic Session 2026-27
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-foreground tracking-tight">
            Campus Transport & Bus Fleet
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Official institute bus routes connecting Delhi, Noida, Ghaziabad, and Greater Noida.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/issues/report">
            <Button size="sm" variant="primary" className="gap-1.5 shadow-sm">
              <AlertCircle className="w-4 h-4" />
              Report Transport / Bus Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Important Advisory */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Official Transport Notice & Scope</p>
          <p className="text-amber-800/90 dark:text-amber-300/85 leading-relaxed">
            CampusCare provides bus cleanliness, vehicle maintenance, and stop infrastructure reporting. Official bus allocations, seat passes, and route modifications are managed exclusively by the Institute Transport Officer at Gate 1.
          </p>
        </div>
      </div>

      {/* Main Grid: Routes Selector & Stops Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Routes List */}
        <div className="space-y-3 lg:col-span-1">
          <h2 className="text-sm font-bold font-orbitron uppercase tracking-wider text-foreground">
            Active Routes ({routes.length})
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : routes.length === 0 ? (
            <p className="text-xs text-muted-foreground">No transport routes configured.</p>
          ) : (
            <div className="space-y-2.5">
              {routes.map((route) => {
                const isSelected = selectedRoute?.id === route.id;
                const stopsCount = parseStopsList(route.stops).length;
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-primary-50 dark:bg-primary-950/50 border-primary-500 shadow-sm ring-1 ring-primary-500/20"
                        : "bg-card border-border hover:border-primary-300 dark:hover:border-primary-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                        {route.routeNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        2026-27
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-bold text-foreground">{route.routeName}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {route.startPoint} → {route.endPoint}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary-500" />
                        {route.timings || "Morning Schedule"}
                      </span>
                      <span>{stopsCount > 0 ? `${stopsCount} key stops` : "Direct route"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Route Details & Stops Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRoute ? (
            <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm space-y-6">
              {/* Route Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-primary-600 text-white">
                      {selectedRoute.routeNumber}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{selectedRoute.routeName}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Origin: <span className="font-semibold text-foreground">{selectedRoute.startPoint}</span> • Terminal:{" "}
                    <span className="font-semibold text-foreground">{selectedRoute.endPoint}</span>
                  </p>
                </div>

                <Link href={`/issues/report`}>
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    Report Issue on this Route <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>

              {/* Operational Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Assigned Bus</span>
                  <span className="font-semibold text-foreground">{selectedRoute.busNumber || "GLBITM Fleet"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Timings</span>
                  <span className="font-semibold text-foreground">{selectedRoute.timings || "06:45 AM Pickup"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Driver Name</span>
                  <span className="font-semibold text-foreground">{selectedRoute.driverName || "Institute Driver"}</span>
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  Designated Stops & Boarding Points
                </h4>

                {parseStopsList(selectedRoute.stops).length > 0 ? (
                  <div className="space-y-0 pt-1">
                    {parseStopsList(selectedRoute.stops).map((stop, idx, arr) => {
                      const isLast = idx === arr.length - 1;
                      return (
                        <div key={idx} className="flex items-stretch gap-3.5 group">
                          {/* Vertical Progress Line & Centered Stop Node */}
                          <div className="flex flex-col items-center shrink-0 w-6">
                            <div className="w-5 h-5 rounded-full bg-primary-600 border-2 border-background flex items-center justify-center text-white text-[9px] font-bold z-10 shrink-0 shadow-xs mt-2.5">
                              {idx + 1}
                            </div>
                            {!isLast && (
                              <div className="w-[2px] grow bg-primary-200 dark:bg-primary-900/60 my-1" />
                            )}
                          </div>
                          <div className={`p-3 rounded-lg border border-border bg-background w-full flex items-center justify-between ${!isLast ? "mb-3" : ""}`}>
                            <p className="text-xs font-bold text-foreground">{stop}</p>
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              Stop #{idx + 1}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-4">Direct express route to Knowledge Park 3.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground text-xs">
              Select a transport route from the list to view its schedule and stops.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
