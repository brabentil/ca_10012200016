import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // University of Ghana, Legon
  console.log('Seeding University of Ghana...');
  const ug = await prisma.campus.create({
    data: {
      code: 'UG',
      name: 'University of Ghana, Legon',
      zones: {
        create: [
          {
            code: 'UG-MAIN',
            name: 'Main Campus',
            description: 'Great Hall, JQB, Night Market area',
            deliveryFee: 5.00,
          },
          {
            code: 'UG-RES1',
            name: 'Residential Area 1',
            description: 'Commonwealth, Volta, Akuafo Halls',
            deliveryFee: 5.00,
          },
          {
            code: 'UG-RES2',
            name: 'Residential Area 2',
            description: 'Mensah Sarbah, Legon Hall, Pentagon',
            deliveryFee: 5.00,
          },
          {
            code: 'UG-EAST',
            name: 'East Legon Area',
            description: 'UGBS, Law School, Medical School',
            deliveryFee: 8.00,
          },
        ],
      },
    },
  });

  // Ashesi University
  console.log('Seeding Ashesi University...');
  const ashesi = await prisma.campus.create({
    data: {
      code: 'ASHESI',
      name: 'Ashesi University',
      zones: {
        create: [
          {
            code: 'ASH-ACAD',
            name: 'Academic Complex',
            description: 'Engineering Lab, Business School, Library',
            deliveryFee: 5.00,
          },
          {
            code: 'ASH-RES-E',
            name: 'Residential East',
            description: 'Dorms 1-4, Dining Hall',
            deliveryFee: 5.00,
          },
          {
            code: 'ASH-RES-W',
            name: 'Residential West',
            description: 'Dorms 5-8, Sports Complex',
            deliveryFee: 5.00,
          },
          {
            code: 'ASH-ADMIN',
            name: 'Administration & Services',
            description: 'Admin Building, Health Center, Main Gate',
            deliveryFee: 5.00,
          },
        ],
      },
    },
  });

  // University of Professional Studies, Accra (UPSA)
  console.log('Seeding UPSA...');
  const upsa = await prisma.campus.create({
    data: {
      code: 'UPSA',
      name: 'University of Professional Studies, Accra',
      zones: {
        create: [
          {
            code: 'UPSA-ACAD',
            name: 'Academic Buildings',
            description: 'Lecture halls, Library, Faculty buildings',
            deliveryFee: 5.00,
          },
          {
            code: 'UPSA-RES',
            name: 'Residential Area',
            description: 'Student hostels and accommodation',
            deliveryFee: 5.00,
          },
          {
            code: 'UPSA-ADMIN',
            name: 'Administrative Area',
            description: 'Admin offices, Main gate',
            deliveryFee: 5.00,
          },
        ],
      },
    },
  });

  // Central University
  console.log('Seeding Central University...');
  const central = await prisma.campus.create({
    data: {
      code: 'CENTRAL',
      name: 'Central University',
      zones: {
        create: [
          {
            code: 'CU-ACAD',
            name: 'Academic Complex',
            description: 'Lecture halls, Library, Labs',
            deliveryFee: 5.00,
          },
          {
            code: 'CU-RES',
            name: 'Residential Area',
            description: 'Student hostels',
            deliveryFee: 5.00,
          },
          {
            code: 'CU-ADMIN',
            name: 'Administrative Block',
            description: 'Admin offices, Main entrance',
            deliveryFee: 5.00,
          },
        ],
      },
    },
  });

  // Academic City University
  console.log('Seeding Academic City University...');
  const academicCity = await prisma.campus.create({
    data: {
      code: 'ACU',
      name: 'Academic City University',
      zones: {
        create: [
          {
            code: 'ACU-ACAD',
            name: 'Academic Buildings',
            description: 'Lecture halls, Library',
            deliveryFee: 5.00,
          },
          {
            code: 'ACU-RES',
            name: 'Residential Area',
            description: 'Student accommodation',
            deliveryFee: 5.00,
          },
        ],
      },
    },
  });

  // Ghana Institute of Journalism
  console.log('Seeding Ghana Institute of Journalism...');
  const gij = await prisma.campus.create({
    data: {
      code: 'GIJ',
      name: 'Ghana Institute of Journalism',
      zones: {
        create: [
          {
            code: 'GIJ-ACAD',
            name: 'Academic Complex',
            description: 'Lecture halls, Studios, Library',
            deliveryFee: 5.00,
          },
          {
            code: 'GIJ-ADMIN',
            name: 'Administrative Area',
            description: 'Admin offices, Main campus',
            deliveryFee: 5.00,
          },
        ],
      },
    },
  });

  // Fetch all zones for adjacency mapping
  const zones = await prisma.campusZone.findMany();

  console.log('Creating zone adjacency relationships...');

  // UG adjacencies
  const ugMain = zones.find((z: { code: string; id: string }) => z.code === 'UG-MAIN');
  const ugRes1 = zones.find((z: { code: string; id: string }) => z.code === 'UG-RES1');
  const ugRes2 = zones.find((z: { code: string; id: string }) => z.code === 'UG-RES2');
  const ugEast = zones.find((z: { code: string; id: string }) => z.code === 'UG-EAST');

  if (ugMain && ugRes1 && ugRes2 && ugEast) {
    await prisma.zoneAdjacency.createMany({
      data: [
        { zoneId: ugMain.id, adjacentZoneId: ugRes1.id },
        { zoneId: ugMain.id, adjacentZoneId: ugRes2.id },
        { zoneId: ugRes1.id, adjacentZoneId: ugMain.id },
        { zoneId: ugRes1.id, adjacentZoneId: ugRes2.id },
        { zoneId: ugRes2.id, adjacentZoneId: ugMain.id },
        { zoneId: ugRes2.id, adjacentZoneId: ugRes1.id },
        { zoneId: ugEast.id, adjacentZoneId: ugMain.id },
        { zoneId: ugMain.id, adjacentZoneId: ugEast.id },
      ],
    });
  }

  // Ashesi adjacencies
  const ashAcad = zones.find((z: { code: string; id: string }) => z.code === 'ASH-ACAD');
  const ashResE = zones.find((z: { code: string; id: string }) => z.code === 'ASH-RES-E');
  const ashResW = zones.find((z: { code: string; id: string }) => z.code === 'ASH-RES-W');
  const ashAdmin = zones.find((z: { code: string; id: string }) => z.code === 'ASH-ADMIN');

  if (ashAcad && ashResE && ashResW && ashAdmin) {
    await prisma.zoneAdjacency.createMany({
      data: [
        { zoneId: ashAcad.id, adjacentZoneId: ashResE.id },
        { zoneId: ashAcad.id, adjacentZoneId: ashResW.id },
        { zoneId: ashResE.id, adjacentZoneId: ashAcad.id },
        { zoneId: ashResE.id, adjacentZoneId: ashResW.id },
        { zoneId: ashResW.id, adjacentZoneId: ashAcad.id },
        { zoneId: ashResW.id, adjacentZoneId: ashResE.id },
        { zoneId: ashAdmin.id, adjacentZoneId: ashAcad.id },
        { zoneId: ashAcad.id, adjacentZoneId: ashAdmin.id },
      ],
    });
  }

  // UPSA adjacencies (smaller campus - all zones adjacent)
  const upsaAcad = zones.find((z: { code: string; id: string }) => z.code === 'UPSA-ACAD');
  const upsaRes = zones.find((z: { code: string; id: string }) => z.code === 'UPSA-RES');
  const upsaAdmin = zones.find((z: { code: string; id: string }) => z.code === 'UPSA-ADMIN');

  if (upsaAcad && upsaRes && upsaAdmin) {
    await prisma.zoneAdjacency.createMany({
      data: [
        { zoneId: upsaAcad.id, adjacentZoneId: upsaRes.id },
        { zoneId: upsaAcad.id, adjacentZoneId: upsaAdmin.id },
        { zoneId: upsaRes.id, adjacentZoneId: upsaAcad.id },
        { zoneId: upsaRes.id, adjacentZoneId: upsaAdmin.id },
        { zoneId: upsaAdmin.id, adjacentZoneId: upsaAcad.id },
        { zoneId: upsaAdmin.id, adjacentZoneId: upsaRes.id },
      ],
    });
  }

  // Central University adjacencies
  const cuAcad = zones.find((z: { code: string; id: string }) => z.code === 'CU-ACAD');
  const cuRes = zones.find((z: { code: string; id: string }) => z.code === 'CU-RES');
  const cuAdmin = zones.find((z: { code: string; id: string }) => z.code === 'CU-ADMIN');

  if (cuAcad && cuRes && cuAdmin) {
    await prisma.zoneAdjacency.createMany({
      data: [
        { zoneId: cuAcad.id, adjacentZoneId: cuRes.id },
        { zoneId: cuAcad.id, adjacentZoneId: cuAdmin.id },
        { zoneId: cuRes.id, adjacentZoneId: cuAcad.id },
        { zoneId: cuRes.id, adjacentZoneId: cuAdmin.id },
        { zoneId: cuAdmin.id, adjacentZoneId: cuAcad.id },
        { zoneId: cuAdmin.id, adjacentZoneId: cuRes.id },
      ],
    });
  }

  // Academic City adjacencies
  const acuAcad = zones.find((z: { code: string; id: string }) => z.code === 'ACU-ACAD');
  const acuRes = zones.find((z: { code: string; id: string }) => z.code === 'ACU-RES');

  if (acuAcad && acuRes) {
    await prisma.zoneAdjacency.createMany({
      data: [
        { zoneId: acuAcad.id, adjacentZoneId: acuRes.id },
        { zoneId: acuRes.id, adjacentZoneId: acuAcad.id },
      ],
    });
  }

  // GIJ adjacencies
  const gijAcad = zones.find((z: { code: string; id: string }) => z.code === 'GIJ-ACAD');
  const gijAdmin = zones.find((z: { code: string; id: string }) => z.code === 'GIJ-ADMIN');

  if (gijAcad && gijAdmin) {
    await prisma.zoneAdjacency.createMany({
      data: [
        { zoneId: gijAcad.id, adjacentZoneId: gijAdmin.id },
        { zoneId: gijAdmin.id, adjacentZoneId: gijAcad.id },
      ],
    });
  }

  const campusCount = await prisma.campus.count();
  const zoneCount = await prisma.campusZone.count();
  const adjacencyCount = await prisma.zoneAdjacency.count();

  console.log('\n✅ Database seeded successfully!');
  console.log(`📍 Created ${campusCount} campuses`);
  console.log(`🗺️  Created ${zoneCount} delivery zones`);
  console.log(`🔗 Created ${adjacencyCount} zone adjacency relationships`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
