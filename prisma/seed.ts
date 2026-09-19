import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting SmartCampus — GL Bajaj Institute of Technology & Management seed...");

  // Clean existing tables in reverse dependency order
  try {
    await prisma.feedback.deleteMany();
    await prisma.issueComment.deleteMany();
    await prisma.issueHistory.deleteMany();
    await prisma.issueAttachment.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.issue.deleteMany();
    await prisma.staffProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.program.deleteMany();
    await prisma.department.deleteMany();
    await prisma.club.deleteMany();
    await prisma.transportRoute.deleteMany();
    await prisma.systemSetting.deleteMany();
    await prisma.category.deleteMany();
    await prisma.location.deleteMany();
  } catch (e) {
    console.log("Note: Database was clean or empty.", (e as Error).message);
  }

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Departments & Academic Programs
  const deptCSE = await prisma.department.create({
    data: {
      code: "CSE",
      name: "Computer Science & Engineering",
      description: "Department of Computer Science & Engineering, Artificial Intelligence, and Data Science",
      programs: {
        create: [
          { name: "B.Tech in Computer Science & Engineering", code: "BT-CSE", level: "UG" },
          { name: "B.Tech CSE (Artificial Intelligence)", code: "BT-CSE-AI", level: "UG" },
          { name: "B.Tech CSE (Data Science)", code: "BT-CSE-DS", level: "UG" },
          { name: "B.Tech CSE (AI & Machine Learning)", code: "BT-CSE-AIML", level: "UG" },
          { name: "M.Tech in Computer Science & Engineering", code: "MT-CSE", level: "PG" },
        ],
      },
    },
  });

  const deptECE = await prisma.department.create({
    data: {
      code: "ECE",
      name: "Electronics & Communication Engineering",
      description: "Department of Electronics & Communication Engineering and VLSI Design",
      programs: {
        create: [
          { name: "B.Tech in Electronics & Communication Engineering", code: "BT-ECE", level: "UG" },
          { name: "B.Tech in Electrical and Computer Engineering", code: "BT-ECE-EC", level: "UG" },
        ],
      },
    },
  });

  const deptIT = await prisma.department.create({
    data: {
      code: "IT",
      name: "Information Technology",
      description: "Department of Information Technology & CSIT",
      programs: {
        create: [
          { name: "B.Tech in Information Technology", code: "BT-IT", level: "UG" },
          { name: "B.Tech in Computer Science & Information Technology", code: "BT-CSIT", level: "UG" },
        ],
      },
    },
  });

  const deptME = await prisma.department.create({
    data: {
      code: "ME",
      name: "Mechanical Engineering",
      description: "Department of Mechanical Engineering, Robotics & Automation",
      programs: {
        create: [
          { name: "B.Tech in Mechanical Engineering", code: "BT-ME", level: "UG" },
        ],
      },
    },
  });

  const deptMCA = await prisma.department.create({
    data: {
      code: "MCA",
      name: "Master of Computer Applications",
      description: "Department of Computer Applications (Postgraduate)",
      programs: {
        create: [
          { name: "Master of Computer Applications", code: "PG-MCA", level: "PG" },
        ],
      },
    },
  });

  const deptMBA = await prisma.department.create({
    data: {
      code: "MBA",
      name: "Master of Business Administration",
      description: "Department of Management Studies",
      programs: {
        create: [
          { name: "MBA (General Management)", code: "PG-MBA", level: "PG" },
          { name: "MBA in Business Analytics", code: "PG-MBA-BA", level: "PG" },
        ],
      },
    },
  });

  console.log("✅ Seeded GLBITM Academic Departments & Programs");

  // 2. Create Student Clubs
  const clubs = [
    { name: "Google Developer Groups (GDG)", category: "Technical", description: "Mobile, cloud, and open source development" },
    { name: "Rotaract Club of GL Bajaj", category: "Social", description: "Youth service, community outreach, and social welfare" },
    { name: "Navrang Club", category: "Cultural", description: "Dramatics, street plays, and cultural events" },
    { name: "BIS Club", category: "Technical", description: "Bureau of Indian Standards student chapter" },
    { name: "Electoral Literacy Club", category: "Social", description: "Democracy awareness and voter literacy" },
    { name: "Shrinik Club", category: "Cultural", description: "Literary, poetry, and creative writing" },
    { name: "Enigma Club", category: "Technical", description: "Coding competitions and competitive programming" },
    { name: "SAEINDIA Club", category: "Technical", description: "Automotive design, BAJA, and formula student" },
    { name: "Abhinaya Club", category: "Cultural", description: "Theatre and performing arts" },
    { name: "CodeSpace Club", category: "Technical", description: "Web3, cloud, and hackathon incubation" },
    { name: "Sports Club", category: "Sports", description: "Cricket, football, volleyball, badminton, athletics" },
    { name: "Yuktikula Club", category: "Technical", description: "Robotics and hardware innovation" },
  ];

  for (const c of clubs) {
    await prisma.club.create({ data: c });
  }
  console.log("✅ Seeded GLBITM Student Societies & Clubs");

  // 3. Create Official Transport Routes
  const routes = [
    {
      routeNumber: "Route 01",
      routeName: "Dilshad Garden to GLBITM",
      startPoint: "Dilshad Garden Metro",
      stops: "Dilshad Garden, GTB Hospital, Seemapuri, Anand Vihar, Pari Chowk, GLBITM",
      timings: "07:00 AM Departure — 08:35 AM Arrival",
      busNumber: "UP-16-BT-4101",
      driverName: "Sukhvinder Singh",
    },
    {
      routeNumber: "Route 02",
      routeName: "Anand Vihar to GLBITM",
      startPoint: "Anand Vihar ISBT",
      stops: "Anand Vihar ISBT, Kaushambi, Gazipur, Mayur Vihar Ph-3, Knowledge Park 3",
      timings: "07:15 AM Departure — 08:40 AM Arrival",
      busNumber: "UP-16-BT-4102",
      driverName: "Ram Kumar",
    },
    {
      routeNumber: "Route 03",
      routeName: "Mayur Vihar to GLBITM",
      startPoint: "Mayur Vihar Ph-1",
      stops: "Mayur Vihar Ph-1, Akshardham, Noida Sector 15, Sector 16, Sector 18, GLBITM",
      timings: "07:10 AM Departure — 08:35 AM Arrival",
      busNumber: "UP-16-BT-4103",
      driverName: "Satish Chand",
    },
    {
      routeNumber: "Route 04",
      routeName: "Botanical Garden to GLBITM",
      startPoint: "Botanical Garden Metro",
      stops: "Botanical Garden, Golf Course, Sector 37, Mahamaya Flyover, Pari Chowk, GLBITM",
      timings: "07:25 AM Departure — 08:35 AM Arrival",
      busNumber: "UP-16-BT-4104",
      driverName: "Harish Sharma",
    },
    {
      routeNumber: "Route 05",
      routeName: "Noida Sector 19 & 27 to GLBITM",
      startPoint: "Sector 19 Telephone Exchange",
      stops: "Sector 19, Sector 27 DM Chowk, Sector 29, Sector 39, Advant Navis, GLBITM",
      timings: "07:20 AM Departure — 08:40 AM Arrival",
      busNumber: "UP-16-BT-4105",
      driverName: "Kuldeep Tyagi",
    },
    {
      routeNumber: "Route 06",
      routeName: "Greater Noida Local Shuttle",
      startPoint: "Pari Chowk",
      stops: "Pari Chowk, Alpha 1, Beta 1, Delta 1, Knowledge Park 3 GLBITM",
      timings: "Frequent shuttles every 20 mins from 08:00 AM",
      busNumber: "UP-16-BT-4106",
      driverName: "Mukesh Yadav",
    },
  ];

  for (const r of routes) {
    await prisma.transportRoute.create({ data: r });
  }
  console.log("✅ Seeded GLBITM Transport Fleet & Routes");

  // 4. Create Realistic GLBITM Seed Users
  const admin = await prisma.user.create({
    data: {
      name: "Prof. S. K. Verma",
      email: "admin@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
      studentOrEmployeeId: "GLB-FAC-ADM01",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfVerma",
    },
  });

  const facultyCoordinator = await prisma.user.create({
    data: {
      name: "Dr. Neha Kapoor",
      email: "neha.kapoor@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "FACULTY",
      status: "ACTIVE",
      departmentId: deptCSE.id,
      studentOrEmployeeId: "GLB-FAC-CS108",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DrNeha",
    },
  });

  const electrician = await prisma.user.create({
    data: {
      name: "Ramesh Kumar",
      email: "electrician@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "MAINTENANCE_STAFF",
      status: "ACTIVE",
      studentOrEmployeeId: "GLB-STF-EL01",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh",
      staffProfile: {
        create: {
          specialization: "ELECTRICAL",
          availability: true,
          currentWorkload: 1,
        },
      },
    },
  });

  const plumber = await prisma.user.create({
    data: {
      name: "Sunil Yadav",
      email: "plumber@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "MAINTENANCE_STAFF",
      status: "ACTIVE",
      studentOrEmployeeId: "GLB-STF-PL02",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sunil",
      staffProfile: {
        create: {
          specialization: "PLUMBING",
          availability: true,
          currentWorkload: 1,
        },
      },
    },
  });

  const hvacTech = await prisma.user.create({
    data: {
      name: "Amit Sharma",
      email: "hvac@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "MAINTENANCE_STAFF",
      status: "ACTIVE",
      studentOrEmployeeId: "GLB-STF-HV03",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
      staffProfile: {
        create: {
          specialization: "HVAC",
          availability: true,
          currentWorkload: 1,
        },
      },
    },
  });

  const networkTech = await prisma.user.create({
    data: {
      name: "Vikas Verma",
      email: "network@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "MAINTENANCE_STAFF",
      status: "ACTIVE",
      studentOrEmployeeId: "GLB-STF-IT04",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikas",
      staffProfile: {
        create: {
          specialization: "NETWORK",
          availability: true,
          currentWorkload: 1,
        },
      },
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav.sharma@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      status: "ACTIVE",
      departmentId: deptCSE.id,
      studentOrEmployeeId: "GLB-2023-CS1042",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Priya Verma",
      email: "priya.verma@glbitm.edu",
      passwordHash: defaultPasswordHash,
      role: "STUDENT",
      status: "ACTIVE",
      departmentId: deptECE.id,
      studentOrEmployeeId: "GLB-2024-EC2015",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    },
  });

  console.log("✅ Seeded GLBITM Users, Faculty, and Technicians");

  // 5. Create GLBITM Campus Facilities & Categories
  const catElectrical = await prisma.category.create({
    data: {
      name: "Electrical & Lighting",
      description: "Classroom lights, ceiling fans, AC units, power sockets, distribution boards",
      icon: "Zap",
      defaultPriority: "HIGH",
    },
  });

  const catPlumbing = await prisma.category.create({
    data: {
      name: "Plumbing & Water Supply",
      description: "Drinking water coolers, washrooms, pipeline leaks, drainage, taps",
      icon: "Droplets",
      defaultPriority: "HIGH",
    },
  });

  const catHVAC = await prisma.category.create({
    data: {
      name: "HVAC & Air Conditioning",
      description: "Central Library AC, Auditorium cooling, smart classroom split AC units",
      icon: "Fan",
      defaultPriority: "MEDIUM",
    },
  });

  const catNetwork = await prisma.category.create({
    data: {
      name: "Wi-Fi & IT Infrastructure",
      description: "Campus Wi-Fi APs, Computer Centre LAN ports, projector displays, lab PCs",
      icon: "Wifi",
      defaultPriority: "MEDIUM",
    },
  });

  const catHostel = await prisma.category.create({
    data: {
      name: "Hostel Maintenance",
      description: "Hostel rooms, geysers, double/triple sharing furniture, mess, drinking water",
      icon: "Home",
      defaultPriority: "HIGH",
    },
  });

  const catFurniture = await prisma.category.create({
    data: {
      name: "Furniture & Classroom Infrastructure",
      description: "Desks, chairs, whiteboards, podiums, doors, window latches",
      icon: "Armchair",
      defaultPriority: "LOW",
    },
  });

  const catCleanliness = await prisma.category.create({
    data: {
      name: "Sanitation & Cleanliness",
      description: "Corridor cleaning, washroom hygiene, cafeteria waste disposal",
      icon: "Sparkles",
      defaultPriority: "MEDIUM",
    },
  });

  const catTransport = await prisma.category.create({
    data: {
      name: "Bus Fleet & Transport Maintenance",
      description: "College bus cleanliness, seating maintenance, route stop infrastructure",
      icon: "Bus",
      defaultPriority: "MEDIUM",
    },
  });

  const catSafety = await prisma.category.create({
    data: {
      name: "Safety & Urgent Hazards",
      description: "Exposed wires, water flooding, glass breakage, emergency exit obstructions",
      icon: "ShieldAlert",
      defaultPriority: "CRITICAL",
    },
  });

  console.log("✅ Seeded GLBITM Issue Categories");

  // 6. Create Verified GLBITM Campus Locations (Knowledge Park 3, Greater Noida: 28.4728° N, 77.4895° E)
  const locCampus = await prisma.location.create({
    data: {
      name: "GLBITM Main Campus Grounds",
      building: "Knowledge Park 3 Campus",
      facilityType: "ADMINISTRATION",
      latitude: 28.4728,
      longitude: 77.4895,
    },
  });

  const locBlockA = await prisma.location.create({
    data: {
      name: "Block A (Main Academic Building)",
      building: "Block A",
      facilityType: "ACADEMIC",
      latitude: 28.4731,
      longitude: 77.4892,
      parentLocationId: locCampus.id,
    },
  });

  const locLibrary = await prisma.location.create({
    data: {
      name: "Central Library (3rd Floor, Block A)",
      building: "Block A",
      floor: "3rd Floor",
      room: "Reading Hall & Digital Library",
      facilityType: "LIBRARY",
      latitude: 28.4732,
      longitude: 77.4893,
      parentLocationId: locBlockA.id,
    },
  });

  const locCompCentre = await prisma.location.create({
    data: {
      name: "Computer Centre (Lab 3)",
      building: "Block A",
      floor: "1st Floor",
      room: "Lab A-102",
      facilityType: "LABORATORY",
      latitude: 28.4731,
      longitude: 77.4894,
      parentLocationId: locBlockA.id,
    },
  });

  const locClassroomA204 = await prisma.location.create({
    data: {
      name: "Classroom A-204 (CSE Lecture Hall)",
      building: "Block A",
      floor: "2nd Floor",
      room: "A-204",
      facilityType: "ACADEMIC",
      latitude: 28.473,
      longitude: 77.4891,
      parentLocationId: locBlockA.id,
    },
  });

  const locBlockB = await prisma.location.create({
    data: {
      name: "Block B (Engineering Labs & Workshops)",
      building: "Block B",
      facilityType: "LABORATORY",
      latitude: 28.4725,
      longitude: 77.4898,
      parentLocationId: locCampus.id,
    },
  });

  const locSHDAuditorium = await prisma.location.create({
    data: {
      name: "SHD Auditorium (900+ Seater)",
      building: "SHD Auditorium Complex",
      facilityType: "STUDENT_LIFE",
      latitude: 28.4735,
      longitude: 77.4889,
      parentLocationId: locCampus.id,
    },
  });

  const locHostelBoys = await prisma.location.create({
    data: {
      name: "Boys Hostel (Block 2)",
      building: "Boys Hostel Block 2",
      floor: "2nd Floor",
      room: "Room 214",
      facilityType: "HOSTEL",
      latitude: 28.4721,
      longitude: 77.4902,
      parentLocationId: locCampus.id,
    },
  });

  const locCafeteria = await prisma.location.create({
    data: {
      name: "Campus Cafeteria & Food Court",
      building: "Cafeteria Complex",
      facilityType: "STUDENT_LIFE",
      latitude: 28.4726,
      longitude: 77.489,
      parentLocationId: locCampus.id,
    },
  });

  console.log("✅ Seeded GLBITM Campus Locations");

  // 7. Create Realistic GLBITM Campus Issues
  // Ticket 1: Central Library AC
  const issue1 = await prisma.issue.create({
    data: {
      publicIssueId: "SC-2026-000101",
      title: "Central Library 3rd Floor AC unit leaking condensation onto study tables",
      description:
        "The ceiling AC duct in the North quiet reading wing of the Central Library (3rd Floor, Block A) is leaking water droplets onto desk row 4. Students studying for exams had to shift seats.",
      categoryId: catHVAC.id,
      locationId: locLibrary.id,
      departmentId: deptCSE.id,
      room: "3rd Floor North Reading Wing",
      latitude: 28.4732,
      longitude: 77.4893,
      priority: "HIGH",
      status: "IN_PROGRESS",
      reporterId: student1.id,
      assignedStaffId: hvacTech.id,
      affectedCount: 6,
      history: {
        create: [
          {
            actorId: student1.id,
            oldStatus: null,
            newStatus: "SUBMITTED",
            comment: "Reported by Aarav Sharma from Central Library study desk",
          },
          {
            actorId: admin.id,
            oldStatus: "SUBMITTED",
            newStatus: "VERIFIED",
            comment: "Verified by facilities desk. High academic traffic area.",
          },
          {
            actorId: admin.id,
            oldStatus: "VERIFIED",
            newStatus: "ASSIGNED",
            comment: "Assigned to HVAC technician Amit Sharma",
          },
          {
            actorId: hvacTech.id,
            oldStatus: "ASSIGNED",
            newStatus: "IN_PROGRESS",
            comment: "Inspecting drainage line of duct unit 3B.",
          },
        ],
      },
      comments: {
        create: [
          {
            authorId: student1.id,
            content: "Placed a plastic bin beneath the drip for now to protect textbooks.",
          },
          {
            authorId: hvacTech.id,
            content: "Condensate drain tray was clogged with dust buildup. Cleaning and resealing today.",
          },
        ],
      },
    },
  });

  // Ticket 2: CSE Lab 3 Projector
  const issue2 = await prisma.issue.create({
    data: {
      publicIssueId: "SC-2026-000102",
      title: "Projector HDMI interface flickering in CSE Lab 3, Block A",
      description:
        "Ceiling-mounted projector in Computer Centre Lab 3 (Block A Floor 1) loses signal every few minutes when displaying lab presentations. Loose ceiling cable connection.",
      categoryId: catNetwork.id,
      locationId: locCompCentre.id,
      departmentId: deptCSE.id,
      room: "Lab A-102",
      latitude: 28.4731,
      longitude: 77.4894,
      priority: "MEDIUM",
      status: "ASSIGNED",
      reporterId: facultyCoordinator.id,
      assignedStaffId: networkTech.id,
      affectedCount: 45,
      history: {
        create: [
          {
            actorId: facultyCoordinator.id,
            oldStatus: null,
            newStatus: "SUBMITTED",
            comment: "Reported by Dr. Neha Kapoor during afternoon lab practical session",
          },
          {
            actorId: admin.id,
            oldStatus: "SUBMITTED",
            newStatus: "ASSIGNED",
            comment: "Auto-routed to IT infrastructure team Vikas Verma",
          },
        ],
      },
    },
  });

  // Ticket 3: Water cooler in Block B
  const issue3 = await prisma.issue.create({
    data: {
      publicIssueId: "SC-2026-000103",
      title: "Water cooler drain pipe leaking near Ground Floor Staircase, Block B",
      description:
        "The stainless steel drinking water cooler near the main staircase in Block B has a loose PVC drain pipe causing clean water to pool on the granite floor. Slip hazard for students exiting workshops.",
      categoryId: catPlumbing.id,
      locationId: locBlockB.id,
      room: "Ground Floor Staircase Lobby",
      latitude: 28.4725,
      longitude: 77.4898,
      priority: "HIGH",
      status: "RESOLVED",
      reporterId: student2.id,
      assignedStaffId: plumber.id,
      resolvedAt: new Date(Date.now() - 3600000 * 3),
      history: {
        create: [
          {
            actorId: student2.id,
            oldStatus: null,
            newStatus: "SUBMITTED",
            comment: "Ticket raised by Priya Verma",
          },
          {
            actorId: admin.id,
            oldStatus: "SUBMITTED",
            newStatus: "ASSIGNED",
            comment: "Assigned to Sunil Yadav (Plumbing)",
          },
          {
            actorId: plumber.id,
            oldStatus: "ASSIGNED",
            newStatus: "IN_PROGRESS",
            comment: "Replaced drain hose clamp and tightened waste connection.",
          },
          {
            actorId: plumber.id,
            oldStatus: "IN_PROGRESS",
            newStatus: "RESOLVED",
            comment: "Drain pipe fixed and floor wiped dry. Pending student confirmation.",
          },
        ],
      },
    },
  });

  // Ticket 4: SHD Auditorium Sound System
  const issue4 = await prisma.issue.create({
    data: {
      publicIssueId: "SC-2026-000104",
      title: "SHD Auditorium sound mixer audio channel buzzing during rehearsals",
      description:
        "Stage monitor channel 4 has audible 50Hz electrical hum during Rotaract cultural rehearsals in SHD Auditorium.",
      categoryId: catElectrical.id,
      locationId: locSHDAuditorium.id,
      room: "Main Stage AV Booth",
      latitude: 28.4735,
      longitude: 77.4889,
      priority: "MEDIUM",
      status: "CLOSED",
      reporterId: student1.id,
      assignedStaffId: electrician.id,
      resolvedAt: new Date(Date.now() - 86400000 * 2),
      closedAt: new Date(Date.now() - 86400000),
      history: {
        create: [
          {
            actorId: student1.id,
            oldStatus: null,
            newStatus: "SUBMITTED",
            comment: "Reported by student Aarav Sharma",
          },
          {
            actorId: electrician.id,
            oldStatus: "ASSIGNED",
            newStatus: "RESOLVED",
            comment: "Ground loop isolator installed on audio patch cable.",
          },
          {
            actorId: student1.id,
            oldStatus: "RESOLVED",
            newStatus: "CLOSED",
            comment: "Verified during full dress rehearsal. Sound is crystal clear.",
          },
        ],
      },
      feedback: {
        create: {
          userId: student1.id,
          rating: 5,
          resolved: true,
          comment: "Super fast turnaround before our club event. Thanks Ramesh ji!",
        },
      },
    },
  });

  // Ticket 5: Hostel Geyser
  const issue5 = await prisma.issue.create({
    data: {
      publicIssueId: "SC-2026-000105",
      title: "Geyser not heating in Boys Hostel Block 2, 2nd Floor Washroom",
      description:
        "The 25-litre storage geyser in the 2nd floor common washroom of Boys Hostel Block 2 trips the MCB when switched on.",
      categoryId: catHostel.id,
      locationId: locHostelBoys.id,
      room: "2nd Floor Common Washroom",
      latitude: 28.4721,
      longitude: 77.4902,
      priority: "HIGH",
      status: "SUBMITTED",
      reporterId: student1.id,
      history: {
        create: [
          {
            actorId: student1.id,
            oldStatus: null,
            newStatus: "SUBMITTED",
            comment: "Ticket raised by hostel resident Aarav Sharma",
          },
        ],
      },
    },
  });

  // 8. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: "STATUS_CHANGE",
        title: "Work In Progress: Central Library AC",
        message: "Technician Amit Sharma is currently addressing issue #SC-2026-000101 in Central Library.",
        issueId: issue1.id,
      },
      {
        userId: student2.id,
        type: "RESOLUTION_CONFIRMATION",
        title: "Please Verify: Water Cooler Repair",
        message: "Plumbing issue #SC-2026-000103 in Block B marked resolved. Did Sunil Yadav fix the leak?",
        issueId: issue3.id,
      },
      {
        userId: facultyCoordinator.id,
        type: "ASSIGNMENT",
        title: "Ticket Assigned: CSE Lab Projector",
        message: "Your complaint regarding Lab A-102 projector has been assigned to Vikas Verma (IT Support).",
        issueId: issue2.id,
      },
    ],
  });

  // 9. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "TICKET_VERIFIED",
        entityType: "Issue",
        entityId: issue1.id,
        metadata: JSON.stringify({ priority: "HIGH", location: "Central Library 3rd Floor" }),
      },
      {
        actorId: admin.id,
        action: "STAFF_DISPATCHED",
        entityType: "Issue",
        entityId: issue2.id,
        metadata: JSON.stringify({ assignedTo: "Vikas Verma", department: "CSE" }),
      },
    ],
  });

  console.log("✅ Seeded GLBITM Issues, Histories, Comments, and Notifications");
  console.log("🚀 SmartCampus — GLBITM seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
