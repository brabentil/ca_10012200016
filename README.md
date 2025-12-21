# ThriftHub Ghana

**Cloud-Based Student-Centric Thrift E-Commerce Platform**

A comprehensive e-commerce platform designed for university students in Ghana, providing affordable thrift clothing with innovative features including AI-powered style matching, flexible payment options (Payday Flex), and campus-based delivery (Campus Connect).

## 🚀 Live Deployment

**Production URL:** [https://thrifthub-orcin.vercel.app/](https://thrifthub-orcin.vercel.app/)

**GitHub Repository:** `ca_indexnumber`

## 📋 Project Overview

ThriftHub Ghana addresses critical challenges faced by Ghanaian students:
- High costs of new clothing
- Limited access to sustainable fashion
- Unreliable campus delivery options
- Payment barriers (no international cards)
- Trust issues with online thrift vendors

### Target Locations
- Academic City University (Haatso, Accra)
- University of Ghana, Legon
- Ghana Institute of Journalism (GIJ)
- Ashesi University (Berekuso)
- Central University (Miotso)

## ✨ Innovative Features

### 1. **Payday Flex Payment System**
- 50/50 split payment option aligned with student paydays
- Automatic second installment processing via Paystack
- Email reminders 24 hours before payday
- Authorization code storage for recurring charges

### 2. **Campus Connect Delivery**
- Zone-based delivery system for university campuses
- Student rider assignment with round-robin algorithm
- Campus-specific zones (e.g., Commonwealth Hall, Volta Hall)
- Landmark-based routing for easy navigation
- 81% cost savings vs external couriers

### 3. **AI Style Matcher**
- OpenAI CLIP embedding pipeline for image-based product search
- Upload outfit photo → find similar thrift items
- 512-dimensional vector embeddings with pgvector
- Cosine similarity search returning top 10 matches
- Zero-shot image classification

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16.0.10 with Turbopack
- **UI Library:** React 19 with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Query for server state
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js with Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt password hashing
- **File Storage:** Cloudinary for product images
- **Payments:** Paystack API (Ghana-focused)
- **Email:** Nodemailer for transactional emails
- **AI Processing:** @xenova/transformers (CLIP model)

### Cloud Infrastructure
- **Hosting:** Vercel (serverless deployment)
- **Database:** Neon PostgreSQL (serverless)
- **CDN:** Vercel Edge Network
- **CI/CD:** Automatic deployment from GitHub
- **Monitoring:** Vercel Analytics

### Testing & Quality Assurance
- **Unit Testing:** Jest + React Testing Library
- **Load Testing:** Apache JMeter 5.6.3
- **API Testing:** Postman

## 🏗️ Project Structure

```
thrifthub-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── verify/
│   ├── admin/                    # Admin dashboard
│   │   ├── products/
│   │   ├── orders/
│   │   ├── riders/
│   │   └── users/
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── products/             # Product CRUD
│   │   ├── cart/                 # Shopping cart
│   │   ├── orders/               # Order management
│   │   ├── payments/             # Paystack integration
│   │   ├── ai/                   # AI Style Matcher
│   │   ├── deliveries/           # Campus Connect
│   │   └── webhooks/             # Payment webhooks
│   ├── cart/                     # Cart page
│   ├── checkout/                 # Checkout flow
│   ├── products/                 # Product catalog
│   ├── orders/                   # Order history
│   ├── profile/                  # User profile
│   ├── style-match/              # AI Style Matcher UI
│   ├── student-verification/     # .edu.gh verification
│   └── wishlist/                 # Saved items
├── components/                   # Reusable components
│   ├── admin/                    # Admin components
│   ├── auth/                     # Auth forms
│   ├── cart/                     # Cart components
│   ├── checkout/                 # Checkout forms
│   ├── product/                  # Product cards/details
│   ├── ui/                       # shadcn/ui primitives
│   └── layout/                   # Layout components
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Database client
│   ├── auth.ts                   # JWT helpers
│   ├── validation.ts             # Zod schemas
│   ├── payment/                  # Paystack integration
│   ├── ai/                       # CLIP processing
│   └── email/                    # Email templates
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── __tests__/                    # Jest unit tests
├── load-tests/                   # JMeter load tests
└── public/                       # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL database
- Cloudinary account (for image uploads)
- Paystack account (for payments)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/ca_indexnumber.git
cd ca_indexnumber
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Paystack
PAYSTACK_SECRET_KEY="your-paystack-secret"
PAYSTACK_PUBLIC_KEY="your-paystack-public"

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Application
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. **Generate Prisma client:**
```bash
npx prisma generate
```

5. **Run database migrations:**
```bash
npx prisma migrate dev
```

6. **Seed the database (optional):**
```bash
npm run seed
```

7. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Load Testing
```bash
# Install JMeter, then run:
jmeter -n -t load-tests/thrifthub-load-test.jmx -l load-tests/results.jtl
```

## 📦 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub:**
```bash
git push origin main
```

2. **Connect to Vercel:**
- Import repository on [Vercel Dashboard](https://vercel.com)
- Configure environment variables
- Deploy automatically on every push

### Manual Deployment

1. **Build production bundle:**
```bash
npm run build
```

2. **Start production server:**
```bash
npm start
```

## 🔑 Key Features Implementation

### Student Verification
- Email verification using `.edu.gh` domains
- Admin approval workflow
- Verified badge display on profile

### Shopping Experience
- Product browsing with filters (category, size, price)
- Search functionality with full-text matching
- Product details with image gallery
- Reviews and ratings system
- Add to cart with stock validation
- Wishlist functionality

### Checkout Process
- Delivery address with campus zone selection
- Multiple payment methods:
  - Mobile Money (MTN, Vodafone, AirtelTigo)
  - Card payments via Paystack
  - Payday Flex installment option
- Order summary with dynamic pricing

### Admin Dashboard
- Product management (CRUD, bulk upload)
- Order management with status updates
- Rider assignment and tracking
- Analytics and sales reports
- User management

## 📊 Database Schema

14 core tables implementing the platform:
- **Users**: Authentication and profiles
- **Products**: Catalog with inventory
- **Categories**: Product organization
- **Carts / CartItems**: Shopping cart state
- **Orders / OrderItems**: Transaction records
- **Payments**: Payment tracking with Payday Flex
- **Reviews**: Product feedback
- **Wishlists**: Saved items
- **CampusRiders**: Delivery personnel
- **Deliveries**: Order fulfillment tracking

## 🎯 Performance Metrics

### Load Testing Results (JMeter)
- **Total Requests:** 75 samples
- **Error Rate:** 0.00%
- **Average Response Time:** 1406ms
- **Throughput:** 4.6 requests/second
- **90th Percentile:** < 3000ms
- **95th Percentile:** < 4500ms

### Unit Testing
- **Test Suites:** 2
- **Test Cases:** 11
- **Pass Rate:** 100%
- **Execution Time:** 1.204s

## 📚 Documentation

- **Project Documentation Report (PDR):** Comprehensive journey journal documenting SDLC phases
- **API Documentation:** Postman collection included (`insomnia_collection.json`)
- **Architecture Diagrams:** ERD, Use Case, System Architecture in PDR
- **Mind Maps:** Innovation features brainstorming (Payday Flex, Campus Connect, AI Style Matcher)

## 🤝 Contributing

This is an academic project. For collaboration inquiries, please open an issue.

## 📄 License

This project is developed as part of CSIT4131: Cloud Applications course at Academic City University.

## 🙏 Acknowledgments

- **Course:** CSIT4131 - Cloud Applications
- **Institution:** Academic City University
- **Faculty:** Faculty of Computational Sciences and Informatics
- **Lecturer:** Godwin Ntow Danso

## 📞 Support

For issues or questions, please open a GitHub issue in the repository.

---

**Note:** This platform is designed specifically for Ghanaian university students and integrates local payment solutions (Paystack), campus delivery logistics, and cultural considerations for the target market.
