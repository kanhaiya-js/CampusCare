"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  BookOpen,
  Laptop,
  Cpu,
  Tv,
  Home,
  Utensils,
  Dumbbell,
  Stethoscope,
  Bus,
  Search,
  ArrowUpRight,
  Shield,
  Layers,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Facility {
  id: string;
  name: string;
  category: "Academic" | "Student Life" | "Support & Innovation";
  location: string;
  description: string;
  highlights: string[];
  icon: any;
  defaultLocationName: string;
}

const FACILITIES: Facility[] = [
  {
    id: "central-library",
    name: "Central Library",
    category: "Academic",
    location: "3rd Floor, Block A",
    description:
      "A 1,280 sq.m fully air-conditioned academic knowledge hub with 305+ seating capacity, competitive examination wing, and extensive engineering & management holdings.",
    highlights: [
      "20 Digital Library Terminals",
      "Online Video Conferencing & E-Lectures",
      "Print, E-Journals & DELNET Access",
      "Air-Conditioned Study Halls",
    ],
    icon: BookOpen,
    defaultLocationName: "Central Library (Block A, 3rd Floor)",
  },
  {
    id: "shd-auditorium",
    name: "SHD Auditorium",
    category: "Student Life",
    location: "Auditorium Complex",
    description:
      "Signature institute auditorium measuring approximately 30m × 40m with 900+ seating capacity, advanced acoustic engineering, large presentation screens, and state-of-the-art stage lighting.",
    highlights: [
      "900+ Seating Capacity",
      "High-Lumen Projection Display",
      "Central HVAC & Acoustics",
      "Institutional Convocation Venue",
    ],
    icon: Tv,
    defaultLocationName: "SHD Auditorium",
  },
  {
    id: "computer-centre",
    name: "Central Computer Centre",
    category: "Academic",
    location: "Block B, 2nd Floor",
    description:
      "Equipped with high-performance computing systems, Gigabit LAN infrastructure, power backup, and industry-standard development IDEs for academic and examination workloads.",
    highlights: [
      "High-Speed Gigabit LAN & Wi-Fi",
      "Dual Dedicated UPS Power Backups",
      "Licensed Software & Coding Sandboxes",
      "Capacity for 180+ Concurrent Users",
    ],
    icon: Laptop,
    defaultLocationName: "Computer Centre (Block B)",
  },
  {
    id: "cse-labs",
    name: "Advanced Computer Science Labs",
    category: "Academic",
    location: "Block A & Block B",
    description:
      "Specialized laboratories for Artificial Intelligence, Machine Learning, Data Science, Cloud Computing, and Cyber Security with dedicated GPU workstations.",
    highlights: [
      "AI & Data Science Specialized Units",
      "High-Performance Linux & Windows Rigs",
      "IoT & Embedded Testbeds",
    ],
    icon: Cpu,
    defaultLocationName: "Classroom A-204 (Block A, 2nd Floor)",
  },
  {
    id: "engineering-workshops",
    name: "Central Mechanical & Electrical Workshops",
    category: "Academic",
    location: "Workshop Block",
    description:
      "Hands-on engineering facility hosting Machine Shop, Carpentry, Fitting, Welding, Foundry, Electrical Machines, and Mechatronics stations with safety protocols.",
    highlights: [
      "Heavy Machine Tools & Lathes",
      "Welding & Fabrication Stations",
      "Safety Signage & Protective Equipment",
    ],
    icon: Building2,
    defaultLocationName: "Central Workshop Block",
  },
  {
    id: "hostel-facilities",
    name: "Institute Hostels (Boys & Girls)",
    category: "Student Life",
    location: "Residential Complex",
    description:
      "Safe and comfortable on-campus accommodation with double and triple sharing configurations, dedicated wardens, 24x7 security, power backup, and filtered drinking water.",
    highlights: [
      "Double & Triple Sharing Rooms",
      "Wi-Fi & Study Tables with Almirahs",
      "Filtered RO Water & Geysers",
      "24-Hour Security & Resident Wardens",
    ],
    icon: Home,
    defaultLocationName: "Boys Hostel Block 1",
  },
  {
    id: "cafeteria-mess",
    name: "Campus Cafeteria & Dining Hall",
    category: "Student Life",
    location: "Near Student Plaza",
    description:
      "Modern food court and dining facility offering hygienic multi-cuisine options, nutritious daily hostel mess meals, and indoor seating.",
    highlights: [
      "Hygienic Preparation & Regular Inspection",
      "Hostel Dining & Student Mess Sections",
      "Spacious Seating & Filtered Water",
    ],
    icon: Utensils,
    defaultLocationName: "Campus Cafeteria & Food Court",
  },
  {
    id: "sports-gym",
    name: "Sports Complex & Fitness Gym",
    category: "Student Life",
    location: "Campus Sports Grounds",
    description:
      "Comprehensive athletic infrastructure including outdoor basketball, volleyball, cricket/football grounds, indoor badminton, table tennis, and a well-equipped gym.",
    highlights: [
      "Multi-Station Gymnasium",
      "Basketball & Volleyball Courts",
      "Indoor Table Tennis & Chess",
      "Sports Officer Supervision",
    ],
    icon: Dumbbell,
    defaultLocationName: "Sports Complex & Ground",
  },
  {
    id: "medical-centre",
    name: "Campus Medical Dispensary",
    category: "Support & Innovation",
    location: "Ground Floor, Health Centre",
    description:
      "On-campus first-aid clinic with full-time medical officer, emergency medical supplies, observation beds, and direct ambulance linkages with Greater Noida hospitals.",
    highlights: [
      "Resident Qualified Doctor & Nurse",
      "First-Aid & Emergency Medication",
      "Hospital Tie-Ups for Critical Care",
    ],
    icon: Stethoscope,
    defaultLocationName: "Campus Medical Centre (Ground Floor)",
  },
  {
    id: "incubation-center",
    name: "Institute Incubation & Innovation Cell",
    category: "Support & Innovation",
    location: "Block C, 3rd Floor",
    description:
      "Hub for student startups, patent support, prototyping, and industry tie-ups in collaboration with government incubation initiatives and Centers of Excellence.",
    highlights: [
      "Student Startup Workspaces",
      "CILD & NPTEL Local Chapter Support",
      "Mentorship from Industry Leaders",
    ],
    icon: Layers,
    defaultLocationName: "Incubation Center (Block C, 3rd Floor)",
  },
  {
    id: "transport-cell",
    name: "Campus Transport Department",
    category: "Support & Innovation",
    location: "Administrative Block / Gate 1",
    description:
      "Fleet operations governing institute buses connecting Delhi, Noida, Ghaziabad, and Greater Noida routes for day scholars and staff.",
    highlights: [
      "Verified Commuter Routes",
      "Designated Boarding & Dropping Points",
      "Transport Officer In-Charge",
    ],
    icon: Bus,
    defaultLocationName: "Transport Department",
  },
];

export default function FacilitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "Academic", "Student Life", "Support & Innovation"];

  const filteredFacilities = FACILITIES.filter((f) => {
    const matchesCategory = selectedCategory === "ALL" || f.category === selectedCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            GLBITM Greater Noida
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-foreground tracking-tight">
            Campus Facilities Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse verified academic, student life, and support infrastructure across the GL Bajaj campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/issues/report">
            <Button size="sm" variant="primary" className="gap-1.5 shadow-sm">
              + Report Facility Issue
            </Button>
          </Link>
          <Link href="/map">
            <Button size="sm" variant="outline" className="gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-500" />
              View Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 dark:bg-slate-800/60 rounded-xl overflow-x-auto w-full sm:w-auto shadow-inner">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-card text-foreground shadow-sm font-bold dark:bg-slate-900"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/40"
              }`}
            >
              {cat === "ALL" ? "All Facilities" : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground z-10" />
          <Input
            placeholder="Search facility by name or block..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => {
          const Icon = facility.icon;
          return (
            <div
              key={facility.id}
              className="rounded-2xl border border-border bg-card text-card-foreground p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {facility.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground">{facility.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mt-0.5">
                    <MapPin className="w-3 h-3 text-primary-500 shrink-0" />
                    <span>{facility.location}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {facility.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[11px] font-bold text-foreground">Verified Highlights:</span>
                  <ul className="space-y-1">
                    {facility.highlights.map((hl, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <Link
                  href={`/issues/report`}
                  className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                >
                  Report Issue Here <ArrowUpRight className="w-3 h-3" />
                </Link>
                <span className="text-[10px] text-muted-foreground">GLBITM Facility</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-xl border border-primary-200 dark:border-primary-900 bg-primary-50/50 dark:bg-primary-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-0.5">
          <p className="font-bold text-foreground">
            Facility details, rooms, or maintenance SLAs can be updated through the Admin Panel.
          </p>
          <p className="text-muted-foreground">
            CampusCare dynamically supports adding new buildings, blocks, labs, and equipment types without code modifications.
          </p>
        </div>
        <Link href="/admin">
          <Button size="sm" variant="outline" className="text-xs shrink-0">
            Admin Configuration
          </Button>
        </Link>
      </div>
    </div>
  );
}
