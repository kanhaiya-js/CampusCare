"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Compass,
  MapPin,
  Mic,
  Code,
  Heart,
  Palette,
  Trophy,
  ArrowRight,
  Search,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  leadName?: string | null;
  facultyCoordinator?: string | null;
  active: boolean;
  _count?: {
    issues: number;
  };
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await fetch("/api/clubs");
      const data = await res.json();
      if (data.success && data.data) {
        setClubs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["ALL", "Technical", "Cultural", "Social & Welfare", "Literary & Creative", "Sports"];

  const filteredClubs = clubs.filter((c) => {
    const matchesCat = selectedCategory === "ALL" || c.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("tech") || lower.includes("code")) return Code;
    if (lower.includes("cultur") || lower.includes("drama")) return Mic;
    if (lower.includes("social") || lower.includes("welfare")) return Heart;
    if (lower.includes("art") || lower.includes("creativ")) return Palette;
    if (lower.includes("sport")) return Trophy;
    return Compass;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            GLBITM Student Community & Societies
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Student Clubs & Societies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Empowering student initiatives, tech hackathons, cultural festivals, and community welfare at GL Bajaj.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/issues/report">
            <Button size="sm" variant="primary" className="gap-1.5 shadow-sm">
              <Calendar className="w-4 h-4" />
              Event / Venue Infrastructure Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Club Workflow Callout */}
      <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-900 bg-primary-50/50 dark:bg-primary-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <p className="font-bold text-foreground">
            Club Infrastructure & Logistics Support Workflow
          </p>
          <p className="text-muted-foreground">
            Club coordinators can log event logistics requirements (projectors, seminar hall mics, extra seating, or lighting) directly through CampusCare.
          </p>
        </div>
        <div className="text-[11px] font-semibold text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-border shadow-xs">
          Club → Venue → Logistics Request → Facilities Team
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search club or society..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground text-xs">
          No clubs found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const Icon = getCategoryIcon(club.category);
            return (
              <div
                key={club.id}
                className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {club.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground">{club.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {club.description}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-border text-[11px] text-muted-foreground">
                    {club.leadName && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Student Lead:</span>
                        <span className="font-semibold text-foreground">{club.leadName}</span>
                      </div>
                    )}
                    {club.facultyCoordinator && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Faculty Mentor:</span>
                        <span className="font-semibold text-foreground">{club.facultyCoordinator}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/issues/report?clubId=${club.id}`}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    Raise Club Requirement <ArrowRight className="w-3 h-3" />
                  </Link>
                  <span className="text-[10px] text-muted-foreground">
                    {club._count?.issues || 0} active tickets
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
