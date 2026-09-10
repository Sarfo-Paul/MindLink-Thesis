import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      username: 'Aisha Okafor',
      email: 'user@mindlink.demo',
      password: 'demo1234',
      role: 'USER' as const,
      emergencyContactEnabled: true,
      emergencyContactNumber: '+2348000000001',
      phone: '+2348000000001',
      preferredLanguage: 'en',
    },
    {
      username: 'Mariam Adeyemi',
      email: 'admin@mindlink.demo',
      password: 'demo1234',
      role: 'ADMIN' as const,
      preferredLanguage: 'en',
    },
    {
      username: 'Dr. Ngozi Bello',
      email: 'practitioner@mindlink.demo',
      password: 'demo1234',
      role: 'PRACTITIONER' as const,
      preferredLanguage: 'en',
    },
    {
      username: 'Samir Yusuf',
      email: 'volunteer@mindlink.demo',
      password: 'demo1234',
      role: 'VOLUNTEER' as const,
      preferredLanguage: 'en',
    },
    { username: 'Chiamaka Eze', email: 'chiamaka.eze@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'ig', emergencyContactEnabled: true, emergencyContactNumber: '+2348010001001' },
    { username: 'Kwame Mensah', email: 'kwame.mensah@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Zainab Bello', email: 'zainab.bello@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'ha', emergencyContactEnabled: true, emergencyContactNumber: '+2348010001003' },
    { username: 'Thandiwe Ndlovu', email: 'thandiwe.ndlovu@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Dr. Amara Okeke', email: 'amara.okeke@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Dr. Kofi Adu', email: 'kofi.adu@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Dr. Fatima Sule', email: 'fatima.sule@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'ha' },
    { username: 'Dr. Lindiwe Mbeki', email: 'lindiwe.mbeki@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Adaeze Nwosu', email: 'adaeze.nwosu@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'ig' },
    { username: 'Yusuf Ibrahim', email: 'yusuf.ibrahim@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'ha' },
    { username: 'Nana Owusu', email: 'nana.owusu@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'en' },
    { username: 'Nomsa Dlamini', email: 'nomsa.dlamini@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'en' },
    ...Array.from({ length: 29 }, (_, index) => ({
      username: `MindLink Participant ${String(index + 2).padStart(2, '0')}`,
      email: `participant${index + 2}@mindlink.demo`,
      password: 'demo1234',
      role: 'USER' as const,
      preferredLanguage: index % 3 === 0 ? 'ha' : index % 3 === 1 ? 'yo' : 'en',
      emergencyContactEnabled: index % 4 === 0,
      emergencyContactNumber: index % 4 === 0 ? `+2348000000${String(index + 2).padStart(3, '0')}` : undefined,
    })),
    ...Array.from({ length: 29 }, (_, index) => ({
      username: `Practitioner ${String(index + 2).padStart(2, '0')}`,
      email: `practitioner${index + 2}@mindlink.demo`,
      password: 'demo1234',
      role: 'PRACTITIONER' as const,
      preferredLanguage: index % 2 === 0 ? 'en' : 'fr',
    })),
    ...Array.from({ length: 29 }, (_, index) => ({
      username: `Volunteer Listener ${String(index + 2).padStart(2, '0')}`,
      email: `volunteer${index + 2}@mindlink.demo`,
      password: 'demo1234',
      role: 'VOLUNTEER' as const,
      preferredLanguage: index % 2 === 0 ? 'en' : 'ig',
    })),
  ];

  for (const item of users) {
    const existing = await prisma.user.findUnique({ where: { email: item.email } });
    if (existing) {
      console.log(`Skipping existing user: ${item.email}`);
      continue;
    }

    const passwordHash = await bcrypt.hash(item.password, 10);
    await prisma.user.create({
      data: {
        username: item.username,
        email: item.email,
        passwordHash,
        role: item.role,
        phone: item.phone,
        preferredLanguage: item.preferredLanguage,
        emergencyContactEnabled: item.emergencyContactEnabled ?? false,
        emergencyContactNumber: item.emergencyContactNumber ?? null,
      },
    });

    console.log(`Created demo ${item.role.toLowerCase()}: ${item.email} / demo1234`);
  }

  const patient = await prisma.user.findUnique({ where: { email: 'user@mindlink.demo' } });
  if (patient) {
    const now = new Date();

    const checkins = [
      { mood: 4, sleep: 3, stress: 3, energy: 4, social: 4, source: 'WEB' },
      { mood: 3, sleep: 3, stress: 4, energy: 3, social: 3, source: 'WEB' },
      { mood: 2, sleep: 2, stress: 5, energy: 2, social: 2, source: 'WEB' },
      { mood: 3, sleep: 3, stress: 4, energy: 3, social: 4, source: 'WEB' },
      { mood: 2, sleep: 2, stress: 5, energy: 2, social: 2, source: 'WEB' },
    ];

    for (const c of checkins) {
      await prisma.checkin.create({
        data: {
          userId: patient.id,
          ...c,
          createdAt: new Date(now.getTime() - (checkins.indexOf(c) + 1) * 24 * 60 * 60 * 1000),
        },
      });
    }

    await prisma.riskScore.create({
      data: {
        userId: patient.id,
        dailyScore: 42,
        riskLevel: 'YELLOW',
        confidenceLevel: 'MEDIUM',
        explanation: 'Mood and stress patterns suggest a declining trend over the last few check-ins.',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.supportRequest.create({
      data: {
        userId: patient.id,
        requestType: 'Therapy follow-up',
        status: 'OPEN',
        assignedTo: 'Dr. Ngozi Bello',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.gameSession.createMany({
      data: [
        { userId: patient.id, gameType: 'stroop', score: 72, accuracy: 0.74, duration: 135, mistakes: 2 },
        { userId: patient.id, gameType: 'memory-match', score: 60, accuracy: 0.66, duration: 180, mistakes: 4 },
      ],
    });
  }

  const demoParticipants = await prisma.user.findMany({ where: { role: 'USER' }, orderBy: { email: 'asc' } });
  for (const [index, participant] of demoParticipants.entries()) {
    const existingCheckin = await prisma.checkin.findFirst({ where: { userId: participant.id } });
    if (!existingCheckin) {
      await prisma.checkin.createMany({
        data: [
          { userId: participant.id, mood: 3 + (index % 3), sleep: 3, stress: 2 + (index % 4), energy: 3, social: 3 + (index % 2), source: index % 4 === 0 ? 'USSD' : 'WEB', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { userId: participant.id, mood: 2 + (index % 4), sleep: 2 + (index % 3), stress: 3 + (index % 3), energy: 2 + (index % 3), social: 2 + (index % 3), source: 'WEB', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        ],
      });
    }

    const existingRisk = await prisma.riskScore.findFirst({ where: { userId: participant.id } });
    if (!existingRisk) {
      const riskLevel = index % 7 === 0 ? 'RED' : index % 3 === 0 ? 'YELLOW' : 'GREEN';
      await prisma.riskScore.create({
        data: {
          userId: participant.id,
          dailyScore: riskLevel === 'RED' ? 28 : riskLevel === 'YELLOW' ? 54 : 82,
          riskLevel,
          confidenceLevel: index % 2 === 0 ? 'HIGH' : 'MEDIUM',
          explanation: riskLevel === 'RED' ? 'Sustained stress and reduced energy across recent check-ins.' : riskLevel === 'YELLOW' ? 'Some changes in mood and sleep merit a human follow-up.' : 'Signals remain stable across recent check-ins.',
        },
      });
    }

    if (index % 5 === 0) {
      const existingRequest = await prisma.supportRequest.findFirst({ where: { userId: participant.id } });
      if (!existingRequest) {
        await prisma.supportRequest.create({ data: { userId: participant.id, requestType: 'Wellbeing follow-up', status: index % 10 === 0 ? 'IN_PROGRESS' : 'OPEN' } });
      }
    }
  }

  console.log('Demo seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
