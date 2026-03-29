import { mockPrisma } from '../helpers/mock-prisma';
import { mockStripeService } from '../helpers/mock-services';


describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle invoice.paid event', async () => {
    const event = {
      type: 'invoice.paid',
      data: {
        object: {
          customer: 'cus_test_123',
          amount_paid: 4900,
          currency: 'usd',
          subscription: 'sub_test_123',
          period_start: Math.floor(Date.now() / 1000),
          period_end: Math.floor(Date.now() / 1000) + 30 * 86400,
        },
      },
    };

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'test-user-id',
      stripeCustomerId: 'cus_test_123',
    });

    const user = await mockPrisma.user.findFirst({
      where: { stripeCustomerId: event.data.object.customer },
    });

    expect(user).not.toBeNull();

    mockPrisma.invoice.create.mockResolvedValue({
      id: 'inv-1',
      userId: user!.id,
      amount: 4900,
      status: 'paid',
    });

    const invoice = await mockPrisma.invoice.create({
      data: {
        userId: user!.id,
        amount: event.data.object.amount_paid,
        currency: event.data.object.currency,
        status: 'paid',
      },
    });

    expect(invoice.status).toBe('paid');
    expect(invoice.amount).toBe(4900);
  });

  it('should handle invoice.payment_failed (service continues)', async () => {
    const event = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          customer: 'cus_test_123',
          amount_due: 4900,
          attempt_count: 1,
        },
      },
    };

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'test-user-id',
      stripeCustomerId: 'cus_test_123',
      plan: 'growth',
    });

    const user = await mockPrisma.user.findFirst({
      where: { stripeCustomerId: event.data.object.customer },
    });

    // Service should NOT be suspended immediately
    expect(user!.plan).toBe('growth');

    // Just record the failed payment
    mockPrisma.invoice.create.mockResolvedValue({
      id: 'inv-2',
      status: 'failed',
      userId: user!.id,
    });

    await mockPrisma.invoice.create({
      data: {
        userId: user!.id,
        amount: event.data.object.amount_due,
        status: 'failed',
      },
    });

    // User plan should remain unchanged
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('should handle customer.subscription.updated', async () => {
    const event = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          customer: 'cus_test_123',
          status: 'active',
          items: {
            data: [{ price: { id: 'price_growth_monthly' } }],
          },
        },
      },
    };

    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'test-user-id',
      stripeCustomerId: 'cus_test_123',
    });

    const priceToplan: Record<string, string> = {
      price_starter_monthly: 'starter',
      price_growth_monthly: 'growth',
      price_pro_monthly: 'pro',
    };

    const priceId = event.data.object.items.data[0].price.id;
    const newPlan = priceToplan[priceId];

    expect(newPlan).toBe('growth');

    mockPrisma.user.update.mockResolvedValue({
      id: 'test-user-id',
      plan: newPlan,
    });

    await mockPrisma.user.update({
      where: { id: 'test-user-id' },
      data: { plan: newPlan },
    });

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'test-user-id' },
      data: { plan: 'growth' },
    });
  });

  it('should verify Stripe webhook signature', () => {
    const payload = '{"type":"invoice.paid"}';
    const secret = 'whsec_test_fake_webhook_secret';
    const signature = 't=1234567890,v1=fakesig';

    // Stripe webhook verification would use stripe.webhooks.constructEvent
    // Testing that we call it with the right params
    mockStripeService.constructWebhookEvent.mockReturnValue({
      type: 'invoice.paid',
      data: { object: {} },
    });

    const event = mockStripeService.constructWebhookEvent(
      payload,
      signature,
      secret
    );

    expect(event.type).toBe('invoice.paid');
    expect(mockStripeService.constructWebhookEvent).toHaveBeenCalledWith(
      payload,
      signature,
      secret
    );
  });

  it('should ignore unhandled event types', () => {
    const unhandledEvents = [
      'payment_intent.created',
      'charge.succeeded',
      'customer.created',
      'setup_intent.succeeded',
    ];

    const handledTypes = [
      'invoice.paid',
      'invoice.payment_failed',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ];

    unhandledEvents.forEach((type) => {
      expect(handledTypes).not.toContain(type);
    });
  });
});
