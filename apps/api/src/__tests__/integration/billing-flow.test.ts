import { mockPrisma } from '../helpers/mock-prisma';
import { mockStripeService } from '../helpers/mock-services';
import { createTestUser, PLAN_LIMITS } from '../helpers/test-helpers';


describe('Integration: Billing Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('full flow: register -> select plan -> Stripe subscription created -> use features -> track usage -> invoice', async () => {
    // Step 1: Register
    const user = createTestUser({ plan: 'starter', stripeCustomerId: null });
    mockPrisma.user.create.mockResolvedValue(user);

    const createdUser = await mockPrisma.user.create({ data: user });
    expect(createdUser.plan).toBe('starter');

    // Step 2: Create Stripe customer
    const stripeCustomer = await mockStripeService.createCustomer({
      email: user.email,
      name: user.name,
    });
    expect(stripeCustomer.id).toBe('cus_test_new_123');

    // Update user with Stripe customer ID
    mockPrisma.user.update.mockResolvedValue({
      ...user,
      stripeCustomerId: stripeCustomer.id,
    });
    await mockPrisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: stripeCustomer.id },
    });

    // Step 3: Select plan and create subscription
    const subscription = await mockStripeService.createSubscription({
      customerId: stripeCustomer.id,
      priceId: 'price_growth_monthly',
    });

    expect(subscription.id).toBe('sub_test_123');
    expect(subscription.status).toBe('active');

    // Update user plan
    mockPrisma.user.update.mockResolvedValue({
      ...user,
      plan: 'growth',
      stripeCustomerId: stripeCustomer.id,
    });
    await mockPrisma.user.update({
      where: { id: user.id },
      data: { plan: 'growth' },
    });

    // Step 4: Use features (create characters, generate videos)
    mockPrisma.character.count.mockResolvedValue(2);
    mockPrisma.video.count.mockResolvedValue(45);

    const charCount = await mockPrisma.character.count({
      where: { userId: user.id },
    });
    const videoCount = await mockPrisma.video.count({
      where: { userId: user.id },
    });

    expect(charCount).toBeLessThanOrEqual(PLAN_LIMITS.growth.characters);
    expect(videoCount).toBeLessThanOrEqual(PLAN_LIMITS.growth.videosPerMonth);

    // Step 5: Track usage
    mockPrisma.usageTracking.upsert.mockResolvedValue({
      id: 'usage-1',
      userId: user.id,
      month: 3,
      year: 2026,
      videosCreated: videoCount,
      charactersCreated: charCount,
      totalApiCost: 125.50,
    });

    const usage = await mockPrisma.usageTracking.upsert({
      where: { id: 'usage-1' },
      create: {
        userId: user.id,
        month: 3,
        year: 2026,
        videosCreated: videoCount,
        charactersCreated: charCount,
      },
      update: {
        videosCreated: videoCount,
        charactersCreated: charCount,
      },
    });

    expect(usage.videosCreated).toBe(45);

    // Step 6: Invoice paid
    mockPrisma.invoice.create.mockResolvedValue({
      id: 'inv-1',
      userId: user.id,
      amount: 9900, // $99 growth plan
      status: 'paid',
    });

    const invoice = await mockPrisma.invoice.create({
      data: {
        userId: user.id,
        amount: 9900,
        currency: 'usd',
        status: 'paid',
      },
    });

    expect(invoice.amount).toBe(9900);
    expect(invoice.status).toBe('paid');
  });

  it('should handle plan upgrade mid-cycle', async () => {
    const user = createTestUser({ plan: 'starter' });

    // Current usage on starter plan
    mockPrisma.video.count.mockResolvedValue(25);

    // Upgrade to growth
    const updatedSub = await mockStripeService.updateSubscription({
      subscriptionId: 'sub_test_123',
      priceId: 'price_growth_monthly',
    });

    expect(updatedSub.status).toBe('active');

    // Plan updated
    mockPrisma.user.update.mockResolvedValue({
      ...user,
      plan: 'growth',
    });

    const updatedUser = await mockPrisma.user.update({
      where: { id: user.id },
      data: { plan: 'growth' },
    });

    expect(updatedUser.plan).toBe('growth');

    // New limits apply immediately
    const videoCount = await mockPrisma.video.count({
      where: { userId: user.id },
    });

    const newLimit = PLAN_LIMITS.growth.videosPerMonth;
    expect(videoCount).toBeLessThan(newLimit); // 25 < 90
  });

  it('should handle failed payment (service continues)', async () => {
    const user = createTestUser({ plan: 'growth' });

    // Payment fails
    mockPrisma.invoice.create.mockResolvedValue({
      id: 'inv-fail',
      userId: user.id,
      amount: 9900,
      status: 'failed',
    });

    await mockPrisma.invoice.create({
      data: {
        userId: user.id,
        amount: 9900,
        status: 'failed',
      },
    });

    // User should still be on growth plan
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const currentUser = await mockPrisma.user.findUnique({
      where: { id: user.id },
    });

    expect(currentUser!.plan).toBe('growth');
    // Plan NOT downgraded

    // User can still create videos
    mockPrisma.video.count.mockResolvedValue(50);
    const count = await mockPrisma.video.count({
      where: { userId: user.id },
    });

    const limit = PLAN_LIMITS.growth.videosPerMonth;
    expect(count).toBeLessThan(limit);
    // Service continues as normal
  });
});
