# Square Payment Integration Setup Guide

## Overview
The system has been updated to use Square payments instead of Stripe. This guide outlines the setup process.

## Files Created/Modified

### Frontend Files
1. **`src/lib/square.ts`** - Square configuration and utility functions
2. **`src/components/SquarePaymentForm.tsx`** - Square payment form component
3. **`src/components/SquareProvider.tsx`** - Square provider wrapper
4. **`src/pages/CheckoutPage.tsx`** - Updated with Square payment integration

### Backend Files
1. **`supabase/functions/square-payment/index.ts`** - Supabase Edge Function for payment processing

## Environment Variables Required

Create a `.env` file with the following Square configuration:

```env
# Square Configuration
VITE_SQUARE_APPLICATION_ID=your_square_application_id
VITE_SQUARE_LOCATION_ID=your_square_location_id
VITE_SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox
```

## Square Developer Account Setup

1. **Create Square Developer Account**
   - Go to https://developer.squareup.com/
   - Create an account and log in

2. **Create Application**
   - Create a new application
   - Get your Application ID and Access Token

3. **Configure Location**
   - Set up your business location
   - Get your Location ID

4. **Environment Setup**
   - Use Sandbox for testing
   - Switch to Production when ready

## Payment Flow

1. User clicks "Square Pay" button on checkout page
2. Square payment modal opens with payment form
3. User enters card details and submits
4. Square processes payment and returns token
5. Frontend sends token to Supabase Edge Function
6. Edge Function processes payment with Square API
7. Payment record stored in database
8. Transaction finalized with Square payment info

## Testing

1. **Sandbox Testing**
   - Use Square sandbox environment
   - Use test card numbers provided by Square

2. **Test Cards (Sandbox)**
   - Visa: 4111 1111 1111 1111
   - Mastercard: 5105 1051 0510 5100
   - See Square docs for more test cards

## Database Changes

The payments table has been enhanced to support Square:
- Added `square_payment_id` field
- Updated constraints to work with Square payments

## Error Handling

- UUID validation for staff_id (fixes EMP004 error)
- Square payment error handling
- Database transaction rollback on failure

## Next Steps

1. Fix remaining syntax errors in CheckoutPage.tsx
2. Configure Square environment variables
3. Deploy Supabase Edge Function
4. Test payment flow in sandbox environment
5. Switch to production when ready

## Security Notes

- Never expose Square access tokens in frontend code
- Use environment variables for all sensitive configuration
- Validate all payment data server-side
- Implement proper error handling and logging