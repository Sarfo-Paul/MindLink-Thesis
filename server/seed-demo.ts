import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: 'Mariam Adeyemi', email: 'admin@mindlink.demo', password: 'demo1234', role: 'ADMIN' as const, preferredLanguage: 'en' },
    { username: 'Aisha Okafor', email: 'user@mindlink.demo', password: 'demo1234', role: 'USER' as const, emergencyContactEnabled: true, emergencyContactNumber: '+2348000000001', phone: '+2348000000001', preferredLanguage: 'en' },
    { username: 'Chiamaka Eze', email: 'chiamaka.eze@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'ig', emergencyContactEnabled: true, emergencyContactNumber: '+2348010001001' },
    { username: 'Kwame Mensah', email: 'kwame.mensah@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Zainab Bello', email: 'zainab.bello@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'ha', emergencyContactEnabled: true, emergencyContactNumber: '+2348010001003' },
    { username: 'Thandiwe Ndlovu', email: 'thandiwe.ndlovu@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Ibrahim Musa', email: 'ibrahim.musa@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002002' },
    { username: 'Grace Abiola', email: 'grace.abiola@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'yo', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002003' },
    { username: 'Daniel Tetteh', email: 'daniel.tetteh@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Ruth Osei', email: 'ruth.osei@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002005' },
    { username: 'Ayo Gbadamosi', email: 'ayo.gbada@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'yo', emergencyContactEnabled: false },
    { username: 'Mercy Kwarteng', email: 'mercy.kwarteng@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002007' },
    { username: 'Tunde Adebayo', email: 'tunde.adebayo@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Nneka Okafor', email: 'nneka.okafor@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'ig', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002009' },
    { username: 'Fatima Ibrahim', email: 'fatima.ibrahim@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'ha', emergencyContactEnabled: false },
    { username: 'Emeka Okoye', email: 'emeka.okoye@mindlink.demo', password: 'demo1234', role: 'USER' as const, preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002011' },
    { username: 'Dr. Ngozi Bello', email: 'practitioner@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Dr. Amara Okeke', email: 'amara.okeke@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Dr. Kofi Adu', email: 'kofi.adu@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Dr. Fatima Sule', email: 'fatima.sule@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'ha' },
    { username: 'Dr. Lindiwe Mbeki', email: 'lindiwe.mbeki@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Dr. Samuel Boateng', email: 'samuel.boateng@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER' as const, preferredLanguage: 'en' },
    { username: 'Samir Yusuf', email: 'volunteer@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'en' },
    { username: 'Adaeze Nwosu', email: 'adaeze.nwosu@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'ig' },
    { username: 'Yusuf Ibrahim', email: 'yusuf.ibrahim@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'ha' },
    { username: 'Nana Owusu', email: 'nana.owusu@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER' as const, preferredLanguage: 'en' },
  ];

  const allowedEmails = new Set(users.map((item) => item.email.toLowerCase()));
  const staleDemoUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@mindlink.demo' } },
    select: { id: true, email: true },
  });

  for (const stale of staleDemoUsers) {
    if (!allowedEmails.has((stale.email ?? '').toLowerCase())) {
      await prisma.user.delete({ where: { id: stale.id } });
    }
  }

  for (const item of users) {
    const existing = await prisma.user.findUnique({ where: { email: item.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: item.email },
        data: {
          username: item.username,
          role: item.role,
          phone: item.phone ?? null,
          preferredLanguage: item.preferredLanguage,
          emergencyContactEnabled: item.emergencyContactEnabled ?? false,
          emergencyContactNumber: item.emergencyContactNumber ?? null,
          passwordHash: await bcrypt.hash(item.password, 10),
        },
      });
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

  const demoParticipants = await prisma.user.findMany({ where: { role: 'USER' }, orderBy: { email: 'asc' } });
  const allActiveUsers = await prisma.user.findMany({
    where: { role: { in: ['USER', 'PRACTITIONER', 'VOLUNTEER'] } },
    orderBy: { email: 'asc' },
  });

  const hashedValue = (value: string) => value.split('').reduce((total, char) => total + char.charCodeAt(0), 0);

  for (const user of allActiveUsers) {
    const existingCheckin = await prisma.checkin.findFirst({ where: { userId: user.id } });
    if (!existingCheckin) {
      const seed = hashedValue(user.email ?? user.username ?? user.id);
      const series = Array.from({ length: 6 }, (_, index) => ({
        userId: user.id,
        mood: 2 + ((seed + index * 5 + (user.role === 'USER' ? 1 : user.role === 'PRACTITIONER' ? 3 : 5)) % 4),
        sleep: 2 + ((seed + index * 7 + (user.role === 'VOLUNTEER' ? 2 : 4)) % 4),
        stress: 2 + ((seed + index * 11 + (user.role === 'USER' ? 2 : user.role === 'PRACTITIONER' ? 6 : 1)) % 4),
        energy: 2 + ((seed + index * 9 + (user.role === 'PRACTITIONER' ? 1 : 5)) % 4),
        social: 2 + ((seed + index * 13 + (user.role === 'VOLUNTEER' ? 3 : 7)) % 4),
        source: index % 2 === 0 ? 'WEB' : 'USSD',
        createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
      }));

      await prisma.checkin.createMany({ data: series });
    }

    const existingRisk = await prisma.riskScore.findFirst({ where: { userId: user.id } });
    if (!existingRisk) {
      const riskOptions = ['GREEN', 'YELLOW', 'RED'] as const;
      const selectedRisk = riskOptions[(hashedValue(user.email ?? user.username ?? user.id) + (user.role === 'USER' ? 0 : user.role === 'PRACTITIONER' ? 1 : 2)) % riskOptions.length];
      const scoreMap = { GREEN: 82, YELLOW: 58, RED: 31 };
      await prisma.riskScore.create({
        data: {
          userId: user.id,
          dailyScore: scoreMap[selectedRisk],
          riskLevel: selectedRisk,
          confidenceLevel: hashedValue(user.email ?? user.username ?? user.id) % 2 === 0 ? 'HIGH' : 'MEDIUM',
          explanation: `${user.username ?? 'Wellbeing member'} has a ${selectedRisk.toLowerCase()} pattern with role-specific support needs and a custom care summary.`,
        },
      });
    }

    const existingRequest = await prisma.supportRequest.findFirst({ where: { userId: user.id } });
    if (!existingRequest && user.role !== 'ADMIN') {
      const requestType = user.role === 'USER' ? 'Wellbeing follow-up' : user.role === 'PRACTITIONER' ? 'Clinical review' : 'Volunteer check-in';
      await prisma.supportRequest.create({
        data: {
          userId: user.id,
          requestType,
          status: user.role === 'USER' ? 'OPEN' : 'IN_PROGRESS',
          assignedTo: user.role === 'USER' ? 'Dr. Ngozi Bello' : user.role === 'PRACTITIONER' ? 'Care coordination team' : 'Volunteer lead',
        },
      });
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
