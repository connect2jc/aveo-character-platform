import { PrismaClient } from '../generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test user
  const passwordHash = await bcrypt.hash('testpassword123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@aveo.ai' },
    update: {},
    create: {
      email: 'test@aveo.ai',
      passwordHash,
      name: 'Test User',
      plan: 'PRO',
      role: 'USER',
      onboardingCompleted: true,
    },
  });

  console.log('Created test user:', user.email);

  // Create admin user
  const adminHash = await bcrypt.hash('adminpassword123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aveo.ai' },
    update: {},
    create: {
      email: 'admin@aveo.ai',
      passwordHash: adminHash,
      name: 'Admin User',
      plan: 'AGENCY',
      role: 'ADMIN',
      onboardingCompleted: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample character
  const character = await prisma.character.upsert({
    where: { id: 'seed-character-001' },
    update: {},
    create: {
      id: 'seed-character-001',
      userId: user.id,
      name: 'Luna',
      age: 24,
      niche: 'personal finance for Gen Z',
      targetAudience: 'Gen Z adults (18-25) who want to build wealth but find traditional finance boring',
      originBackstory: 'Luna grew up watching her parents struggle with money. She taught herself everything about investing and personal finance through YouTube and Reddit. Now she breaks down complex financial concepts into simple, relatable content that her generation actually wants to watch.',
      coreBelief: 'Building wealth should be accessible, fun, and free of gatekeeping.',
      personality: 'Energetic, witty, slightly sarcastic but always warm. Uses humor to make boring topics exciting. Never talks down to her audience. Loves a good pop culture reference.',
      speakingStyle: 'Fast-paced, conversational, uses slang naturally. Starts sentences with "Okay so" or "Real talk". Uses rhetorical questions. Short punchy sentences mixed with longer explanations.',
      imagePrompt: 'Young woman, 24 years old, mixed ethnicity, warm brown skin, curly dark hair, confident smile, casual trendy outfit, soft natural lighting, minimal background',
      visualStyle: 'clean modern minimal',
      voicePrompt: 'Young female voice, energetic, slightly raspy, American accent, fast-paced delivery, warm and approachable',
      antiKeywords: ['synergy', 'leverage', 'disrupt', 'hustle culture', 'grindset'],
      status: 'ACTIVE',
    },
  });

  console.log('Created sample character:', character.name);

  // Create usage tracking
  const month = new Date().toISOString().slice(0, 7);
  await prisma.usageTracking.upsert({
    where: { userId_month: { userId: user.id, month } },
    update: {},
    create: {
      userId: user.id,
      month,
      charactersAllowed: 10,
      videosAllowed: 200,
      charactersCreated: 1,
    },
  });

  console.log('Created usage tracking for', month);

  // Create sample scripts
  const script1 = await prisma.script.create({
    data: {
      characterId: character.id,
      title: 'Why Your Savings Account Is Losing Money',
      hook: 'Your bank is literally stealing from you right now and you probably have no idea.',
      body: 'Okay so here is what is happening. Your savings account is giving you maybe 0.5% interest. But inflation is running at 3-4%. That means every single year, your money is worth less. A hundred dollars today buys you fewer groceries next year. So what do you do instead? You need your money working harder than a savings account.',
      cta: 'Drop a comment if you want me to break down where to actually put your money. Follow for part 2.',
      fullScript: 'Your bank is literally stealing from you right now and you probably have no idea. Okay so here is what is happening. Your savings account is giving you maybe 0.5% interest. But inflation is running at 3-4%. That means every single year, your money is worth less. A hundred dollars today buys you fewer groceries next year. So what do you do instead? You need your money working harder than a savings account. Drop a comment if you want me to break down where to actually put your money. Follow for part 2.',
      emotionalTrigger: 'fear',
      estimatedDurationSeconds: 35,
      targetPlatform: 'TIKTOK',
      wordCount: 95,
      generationMethod: 'AI_GENERATED',
      status: 'APPROVED',
    },
  });

  console.log('Created sample script:', script1.title);

  // Create content calendar
  const calendar = await prisma.contentCalendar.create({
    data: {
      characterId: character.id,
      month,
      strategyNotes: 'Focus on building trust with foundational money concepts. Mix educational content with relatable money struggles.',
      themes: ['Money Myths', 'Investing 101', 'Budget Hacks', 'Real Talk Finance'],
      postsPerDay: 2,
      status: 'ACTIVE',
    },
  });

  console.log('Created sample calendar for', month);

  // Create a few content slots
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    await prisma.contentSlot.create({
      data: {
        calendarId: calendar.id,
        characterId: character.id,
        scheduledDate: date,
        scheduledTime: '09:00',
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        slotNumber: 1,
        contentType: 'SHORT_FORM',
        topic: ['Money myths debunked', 'First investment tips', 'Budget for beginners', 'Credit score secrets', 'Side income ideas'][i],
        hook: ['Did you know...', 'Stop doing this with your money', 'The one thing nobody tells you', 'I wish I knew this at 18', 'This changed everything for me'][i],
        emotionalTrigger: ['curiosity', 'fear', 'inspiration', 'relatability', 'curiosity'][i],
        cta: 'Follow for more money tips',
        platform: 'TIKTOK',
        publishStatus: i === 0 ? 'SCRIPT_READY' : 'SCHEDULED',
        scriptId: i === 0 ? script1.id : undefined,
      },
    });
  }

  console.log('Created 5 sample content slots');

  console.log('\nSeeding complete!');
  console.log('Test user: test@aveo.ai / testpassword123');
  console.log('Admin user: admin@aveo.ai / adminpassword123');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
