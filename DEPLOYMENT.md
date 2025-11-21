# Staff Scheduling System - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Staff Scheduling System in a production environment.

## Backend Deployment (Supabase)

### 1. Database Setup

1. **Create a Supabase Project**
   - Go to [Supabase](https://supabase.com) and create a new project.
   - Note down your project URL and API keys.

2. **Apply Database Schema**
   - In the Supabase dashboard, go to the SQL Editor.
   - Run the SQL script from `supabase/schema.sql` to create the necessary tables, views, functions, and RLS policies.

3. **Seed Initial Data** (Optional)
   - Run the SQL script from `supabase/seed-data.sql` if provided to populate the database with initial staff, services, and other data.

### 2. Edge Functions Deployment

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```

4. **Deploy Edge Functions**
   ```bash
   supabase functions deploy staff-auth
   supabase functions deploy staff-management
   supabase functions deploy appointment-management
   supabase functions deploy customer-management
   supabase functions deploy service-management
   supabase functions deploy payment-processing
   supabase functions deploy email-notifications
   supabase functions deploy inventory-management
   supabase functions deploy admin-settings
   ```

5. **Set Environment Variables**
   - In the Supabase dashboard, go to Settings > Edge Functions.
   - Add the following environment variables:
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `EMAIL_SERVICE_API_KEY`: Your email service API key (if using a real email service)

### 3. Authentication Setup

1. **Configure Auth Settings**
   - In the Supabase dashboard, go to Authentication > Settings.
   - Configure the following:
     - Site URL: Your frontend domain
     - Additional Redirect URLs: Any other domains where the app will be hosted
     - Enable email confirmations (recommended for production)

2. **Set up Email Templates** (Optional)
   - In the Supabase dashboard, go to Authentication > Email Templates.
   - Customize the email templates for your needs.

## Frontend Deployment

### 1. Configure Environment Variables

Create a `.env.production` file with the following variables:

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

### 2. Build and Deploy

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Your Hosting Platform**
   - Upload the `dist` folder to your hosting provider.
   - Ensure that your hosting provider supports SPAs (Single Page Applications).

## Post-Deployment Configuration

### 1. Configure Stripe Webhooks

1. **Create Webhook Endpoint**
   - In the Stripe dashboard, go to Developers > Webhooks.
   - Create a new webhook endpoint pointing to your Supabase function URL.
   - Select the following events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

2. **Configure Edge Function for Webhooks**
   - Update the `payment-processing/index.ts` file to handle webhook events.
   - Redeploy the edge function.

### 2. Set Up Email Service Integration

1. **Choose an Email Service**
   - Sign up for an email service like SendGrid, Mailgun, or AWS SES.
   - Obtain API credentials.

2. **Configure Edge Function**
   - Update the `email-notifications/index.ts` file to use your email service.
   - Redeploy the edge function.

### 3. Test All Functionality

1. **Authentication**
   - Test staff login with different roles.
   - Verify that permissions are enforced correctly.

2. **Appointments**
   - Test creating, updating, and deleting appointments.
   - Test drag-and-drop functionality.
   - Verify that conflicts are detected correctly.

3. **Payments**
   - Test payment processing with Stripe test cards.
   - Verify that webhooks update payment status correctly.

4. **Email Notifications**
   - Verify that emails are sent for appointments and payments.

5. **Inventory Management**
   - Test inventory updates and low stock alerts.

## Security Considerations

1. **Enable Row Level Security (RLS)**
   - Ensure RLS is enabled on all tables (already done in the schema).
   - Regularly review and update RLS policies as needed.

2. **Environment Variables**
   - Never expose sensitive keys in client-side code.
   - Regularly rotate API keys and passwords.

3. **HTTPS**
   - Ensure all connections use HTTPS in production.

4. **Access Control**
   - Regularly review user access levels and roles.
   - Implement the principle of least privilege.

## Maintenance

1. **Regular Backups**
   - Set up automated backups for your Supabase project.

2. **Monitoring**
   - Set up monitoring for your application to track errors and performance.

3. **Updates**
   - Regularly update dependencies and the application itself.

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify that the JWT token is valid and not expired.
   - Check that the user's role and permissions are correctly set.

2. **Payment Issues**
   - Verify that Stripe keys are correct and have the right permissions.
   - Check webhook logs for failed events.

3. **Email Delivery Issues**
   - Verify that the email service API key is correct.
   - Check spam folders for test emails.

### Support

For additional support, refer to the documentation of the individual services:
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [React Documentation](https://reactjs.org/docs)