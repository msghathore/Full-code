# Zavira Beauty Salon - Complete Codebase

A comprehensive beauty salon management system built with modern web technologies.

## 🚀 Repository Info

- **Repository:** [msghathore/Zavira-Full-Codebase](https://github.com/msghathore/Zavira-Full-Codebase)
- **Created:** November 21, 2025
- **Status:** Active Development

## 📋 Features

### Core Functionality
- ✅ **Appointment Booking System** - Complete scheduling and booking management
- ✅ **Staff Management** - Staff scheduling and management system
- ✅ **Customer Management** - Customer profiles and relationship management
- ✅ **Service Management** - Service catalog and pricing management
- ✅ **Payment Processing** - Stripe integration for secure payments
- ✅ **Email Integration** - Brevo/Sendinblue email campaigns and notifications

### Advanced Features
- ✅ **Real-time Availability** - Live availability updates and calendar sync
- ✅ **Google Calendar Integration** - Bi-directional calendar synchronization
- ✅ **Staff Dashboard** - Comprehensive admin and staff management interface
- ✅ **PWA Support** - Progressive Web App with offline capabilities
- ✅ **Mobile Responsive** - Optimized for all device sizes
- ✅ **Authentication** - Clerk integration for user management
- ✅ **Database** - Supabase backend with real-time features

### Technical Features
- ✅ **Performance Optimized** - Code splitting and lazy loading
- ✅ **SEO Optimized** - Meta tags and structured data
- ✅ **Accessibility** - WCAG compliant components
- ✅ **Testing** - Unit tests and E2E tests with Playwright
- ✅ **CI/CD Pipeline** - Automated testing and deployment
- ✅ **Docker Ready** - Containerization support

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **GSAP** - High-performance animations

### Backend & Services
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Stripe** - Payment processing and subscription management
- **Clerk** - Authentication and user management
- **Brevo/Sendinblue** - Email marketing and notifications

### Development Tools
- **Playwright** - End-to-end testing
- **Vitest** - Unit testing framework
- **ESLint** - Code linting and formatting
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Deployment platform

## 📁 Project Structure

```
Zavira-Full-Codebase/
├── .github/workflows/          # GitHub Actions CI/CD
├── public/                     # Static assets
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── AdminLayout.tsx    # Admin interface
│   │   ├── BookingModal.tsx   # Booking components
│   │   └── ...
│   ├── pages/                 # Route components
│   │   ├── AdminDashboard.tsx
│   │   ├── Booking.tsx
│   │   ├── Services.tsx
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── services/              # API services
│   └── integrations/          # Third-party integrations
├── supabase/                  # Database schema and functions
│   ├── functions/             # Supabase Edge Functions
│   └── schema.sql            # Database schema
├── e2e/                       # End-to-end tests
└── docs/                      # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/msghathore/Zavira-Full-Codebase.git
   cd Zavira-Full-Codebase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   - Supabase URL and keys
   - Stripe publishable keys
   - Clerk authentication keys
   - Google Calendar API credentials

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:run` - Run tests once
- `npm run e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint

## 📊 Database Schema

The application uses Supabase with the following main entities:

- **Users** - Customer and staff user profiles
- **Services** - Available beauty services and pricing
- **Appointments** - Booking and scheduling data
- **Staff** - Staff members and their schedules
- **Payments** - Transaction and payment records
- **Notifications** - Email and push notification logs

## 🔧 Configuration

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Email (Brevo/Sendinblue)
VITE_BREVO_API_KEY=your_brevo_key

# Google Calendar
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
```

## 🚀 Deployment

The repository includes GitHub Actions workflows for:

- **Production Deployment** - Deploys to Vercel on main branch pushes
- **Staging Deployment** - Deploys to staging environment on develop branch
- **Automated Testing** - Runs all tests on every push and PR

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel (recommended)
   - Netlify
   - AWS Amplify
   - Any static hosting service

## 🧪 Testing

- **Unit Tests** - Component and utility testing with Vitest
- **Integration Tests** - API and database testing
- **E2E Tests** - Full user journey testing with Playwright
- **Performance Tests** - Lighthouse CI integration

## 📈 Performance

- **Lighthouse Score** - 90+ on all metrics
- **Bundle Size** - Optimized with code splitting
- **Loading Speed** - Sub-2s first contentful paint
- **Core Web Vitals** - Optimized for Google metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is proprietary software owned by the Zavira Beauty Salon.

## 📞 Support

For technical support or questions:
- Create an issue in this repository
- Contact the development team

## 🗓️ Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

---

**Built with ❤️ by the Zavira Development Team**

*Last updated: November 21, 2025*