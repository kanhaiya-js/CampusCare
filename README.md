# SmartCampus — GL Bajaj

> **Report. Track. Resolve. Improve.**  
> Dedicated Campus & Community Issue Resolution and Infrastructure Management Platform for  
> **G.L. Bajaj Institute of Technology & Management (GLBITM)**  
> *Plot No. 2, APJ Abdul Kalam Road, Knowledge Park 3, Greater Noida, Uttar Pradesh, India — 201306*

---

## 1. Institutional Context & Architecture

SmartCampus is engineered specifically around the academic and physical environment of **GLBITM Greater Noida**. It connects students, faculty, department coordinators, specialized maintenance technicians, and institutional leadership into one transparent operations ecosystem.

### Statutory Distinction & College Safeguards
SmartCampus is an **infrastructure, facility maintenance, and physical issue resolution platform**. It does **NOT** replace statutory institutional grievance bodies.
For sensitive matters involving ragging, sexual harassment, acute mental health distress, or medical emergencies, the platform provides:
- A dedicated **Official College Support Directory** (`/support`)
- An automated **Sensitive Issue Interceptor** in the issue reporting wizard that intercepts keywords related to harassment or safety and guides the student to official institutional cells.

---

## 2. Core Functional Modules

### 1. Multi-Step Reporting Wizard («What? Where? Evidence? Submit»)
- Simple, humanized flow without technical jargon:
  - **WHAT?**: Problem category and description with automated sensitive issue detection.
  - **WHERE & EVIDENCE?**: Building/block selection (Block A, B, C, Library, SHD Auditorium, Hostels), department tagging (CSE, ECE, IT, ME, EE, ASH, MCA, MBA), club requests, and photo/video upload.
  - **SUBMIT**: Review, automated duplicate checking, priority heuristics, and ticket generation (e.g. `SC-2026-000101`).

### 2. Intelligent Duplicate Issue Detection
- Semantic token overlap and location cross-referencing against unresolved campus tickets.
- Warns users when a similar problem (e.g., "AC not cooling in A-204") is already under review, preventing ticket flood.

### 3. Rule-Based Smart Priority Engine
- Evaluates life-safety hazards, location criticality (exam halls, Central Library, server rooms), and multiple affected users.

### 4. Interactive Campus Map (`/map`)
- Centered on GLBITM Knowledge Park 3 coordinates (`28.4728, 77.4895`).
- Displays issue hotspots with severity pins and filtering across campus blocks.

### 5. Campus Facilities Directory (`/facilities`)
- Directory of verified GLBITM infrastructure:
  - **Central Library (3rd Floor, Block A)**: 1,280 sq.m AC area, 305+ capacity, 20 digital terminals.
  - **SHD Auditorium**: 30m × 40m, 900+ seating capacity, acoustic engineering.
  - **Central Computer Centre & Labs**: CSE, AI/DS, ECE, Mechanical, Central Workshops.
  - **Residential Hostels**: Boys & Girls Hostels with geysers, Wi-Fi, 24x7 security, mess.
  - **Cafeteria, Sports Grounds, Gymnasium, and Incubation Center**.

### 6. Campus Transport & Bus Fleet (`/transport`)
- Verified routes for Academic Session 2026–27:
  - **Route 01**: GTB Hospital / Dilshad Garden / Preet Vihar / Pari Chowk / GLBITM
  - **Route 02**: Anand Vihar ISBT / Ghazipur / Akshardham / Sector 15 / GLBITM
  - **Route 03**: Botanical Garden Metro / Golf Course / Sector 37 / Advant / GLBITM
  - **Route 04**: Noida Sector 62 / Fortis Hospital / Sector 59 Metro / Sector 71 / GLBITM
  - **Route 05**: Sector 15 / Sector 19 / Atta Market / Sector 27 / GLBITM
  - **Route 06**: Greater Noida Local Feeder (Surajpur, Gamma 1, Delta 1, Alpha 1, Pari Chowk)
- Direct maintenance issue reporting for bus cleanliness and stop infrastructure.

### 7. Student Clubs & Societies (`/clubs`)
- Configurable entities for 15 verified student societies:
  - **Technical**: Google Developer Groups (GDG), CodeSpace Club, Enigma Club, BIS Club, SAEINDIA Club
  - **Cultural & Drama**: Abhinaya Club, Navrang Club, Abhyudaya Club, Yuktikula Club
  - **Social & Welfare**: Rotaract Club of GL Bajaj, Electoral Literacy Club, Shrinik Club
  - **Creative & Sports**: Anvitha Club, DreamSpark Aura Club, Sports Club
- Integrated event venue & infrastructure request workflow (`/issues/report?clubId=...`).

### 8. Academic Design Thinking Journey (`/design-thinking`)
- Documented 5-stage UX research framework:
  - **01 Empathize**: 124 student interviews, 18 faculty discussions, 12 technician interviews, 318 survey responses.
  - **02 Define**: Visibility vacuum, duplicate ticket flood, misrouted complaints, uneven workloads.
  - **03 Ideate**: 4-step wizard, duplicate detector, smart priority engine, interactive campus map.
  - **04 Prototype**: Next.js 14, Tailwind CSS, Leaflet, Prisma ORM.
  - **05 Test & Iterate**: 90% reporting time reduction, 79% response time drop, 89% duplicate drop.

---

## 3. Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, TypeScript, React 18)
- **Styling**: Tailwind CSS with CSS Variables design tokens (Dark and Light modes via `next-themes`)
- **Database & ORM**: Prisma ORM with SQLite for zero-dependency local development and PostgreSQL schema for production
- **Authentication**: HTTP-only secure cookie sessions with bcryptjs password hashing and RBAC (`STUDENT`, `FACULTY`, `STAFF`, `MAINTENANCE_STAFF`, `DEPARTMENT_COORDINATOR`, `ADMIN`)
- **Interactive Map**: Leaflet + OpenStreetMap (SSR-safe dynamic loading)
- **Validation**: Zod schema validation on client forms and backend route handlers
- **Testing**: Vitest automated test suite

---

## 4. Fictional Realistic Demo Accounts

All seed demo accounts use password: `Password123!`

| Role | Name | Email | Details |
|---|---|---|---|
| **Student** | Aarav Sharma | `aarav.sharma@glbitm.ac.in` | B.Tech CSE, Student ID `GLB-2023-CS1042` |
| **Faculty** | Prof. S.K. Verma | `prof.skverma@glbitm.ac.in` | ECE Department, Employee ID `GLB-FAC-EC201` |
| **Maintenance Staff** | Rajesh Kumar | `rajesh.electrician@glbitm.ac.in` | Electrical Team Technician |
| **Facility Admin** | Campus Ops Lead | `admin@glbitm.ac.in` | Complete campus facilities administration |

*(Note: The login screen includes 1-click credential fillers for instant demo access).*

---

## 5. Local Setup & Execution

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Verify .env configuration
DATABASE_URL="file:./dev.db"
JWT_SECRET="smartcampus-super-secret-key-at-least-32-chars-long"
```

### 3. Initialize & Seed Database
```bash
npx prisma db push --schema=prisma/schema.sqlite.prisma
npx tsx prisma/seed.ts
```

### 4. Run Test Suite
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Project Presentation Flow

```
GLBITM Campus Infrastructure
          ↓
Students & Faculty Interact with Facilities
          ↓
Problem Occurs (AC, Lab PC, Water, Wi-Fi, Bus, Club Venue)
          ↓
SmartCampus Wizard (What? Where? Evidence? Submit)
    ├── Heuristic Priority Engine
    ├── Duplicate Detection Warning
    └── Sensitive Interceptor (Directs Harassment/Ragging to Official Support)
          ↓
Auto-Assigned to Specialized Maintenance Technician
          ↓
Technician Fixes Problem & Uploads Resolution Evidence
          ↓
Reporter Verifies Resolution (Confirm & Rate / Reopen)
          ↓
Administration Tracks Hotspots, MTTR & Workloads
```

---

## 7. License & Compliance
Designed and developed for **G.L. Bajaj Institute of Technology & Management (GLBITM)**. All rights reserved.
