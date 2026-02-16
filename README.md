# 🏃 PhysioBook - AI-Powered Physiotherapy Platform

![PhysioBook Banner](/public/screenshot-for-readme.png)

PhysioBook is a comprehensive physiotherapy booking and management platform powered by AI. It features intelligent patient triage, smart therapist matching, outcome tracking, and real-time exercise guidance using computer vision.

## ✨ Features

### 🚀 Core Features
- 🔐 **Authentication** via Clerk (Google, GitHub, Email & Password)
- 📅 **Appointment Booking System** with 3-step flow
- 📩 **Email Notifications** for bookings (Resend)
- 📊 **Admin Dashboard** for managing appointments
- 💳 **Subscription Payments** with Clerk (Free + 2 Paid Plans)
- 📂 **PostgreSQL** for data persistence
- 🎨 **Tailwind CSS + Shadcn** for styling
- ⚡ **TanStack Query** for data fetching

### 🧠 AI-Powered Features

#### 1. Intelligent Patient Intake & Triage
- Patients describe symptoms in natural language
- AI classifies condition type (acute, chronic, post-op, sports injury, etc.)
- Determines urgency level (emergency to preventive)
- Recommends appropriate specialist
- Identifies red flags requiring immediate attention
- Confidence scoring for transparency

#### 2. Smart Therapist Matching
- Matches based on patient triage data
- Considers therapist specialties & certifications
- Factors in availability & location preferences
- Uses historical success rates & patient feedback
- AI-generated personalized recommendations

#### 3. Outcome Tracking & Progress Dashboard
- Per-patient recovery dashboard with visual charts
- Pain level, mobility, and function score tracking
- Treatment plan & session notes management
- AI-powered progress analysis
- Predicted recovery timeline
- Exercise compliance monitoring

#### 4. AI Exercise Guidance with Computer Vision
- Real-time pose detection using TensorFlow.js
- Instant form feedback and corrections
- Rep counting with phase detection
- Form scoring and accuracy metrics
- Voice feedback for hands-free exercise
- Support for multiple exercise types

#### 5. No-Show Prediction & Smart Scheduling
- ML-based prediction of no-show probability
- Risk-based reminder scheduling (SMS/Email)
- Overbooking strategy suggestions
- Appointment confirmation tracking
- Historical pattern analysis

#### 6. Tele-Physio Video Sessions
- Secure WebRTC video calls
- Virtual session logging
- Screen sharing for exercise demos
- Chat during sessions

#### 7. Healthcare Data Compliance
- Role-based access control
- Audit logging for sensitive actions
- HIPAA-compliant data handling
- Encrypted sensitive records

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Authentication**: Clerk
- **Database**: PostgreSQL + Prisma ORM
- **AI/ML**: 
  - OpenAI GPT-4 (Triage & Analysis)
  - TensorFlow.js (Pose Detection)
  - Custom ML (No-Show Prediction)
- **Email**: Resend
- **Charts**: Recharts
- **Data Fetching**: TanStack Query
- **Video**: WebRTC
- **Voice AI**: Vapi (Pro plans)

## 📁 Project Structure

```
physiobook/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── public/                # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth pages
│   │   ├── (dashboard)/   # Dashboard pages
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   ├── dashboard/     # Dashboard components
│   │   ├── exercise/      # Exercise guidance
│   │   ├── landing/       # Landing page
│   │   ├── progress/      # Progress tracking
│   │   ├── triage/        # Triage assessment
│   │   └── ui/            # UI components
│   ├── lib/
│   │   ├── ai/            # AI services
│   │   │   ├── triage.ts
│   │   │   ├── matching.ts
│   │   │   ├── no-show-prediction.ts
│   │   │   └── pose-detection.ts
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Utilities
│   └── middleware.ts      # Clerk middleware
├── .env.example           # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- OpenAI API key
- Resend account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/physiobook.git
cd physiobook
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Set up the database:
```bash
npm run db:push
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
DATABASE_URL=

# OpenAI
OPENAI_API_KEY=

# Vapi (Voice AI)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
NEXT_PUBLIC_VAPI_API_KEY=

# Resend (Email)
RESEND_API_KEY=

# App
ADMIN_EMAIL=
NEXT_PUBLIC_APP_URL=
```


## 📊 API Endpoints

### Triage
- `POST /api/triage/analyze` - Analyze symptoms with AI

### Therapists
- `POST /api/therapists/match` - Get AI-matched therapists
- `GET /api/therapists/match` - List all therapists

### Booking
- `POST /api/booking` - Create appointment
- `GET /api/booking` - Get user's appointments

### Progress
- `POST /api/progress` - Log progress record
- `GET /api/progress` - Get patient progress

## 🔒 Security Features

- HIPAA-compliant data handling
- Role-based access control (Patient, Therapist, Admin)
- Audit logging for all sensitive operations
- Encrypted sensitive fields
- Secure webhook verification

## 📱 Subscription Plans

| Feature | Free | Basic ($29) | Pro ($79) |
|---------|------|-------------|-----------|
| Appointments/month | 2 | 10 | Unlimited |
| AI Triage | Basic | Full | Priority |
| Therapist Matching | ✓ | Smart | VIP |
| Progress Dashboard | ✓ | ✓ | Advanced |
| SMS Reminders | - | ✓ | ✓ |
| Tele-Physio | - | ✓ | ✓ |
| AI Exercise Guidance | - | - | ✓ |
| Voice Agent | - | - | ✓ |
| Family Accounts | - | - | Up to 4 |

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Dentwise](https://github.com/burakorkmez/dentwise) by Burak Orkmez - Original template inspiration
- [TensorFlow.js](https://www.tensorflow.org/js) - Pose detection
- [OpenAI](https://openai.com) - AI triage
- [Clerk](https://clerk.com) - Authentication
- [Shadcn/UI](https://ui.shadcn.com) - UI components

---

Built with ❤️ for DevDash 2026 Hackathon
