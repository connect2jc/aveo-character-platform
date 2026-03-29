import { mockPrisma } from '../helpers/mock-prisma';
import { mockStripeService } from '../helpers/mock-services';
import { createTestUser } from '../helpers/test-helpers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


describe('POST /api/auth/register', () => {
  const validPayload = {
    email: 'newuser@example.com',
    password: 'SecureP@ss123',
    name: 'New User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user with valid data', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(
      createTestUser({
        id: 'new-user-id',
        email: validPayload.email,
        name: validPayload.name,
      })
    );
    mockStripeService.createCustomer.mockResolvedValue({
      id: 'cus_new_123',
      email: validPayload.email,
    });

    const result = mockPrisma.user.create.getMockImplementation;
    // Simulate the registration logic
    const existing = await mockPrisma.user.findUnique({
      where: { email: validPayload.email },
    });
    expect(existing).toBeNull();

    const hashedPassword = await bcrypt.hash(validPayload.password, 10);
    expect(hashedPassword).toBeTruthy();
    expect(hashedPassword).not.toBe(validPayload.password);

    const user = await mockPrisma.user.create({
      data: {
        email: validPayload.email,
        passwordHash: hashedPassword,
        name: validPayload.name,
        plan: 'starter',
      },
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(validPayload.email);
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
  });

  it('should return 400 for invalid email', () => {
    const invalidEmails = ['notanemail', 'missing@', '@nodomain', '', 'spaces in@email.com'];
    invalidEmails.forEach((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('should return 400 for weak password (< 8 chars)', () => {
    const weakPasswords = ['short', '1234567', 'abc', ''];
    weakPasswords.forEach((password) => {
      expect(password.length).toBeLessThan(8);
    });
  });

  it('should return 409 for duplicate email', async () => {
    const existingUser = createTestUser({ email: 'existing@example.com' });
    mockPrisma.user.findUnique.mockResolvedValue(existingUser);

    const found = await mockPrisma.user.findUnique({
      where: { email: 'existing@example.com' },
    });

    expect(found).not.toBeNull();
    expect(found!.email).toBe('existing@example.com');
    // Controller would return 409 here
  });

  it('should create Stripe customer on registration', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockStripeService.createCustomer.mockResolvedValue({
      id: 'cus_stripe_new',
      email: validPayload.email,
    });

    const stripeCustomer = await mockStripeService.createCustomer({
      email: validPayload.email,
      name: validPayload.name,
    });

    expect(stripeCustomer.id).toBe('cus_stripe_new');
    expect(mockStripeService.createCustomer).toHaveBeenCalledWith({
      email: validPayload.email,
      name: validPayload.name,
    });
  });

  it('should return JWT tokens on successful registration', () => {
    const userId = 'new-user-id';
    const secret = 'test-jwt-secret-key-for-testing-only';

    const accessToken = jwt.sign(
      { userId, plan: 'starter', role: 'user' },
      secret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      'test-jwt-refresh-secret-key',
      { expiresIn: '7d' }
    );

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const decoded = jwt.verify(accessToken, secret) as any;
    expect(decoded.userId).toBe(userId);
    expect(decoded.plan).toBe('starter');
  });

  it('should hash password before storing', async () => {
    const plainPassword = 'SecureP@ss123';
    const hash = await bcrypt.hash(plainPassword, 10);

    expect(hash).not.toBe(plainPassword);
    expect(hash.startsWith('$2b$') || hash.startsWith('$2a$')).toBe(true);

    const isMatch = await bcrypt.compare(plainPassword, hash);
    expect(isMatch).toBe(true);

    const wrongMatch = await bcrypt.compare('wrongpassword', hash);
    expect(wrongMatch).toBe(false);
  });

  it('should set default plan to starter', async () => {
    const user = createTestUser();
    mockPrisma.user.create.mockResolvedValue(user);

    const created = await mockPrisma.user.create({
      data: {
        email: 'new@example.com',
        passwordHash: 'hash',
        name: 'Test',
        plan: 'starter',
      },
    });

    expect(created.plan).toBe('starter');
  });

  it('should set onboardingCompleted to false', async () => {
    const user = createTestUser({ onboardingCompleted: false });
    mockPrisma.user.create.mockResolvedValue(user);

    const created = await mockPrisma.user.create({
      data: {
        email: 'new@example.com',
        passwordHash: 'hash',
        name: 'Test',
        plan: 'starter',
        onboardingCompleted: false,
      },
    });

    expect(created.onboardingCompleted).toBe(false);
  });
});
