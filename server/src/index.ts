import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { calculateDailyScore, calculateBaseline, classifyRisk, type BehavioralInput } from './services/triageEngine';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'mindlink-dev-secret-change-in-production';

const corsOrigins = process.env.CORS_ORIGIN?.trim();
const corsOptions: cors.CorsOptions =
  corsOrigins && corsOrigins !== '*'
    ? { origin: corsOrigins.split(',').map((o) => o.trim()).filter(Boolean) }
    : { origin: true };
app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindLink Backend System Running' });
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

// Staff invite codes — in production store these in DB and invalidate after use
const STAFF_INVITE_CODES: Record<string, 'PRACTITIONER' | 'VOLUNTEER'> = {
  'MINDLINK-PRACTITIONER-2024': 'PRACTITIONER',
  'MINDLINK-VOLUNTEER-2024':    'VOLUNTEER',
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, emergencyContactNumber, emergencyContactEnabled, inviteCode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Determine role from invite code
    let role: 'USER' | 'PRACTITIONER' | 'VOLUNTEER' = 'USER';
    if (inviteCode) {
      const mapped = STAFF_INVITE_CODES[inviteCode.trim().toUpperCase()];
      if (!mapped) return res.status(400).json({ error: 'Invalid invite code' });
      role = mapped;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username: username || email.split('@')[0],
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
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
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

// ─── PRACTITIONER ────────────────────────────────────────────────────────────

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
