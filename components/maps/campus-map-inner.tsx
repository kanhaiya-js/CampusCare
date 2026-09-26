"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils/format";

interface MapIssue {
  id: string;
  publicIssueId: string;
  title: string;
  latitude: number | null;
  longitude: number | null;
  priority: string;
  status: string;
  locationName: string;
  room?: string | null;
  categoryName: string;
}

interface CampusMapInnerProps {
  issues: MapIssue[];
  onSelectIssue?: (issue: MapIssue) => void;
  center?: [number, number];
  zoom?: number;
}

export default function CampusMapInner({
  issues,
  onSelectIssue,
  center = [28.4728, 77.4895],
  zoom = 17,
}: CampusMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (markersLayer) {
      markersLayer.clearLayers();

      issues.forEach((issue) => {
        if (issue.latitude && issue.longitude) {
          const priorityColor =
            issue.priority === "CRITICAL"
              ? "#ef4444"
              : issue.priority === "HIGH"
              ? "#f59e0b"
              : issue.priority === "MEDIUM"
              ? "#3b82f6"
              : "#64748b";

          // Custom pulsing SVG marker
          const customIcon = L.divIcon({
            className: "custom-map-marker",
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="
                  width: 24px;
                  height: 24px;
                  background-color: ${priorityColor};
                  border: 2px solid white;
                  border-radius: 50%;
                  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 10px;
                  font-weight: bold;
                ">
                  !
                </div>
                ${
                  issue.priority === "CRITICAL"
                    ? `<div style="
                        position: absolute;
                        width: 32px;
                        height: 32px;
                        background-color: ${priorityColor};
                        opacity: 0.4;
                        border-radius: 50%;
                        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                      "></div>`
                    : ""
                }
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon });

          const statusInfo = STATUS_CONFIG[issue.status] || { label: issue.status };
          const priorityInfo = PRIORITY_CONFIG[issue.priority] || { label: issue.priority };

          const popupContent = `
            <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: bold; color: #4338ca; font-size: 12px;">#${issue.publicIssueId}</span>
                <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #e2e8f0; font-weight: 600;">
                  ${priorityInfo.label}
                </span>
              </div>
              <h4 style="font-weight: 600; font-size: 13px; margin: 4px 0 6px 0; color: #0f172a;">${issue.title}</h4>
              <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">${issue.locationName} ${issue.room ? `(${issue.room})` : ""}</p>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
                <span style="font-size: 11px; font-weight: 500; color: #334155;">${statusInfo.label}</span>
                <a href="/issues/${issue.id}" style="color: #4f46e5; font-size: 11px; font-weight: 600; text-decoration: none;">View details →</a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on("click", () => {
            if (onSelectIssue) onSelectIssue(issue);
          });

          markersLayer.addLayer(marker);
        }
      });
    }
  }, [issues, center, zoom, onSelectIssue]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-xl overflow-hidden shadow border border-border">
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
}
