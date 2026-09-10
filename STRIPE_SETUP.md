# Stripe Integration Setup Guide

This document explains how to set up Stripe payments for the Pro subscription plan.

## Overview

The Stripe integration is now fully implemented in Django backend without any external dependencies like Supabase. All payment processing, subscription management, and webhook handling is done through Django.

## Files Created/Modified

### Backend Files Created:
- `backend/subscriptions/stripe_config.py` - Stripe configuration and constants
- `backend/subscriptions/stripe_views.py` - Stripe API endpoints (checkout, webhook handling)
- `backend/famee/settings_stripe.py` - Stripe settings configuration

### Backend Files Modified:
- `backend/subscriptions/urls.py` - Added Stripe endpoint routes
- `backend/famee/settings.py` - Imported Stripe configuration
- `backend/requirements.txt` - Added `stripe==8.0.0` dependency

### Frontend Files Modified:
- `src/lib/api/subscriptions.ts` - Added Stripe API client methods
- `src/hooks/useStripeCheckout.ts` - Updated to use Django API instead of Supabase
- `src/pages/Subscription.tsx` - Dynamic subscription page with real data
- `src/pages/Pricing.tsx` - Integrated checkout flow

### Deleted Files:
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `src/lib/supabase.ts`

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables

Add these to your Django environment (`.env` file or server environment):

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important:** You already have the Stripe secret key configured. The webhook secret will be generated when you set up the webhook endpoint.

### 3. Update Stripe Product Price ID

The Pro plan price ID is currently set to `price_1RZI8uFpmbUcChP2Wz1C84e3` in `backend/subscriptions/stripe_config.py`.

If you need to change it, update the `PRO_PLAN_PRICE_ID` constant in that file.

### 4. Set Up Stripe Webhook

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/api/subscriptions/stripe-webhook/`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add it to your environment as `STRIPE_WEBHOOK_SECRET`

### 5. Run Migrations

```bash
cd backend
python manage.py migrate
```

## How It Works

### Subscription Flow

1. **User clicks "Upgrade to Pro"** → Frontend calls `/api/subscriptions/create-checkout/`
2. **Django creates Stripe Checkout Session** → Returns checkout URL
3. **User completes payment in Stripe** → Redirected back to success page
4. **Stripe sends webhook** → Django updates subscription in database
5. **User's plan upgraded** → Credits updated to 100, plan changed to "pro"

### Webhook Events Handled

- **checkout.session.completed**: Initial subscription creation
- **invoice.paid**: Successful monthly renewal
- **invoice.payment_failed**: Failed payment → downgrade to free
- **customer.subscription.deleted**: Cancellation → downgrade to free

### API Endpoints

- `POST /api/subscriptions/create-checkout/` - Create checkout session (requires auth)
- `GET /api/subscriptions/check-status/` - Check subscription status (requires auth)
- `POST /api/subscriptions/stripe-webhook/` - Webhook handler (no auth, validated by Stripe signature)

## Testing

### Test Mode

Use Stripe test keys to test the integration:

1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Any postal code

### Test Webhook Locally

Use Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:8000/api/subscriptions/stripe-webhook/
```

## Production Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Set up webhook endpoint with live mode
- [ ] Update `ALLOWED_HOSTS` in Django settings
- [ ] Set `DEBUG = False` in production
- [ ] Configure proper CORS settings
- [ ] Set up SSL/HTTPS for webhook endpoint
- [ ] Test complete payment flow in production
- [ ] Monitor webhook events in Stripe Dashboard

## Price Details

- **Free Plan**: ₹0 (10 credits for influencers, 50 for brands) - Credits reset on 1st of each month
- **Pro Plan**: ₹200/month (100 credits, monthly billing) - Credits reset 30 days from purchase date

## Credit Reset Logic

### Free Plans
- Credits reset on the 1st of every month to credit_limit
- Unused credits do NOT roll over
- Renewal cycle: 1st to last day of month

### Pro Plans  
- Credits reset based on subscription purchase date (30 days cycle)
- Unused credits do NOT roll over
- Renewal cycle: Purchase date + 30 days intervals

To set up automatic credit resets, see `CREDIT_RESET_SETUP.md`.

## Support

For issues with:
- Stripe integration: Check webhook logs in Stripe Dashboard
- Payment failures: Review failed payments in Stripe Dashboard
- Subscription status: Check Django logs and database records
