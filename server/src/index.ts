import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import OpenAI from 'openai';
import { prisma } from './prisma';
import { calculateDailyScore, calculateBaseline, classifyRisk, type BehavioralInput } from './services/triageEngine';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'mindlink-dev-secret-change-in-production';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

const openai = OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
        'X-Title': 'MindLink',
      },
    })
  : null;

if (!OPENROUTER_API_KEY) {
  console.warn('OPENROUTER_API_KEY is not set — /api/chat/ai will return fallback responses only.');
}

function normalizeEmail(value?: string): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

async function ensureDemoUsers() {
  type DemoUser = {
    username: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN' | 'PRACTITIONER' | 'VOLUNTEER';
    preferredLanguage: string;
    emergencyContactEnabled?: boolean;
    emergencyContactNumber?: string | null;
    phone?: string | null;
  };

  const demoUsers: DemoUser[] = [
    { username: 'Mariam Adeyemi', email: 'admin@mindlink.demo', password: 'demo1234', role: 'ADMIN', preferredLanguage: 'en' },
    { username: 'Aisha Okafor', email: 'user@mindlink.demo', password: 'demo1234', role: 'USER', emergencyContactEnabled: true, emergencyContactNumber: '+2348000000001', phone: '+2348000000001', preferredLanguage: 'en' },
    { username: 'Chiamaka Eze', email: 'chiamaka.eze@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'ig', emergencyContactEnabled: true, emergencyContactNumber: '+2348010001001' },
    { username: 'Kwame Mensah', email: 'kwame.mensah@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Zainab Bello', email: 'zainab.bello@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'ha', emergencyContactEnabled: true, emergencyContactNumber: '+2348010001003' },
    { username: 'Thandiwe Ndlovu', email: 'thandiwe.ndlovu@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Ibrahim Musa', email: 'ibrahim.musa@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002002' },
    { username: 'Grace Abiola', email: 'grace.abiola@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'yo', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002003' },
    { username: 'Daniel Tetteh', email: 'daniel.tetteh@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Ruth Osei', email: 'ruth.osei@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002005' },
    { username: 'Ayo Gbadamosi', email: 'ayo.gbada@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'yo', emergencyContactEnabled: false },
    { username: 'Mercy Kwarteng', email: 'mercy.kwarteng@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002007' },
    { username: 'Tunde Adebayo', email: 'tunde.adebayo@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: false },
    { username: 'Nneka Okafor', email: 'nneka.okafor@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'ig', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002009' },
    { username: 'Fatima Ibrahim', email: 'fatima.ibrahim@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'ha', emergencyContactEnabled: false },
    { username: 'Emeka Okoye', email: 'emeka.okoye@mindlink.demo', password: 'demo1234', role: 'USER', preferredLanguage: 'en', emergencyContactEnabled: true, emergencyContactNumber: '+2348020002011' },
    { username: 'Dr. Ngozi Bello', email: 'practitioner@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER', preferredLanguage: 'en' },
    { username: 'Dr. Amara Okeke', email: 'amara.okeke@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER', preferredLanguage: 'en' },
    { username: 'Dr. Kofi Adu', email: 'kofi.adu@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER', preferredLanguage: 'en' },
    { username: 'Dr. Fatima Sule', email: 'fatima.sule@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER', preferredLanguage: 'ha' },
    { username: 'Dr. Lindiwe Mbeki', email: 'lindiwe.mbeki@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER', preferredLanguage: 'en' },
    { username: 'Dr. Samuel Boateng', email: 'samuel.boateng@mindlink.demo', password: 'demo1234', role: 'PRACTITIONER', preferredLanguage: 'en' },
    { username: 'Samir Yusuf', email: 'volunteer@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER', preferredLanguage: 'en' },
    { username: 'Adaeze Nwosu', email: 'adaeze.nwosu@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER', preferredLanguage: 'ig' },
    { username: 'Yusuf Ibrahim', email: 'yusuf.ibrahim@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER', preferredLanguage: 'ha' },
    { username: 'Nana Owusu', email: 'nana.owusu@mindlink.demo', password: 'demo1234', role: 'VOLUNTEER', preferredLanguage: 'en' },
  ];

  const allowedEmails = new Set(demoUsers.map((item) => normalizeEmail(item.email)).filter((value): value is string => Boolean(value)));
  const staleDemoUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@mindlink.demo' } },
    select: { id: true, email: true },
  });

  for (const stale of staleDemoUsers) {
    const staleEmail = stale.email ?? '';
    if (!allowedEmails.has(staleEmail)) {
      await prisma.user.delete({ where: { id: stale.id } });
    }
  }

  for (const item of demoUsers) {
    const email = normalizeEmail(item.email);
    if (!email) continue;

    const passwordHash = await bcrypt.hash(item.password, 10);
    await prisma.user.upsert({
      where: { email },
      update: {
        username: item.username,
        passwordHash,
        role: item.role,
        phone: item.phone ?? null,
        preferredLanguage: item.preferredLanguage,
        emergencyContactEnabled: item.emergencyContactEnabled ?? false,
        emergencyContactNumber: item.emergencyContactNumber ?? null,
      },
      create: {
        username: item.username,
        email,
        passwordHash,
        role: item.role,
        phone: item.phone ?? null,
        preferredLanguage: item.preferredLanguage,
        emergencyContactEnabled: item.emergencyContactEnabled ?? false,
        emergencyContactNumber: item.emergencyContactNumber ?? null,
      },
    });
  }
}

async function seedUniqueWellbeingHistory() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['USER', 'PRACTITIONER', 'VOLUNTEER'] } },
    select: { id: true, email: true, role: true },
  });

  for (const user of users) {
    const hasCheckins = await prisma.checkin.findFirst({ where: { userId: user.id } });
    if (hasCheckins) continue;

    const seed = user.email?.split('').reduce((total, char) => total + char.charCodeAt(0), 0) ?? 0;
    const moodBase = 2 + ((seed + 3) % 4);
    const stressBase = 2 + ((seed + 5) % 4);
    const sleepBase = 2 + ((seed + 9) % 4);
    const energyBase = 2 + ((seed + 7) % 4);
    const socialBase = 2 + ((seed + 11) % 4);

    const checkins = Array.from({ length: 6 }, (_, dayIndex) => ({
      userId: user.id,
      mood: Math.min(5, Math.max(1, moodBase + ((seed + dayIndex * 3) % 3) - 1)),
      sleep: Math.min(5, Math.max(1, sleepBase + ((seed + dayIndex * 5) % 3) - 1)),
      stress: Math.min(5, Math.max(1, stressBase + ((seed + dayIndex * 7) % 4) - 2)),
      energy: Math.min(5, Math.max(1, energyBase + ((seed + dayIndex * 2) % 3) - 1)),
      social: Math.min(5, Math.max(1, socialBase + ((seed + dayIndex * 4) % 3) - 1)),
      source: dayIndex % 2 === 0 ? 'WEB' : 'USSD',
      createdAt: new Date(Date.now() - (dayIndex + 1) * 24 * 60 * 60 * 1000),
    }));

    await prisma.checkin.createMany({ data: checkins });

    const riskLevels = ['GREEN', 'YELLOW', 'RED'] as const;
    const riskLevel = riskLevels[(seed + (user.role === 'USER' ? 0 : user.role === 'PRACTITIONER' ? 1 : 2)) % riskLevels.length];
    const dailyScore = riskLevel === 'GREEN' ? 82 + (seed % 9) : riskLevel === 'YELLOW' ? 58 + (seed % 12) : 32 + (seed % 10);

    const hasRisk = await prisma.riskScore.findFirst({ where: { userId: user.id } });
    if (!hasRisk) {
      await prisma.riskScore.create({
        data: {
          userId: user.id,
          dailyScore,
          riskLevel,
          confidenceLevel: seed % 2 === 0 ? 'HIGH' : 'MEDIUM',
          explanation: `${user.role} wellbeing pattern for ${user.email ?? 'this member'} indicates ${(riskLevel === 'RED' ? 'priority support' : riskLevel === 'YELLOW' ? 'monitoring support' : 'stable momentum')}.`,
        },
      });
    }

    const hasRequest = await prisma.supportRequest.findFirst({ where: { userId: user.id } });
    if (!hasRequest && user.role !== 'ADMIN') {
      await prisma.supportRequest.create({
        data: {
          userId: user.id,
          requestType: user.role === 'USER' ? 'Wellbeing follow-up' : 'Care coordination check-in',
          assignedTo: user.role === 'USER' ? 'Dr. Ngozi Bello' : 'MindLink support team',
          status: riskLevel === 'RED' ? 'IN_PROGRESS' : 'OPEN',
        },
      });
    }
  }
}

const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isLocalOrigin = (origin: string) => /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsOrigins.includes(origin) || isLocalOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

ensureDemoUsers().catch((error) => {
  console.error('Demo user bootstrap failed:', error);
});

seedUniqueWellbeingHistory().catch((error) => {
  console.error('Unique wellness history bootstrapping failed:', error);
});

app.get('/', (_req, res) => {
  res.json({ service: 'MindLink API', status: 'ok', health: '/health' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindLink Backend System Running' });
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

// Staff invite codes — in production store these in DB and invalidate after use
const STAFF_INVITE_CODES: Record<string, 'PRACTITIONER' | 'VOLUNTEER' | 'ADMIN'> = {
  'MINDLINK-PRACTITIONER-2024': 'PRACTITIONER',
  'MINDLINK-VOLUNTEER-2024':    'VOLUNTEER',
  'MINDLINK-ADMIN-2024':         'ADMIN',
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, emergencyContactNumber, emergencyContactEnabled, inviteCode } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Determine role from invite code
    let role: 'USER' | 'PRACTITIONER' | 'VOLUNTEER' | 'ADMIN' = 'USER';
    if (inviteCode) {
      const mapped = STAFF_INVITE_CODES[inviteCode.trim().toUpperCase()];
      if (!mapped) return res.status(400).json({ error: 'Invalid invite code' });
      role = mapped;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: username || normalizedEmail.split('@')[0],
        passwordHash,
        role,
        emergencyContactNumber: emergencyContactNumber || null,
        emergencyContactEnabled: !!emergencyContactEnabled
      }
    });
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const returnedUser = { 
      userId: user.id, username: user.username, email: user.email, role: user.role,
      phone: user.phone, preferredLanguage: user.preferredLanguage, 
      emergencyContactEnabled: user.emergencyContactEnabled, emergencyContactNumber: user.emergencyContactNumber
    };
    return res.status(201).json({ token, user: returnedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const returnedUser = { 
      userId: user.id, username: user.username, email: user.email, role: user.role,
      phone: user.phone, preferredLanguage: user.preferredLanguage, 
      emergencyContactEnabled: user.emergencyContactEnabled, emergencyContactNumber: user.emergencyContactNumber
    };
    return res.json({ token, user: returnedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ─── JWT MIDDLEWARE ──────────────────────────────────────────────────────────
function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorised' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

// ─── USER PROFILE ────────────────────────────────────────────────────────────

app.put('/api/user/profile', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { username, phone, preferredLanguage, emergencyContactNumber, emergencyContactEnabled } = req.body;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username !== undefined ? username : undefined,
        phone: phone !== undefined ? phone : undefined,
        preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
        emergencyContactNumber: emergencyContactNumber !== undefined ? emergencyContactNumber : undefined,
        emergencyContactEnabled: emergencyContactEnabled !== undefined ? !!emergencyContactEnabled : undefined
      }
    });
    
    const returnedUser = { 
      userId: user.id, username: user.username, email: user.email, role: user.role,
      phone: user.phone, preferredLanguage: user.preferredLanguage, 
      emergencyContactEnabled: user.emergencyContactEnabled, emergencyContactNumber: user.emergencyContactNumber
    };
    return res.json({ success: true, user: returnedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── CHECKINS ────────────────────────────────────────────────────────────────

app.get('/api/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await prisma.checkin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user history' });
  }
});

app.post('/api/checkins', async (req, res) => {
  try {
    const { userId, mood, sleep, stress, energy, social, source } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const checkin = await prisma.checkin.create({
      data: { userId, mood, sleep, stress, energy, social, source }
    });

    const currentScore = calculateDailyScore({ mood, sleep, stress, energy, social });

    // Widen window to 10 for reliable trend detection (up to 9 prior data points)
    const pastCheckins = await prisma.checkin.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const historyScores = pastCheckins.map(c => calculateDailyScore({
      mood: c.mood, sleep: c.sleep, stress: c.stress, energy: c.energy, social: c.social
    }));

    const recentGames = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 2
    });

    // --- Behavioral signal computation ---
    // pastCheckins[0] is the check-in just created; [1] is the previous one.
    let behavioralInput: BehavioralInput | undefined;
    if (pastCheckins.length >= 2) {
      const prevCheckinDate = new Date(pastCheckins[1].createdAt);
      const now = new Date();
      const daysSinceLastCheckin = Math.floor(
        (now.getTime() - prevCheckinDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Count calendar days in the last 7 days that had no check-in
      const checkinDays = new Set(
        pastCheckins.map(c => new Date(c.createdAt).toISOString().split('T')[0])
      );
      let missedDaysInLastWeek = 0;
      for (let i = 1; i <= 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        if (!checkinDays.has(d.toISOString().split('T')[0])) missedDaysInLastWeek++;
      }

      behavioralInput = { daysSinceLastCheckin, missedDaysInLastWeek };
    }

    // Calculate final risk including game, trend, and behavioral signals
    const baseline = calculateBaseline(historyScores.slice(1));
    const risk = classifyRisk(currentScore, historyScores.slice(1), baseline, recentGames, behavioralInput);

    const riskScoreRecord = await prisma.riskScore.create({
      data: {
        userId,
        dailyScore: currentScore,
        riskLevel: risk.level,
        confidenceLevel: risk.confidenceLevel,
        explanation: risk.explanation
      }
    });

    return res.json({ message: 'Checkin recorded', checkin, assessment: riskScoreRecord });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save checkin' });
  }
});

// ─── GAMES ───────────────────────────────────────────────────────────────────

app.post('/api/games', async (req, res) => {
  try {
    const { userId, gameType, score, accuracy, duration, mistakes } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const gameSession = await prisma.gameSession.create({
      data: { userId, gameType, score, accuracy, duration, mistakes: mistakes ?? null }
    });
    return res.json({ success: true, gameSession });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record game session' });
  }
});

app.get('/api/games/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, gameType: true, score: true, accuracy: true, duration: true, createdAt: true }
    });
    return res.json({ sessions });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch game sessions' });
  }
});

// ─── CHATBOT ─────────────────────────────────────────────────────────────────

const NEGATIVE_KEYWORDS = ['sad', 'hopeless', 'stressed', 'anxious', 'overwhelmed', 'depressed', 'scared', 'alone', 'worthless', 'tired'];

app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const lc = (message || '').toLowerCase();
    const flagged = NEGATIVE_KEYWORDS.filter(kw => lc.includes(kw));
    const isFlagged = flagged.length > 0;

    let recentRisk = 'GREEN';
    if (userId) {
      const latest = await prisma.riskScore.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      recentRisk = latest?.riskLevel || 'GREEN';

      await prisma.chatbotLog.create({
        data: {
          userId,
          message,
          sentimentScore: isFlagged ? -0.5 : 0.2,
          flaggedKeywords: flagged.length ? flagged.join(',') : null
        }
      });
    }

    let reply: string;
    if (recentRisk === 'RED' && isFlagged) {
      reply = "I hear you. It sounds like this has been difficult for several days. Would you like me to connect you to someone from our support team right now?";
    } else if (recentRisk === 'YELLOW' || isFlagged) {
      reply = "Thank you for sharing that. It takes courage to put feelings into words. If things feel heavy, our support volunteers are always here — would you like to reach one?";
    } else {
      reply = "Thank you for sharing. What's one small thing that has felt manageable today?";
    }

    return res.json({ message: reply, flagged: isFlagged, riskContext: recentRisk });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Chat failed' });
  }
});

app.post('/api/chat/ai', async (req, res) => {
  try {
    const { messages, model } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required.' });
    }

    if (!openai) {
      return res.json({
        message: 'I’m your MindLink wellbeing companion. I can help you reflect on your mood, suggest a quick check-in, guide you to the journal, and connect you to support options in the app. Add OPENROUTER_API_KEY to the server environment to enable full AI responses.',
        fallback: true,
      });
    }

    type ChatMessageInput = {
      role: 'user' | 'assistant' | 'system';
      content: string;
    };

    const completion = await openai.chat.completions.create({
      model: model || OPENROUTER_MODEL,
      messages: messages.map((msg: ChatMessageInput) => ({
        role: msg.role,
        content: String(msg.content ?? ''),
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({ error: 'No response returned by the AI provider.' });
    }

    return res.json({ message: reply });
  } catch (error) {
    console.error('AI chat endpoint failed:', error);
    return res.status(502).json({
      error: 'AI service is unavailable right now.',
      message: 'I’m here to help. The AI service is temporarily unavailable, so please try again in a moment.',
    });
  }
});

// ─── PRACTITIONER ────────────────────────────────────────────────────────────

app.get('/api/admin/overview', requireAuth, requireRole('ADMIN'), async (_req, res) => {
  try {
    const [totalUsers, totalPractitioners, totalVolunteers, openRequests, checkinsToday, riskScores, allUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'PRACTITIONER' } }),
      prisma.user.count({ where: { role: 'VOLUNTEER' } }),
      prisma.supportRequest.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.checkin.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      prisma.riskScore.findMany({ orderBy: { createdAt: 'desc' }, distinct: ['userId'], select: { riskLevel: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          preferredLanguage: true,
          createdAt: true,
          emergencyContactEnabled: true,
          emergencyContactNumber: true,
          phone: true,
        },
      }),
    ]);

    const recentUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: { id: true, username: true, email: true, preferredLanguage: true, createdAt: true, emergencyContactEnabled: true },
    });

    const riskDistribution = riskScores.reduce<Record<string, number>>((counts, item) => {
      counts[item.riskLevel] = (counts[item.riskLevel] || 0) + 1;
      return counts;
    }, { GREEN: 0, YELLOW: 0, RED: 0 });

    const priorityAlerts = [
      { severity: 'High', title: 'Escalation queue', detail: `${Math.max(openRequests, 0)} active support cases need attention today.` },
      { severity: 'Medium', title: 'Low-check-in streak', detail: 'Follow-up is recommended for participants with missed check-ins this week.' },
      { severity: 'Low', title: 'Volunteer load', detail: `${totalVolunteers} volunteers are available to cover care outreach and follow-up.` },
    ];

    const staffRoster = [
      { name: 'Dr. Ngozi Bello', role: 'Lead practitioner', status: 'Available' },
      { name: 'Dr. Amara Okeke', role: 'Clinical reviewer', status: 'On call' },
      { name: 'Dr. Kofi Adu', role: 'Support clinician', status: 'Reviewing' },
      { name: 'Samir Yusuf', role: 'Volunteer lead', status: 'Available' },
    ];

    return res.json({
      metrics: { totalUsers, totalPractitioners, totalVolunteers, openRequests, checkinsToday },
      riskDistribution,
      recentUsers,
      allUsers,
      analytics: {
        totalAccounts: allUsers.length,
        activeEmergencyContacts: allUsers.filter((user) => user.emergencyContactEnabled).length,
        totalAdmins: allUsers.filter((user) => user.role === 'ADMIN').length,
      },
      methodology: {
        title: 'Explainable triage monitoring',
        body: 'Risk levels combine self-reported wellbeing, longitudinal trends, cognitive game signals and missed check-ins. They support human review; they are not a diagnosis.',
      },
      priorityAlerts,
      staffRoster,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load admin overview' });
  }
});

app.get('/api/practitioner/queue', requireAuth, requireRole('PRACTITIONER', 'VOLUNTEER'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' }, // Only show patients, never staff accounts
      include: {
        riskScores: { orderBy: { createdAt: 'desc' }, take: 1 },
        supportRequests: { where: { status: 'OPEN' } },
        checkins: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    const queue = users.map(u => ({
      userId: u.id,
      username: u.username || 'Anonymous',
      latestRisk: u.riskScores[0]?.riskLevel || 'GREEN',
      dailyScore: u.riskScores[0]?.dailyScore || 100,
      explanation: u.riskScores[0]?.explanation || '',
      openRequests: u.supportRequests.length,
      checkinCount: u.checkins.length,
      lastCheckin: u.riskScores[0]?.createdAt || u.createdAt,
      hasEmergencyContact: u.emergencyContactEnabled,
      emergencyContact: u.emergencyContactEnabled ? u.emergencyContactNumber : null
    }));

    const riskWeight: Record<string, number> = { RED: 3, YELLOW: 2, GREEN: 1 };
    const sorted = queue.sort((a, b) => {
      const wA = riskWeight[a.latestRisk] || 1;
      const wB = riskWeight[b.latestRisk] || 1;
      if (wA !== wB) return wB - wA;
      return b.openRequests - a.openRequests;
    });
    return res.json({ queue: sorted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch practitioner queue' });
  }
});

app.post('/api/practitioner/assign', requireAuth, requireRole('PRACTITIONER', 'VOLUNTEER'), async (req, res) => {
  try {
    const { patientId, assignedTo } = req.body;
    if (!patientId || !assignedTo) return res.status(400).json({ error: 'patientId and assignedTo are required' });
    
    // Assign any open requests, or create a tracked case if none exist
    const openReqs = await prisma.supportRequest.findMany({ where: { userId: patientId, status: 'OPEN' } });
    if (openReqs.length === 0) {
      await prisma.supportRequest.create({ 
        data: { userId: patientId, requestType: 'Triage Assignment', assignedTo, status: 'IN_PROGRESS' }
      });
    } else {
      await prisma.supportRequest.updateMany({ 
        where: { userId: patientId, status: 'OPEN' }, 
        data: { assignedTo, status: 'IN_PROGRESS' } 
      });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign case' });
  }
});

app.post('/api/practitioner/resolve', requireAuth, requireRole('PRACTITIONER', 'VOLUNTEER'), async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });
    
    await prisma.supportRequest.updateMany({ 
      where: { userId: patientId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      data: { status: 'RESOLVED' } 
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resolve case' });
  }
});

// ─── USER SUPPORT REQUESTS ───────────────────────────────────────────────────

// ─── PROFESSIONALS DIRECTORY ─────────────────────────────────────────────────

app.get('/api/professionals', async (req, res) => {
  try {
    const professionals = await prisma.user.findMany({
      where: { role: { in: ['PRACTITIONER', 'VOLUNTEER'] } },
      select: {
        id: true,
        username: true,
        role: true,
        preferredLanguage: true,
        phone: true,
      }
    });

    const mapped = professionals.map(p => ({
      id: p.id,
      name: p.username || 'Anonymous',
      role: p.role === 'PRACTITIONER' ? 'counselor' : 'volunteer',
      bio: p.role === 'PRACTITIONER'
        ? 'Registered MindLink practitioner available for guided support and mental health consultations.'
        : 'Trained MindLink volunteer listener here to provide a compassionate ear and peer support.',
      specialties: p.role === 'PRACTITIONER' ? ['Mental Health Assessment', 'Guided Support'] : ['Active Listening', 'Peer Support'],
      languages: p.preferredLanguage ? [p.preferredLanguage] : ['English'],
      rating: null,
      reviewCount: 0,
      isVerified: true,
    }));

    return res.json({ professionals: mapped });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch professionals' });
  }
});

app.post('/api/support', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { requestType } = req.body;
    
    const request = await prisma.supportRequest.create({
      data: { userId, requestType: requestType || 'Priority Support' }
    });
    return res.json({ success: true, request });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit support request' });
  }
});

app.listen(port, () => {
  console.log(`MindLink server running on port ${port}`);
});
