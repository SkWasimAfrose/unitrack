# UniTrack

**One place to organize your day and stay on track**

UniTrack is a comprehensive productivity and organization platform designed for students and professionals. It combines task management, daily planning, expense tracking, and quick notes into a single, beautifully designed application.

![UniTrack Logo](/logo.webp)

## 🚀 Features

### 📊 Dashboard
- Real-time overview of your productivity metrics
- Quick stats for pending tasks, today's sessions, monthly expenses, and saved notes
- Upcoming tasks with one-click completion
- Today's schedule at a glance
- Monthly budget progress tracking

### ✅ Tasks & Assignments
- Create and manage tasks with deadlines
- Set priorities and descriptions
- Track completion status with visual indicators
- Filter by active and completed tasks
- Deadline notifications and overdue tracking

### 📅 Day Planner
- Weekly schedule management
- Custom subject/category creation with color coding
- Time-based session planning
- Visual timeline for each day of the week
- Drag-and-drop friendly interface

### 💰 Financial Dashboard
- Monthly budget setting and tracking
- Expense logging with categories (Food, Travel, Rent, Personal, Entertainment, Education, Other)
- Real-time budget utilization percentage
- Category-wise spending breakdown
- Transaction history with date tracking

### 📝 Quick Notes
- Capture ideas and thoughts instantly
- Color-coded notes for visual organization
- Inline editing capabilities
- Grid layout for easy scanning
- Timestamp tracking

### 👤 Profile & Settings
- Personal profile management
- Theme switching (Light/Dark/System)
- Data management with reset option
- Secure authentication handling

### 🔐 Authentication
- Email/password authentication
- Google OAuth integration
- Secure session management
- Protected routes for authenticated users

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library with hooks and modern features
- **TypeScript 5.8.3** - Type-safe development
- **Vite 5.4.19** - Fast build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI Components & Styling
- **shadcn/ui** - Beautiful, accessible component library built on Radix UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Consistent icon library
- **Tailwind Animate** - Smooth animations

### State Management & Data
- **TanStack Query 5.83.0** - Server state management
- **React Context API** - Global state (Auth, Theme)
- **React Hook Form 7.61.1** - Form state management
- **Zod 3.25.76** - Schema validation

### Backend & Database
- **Supabase 2.89.0** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication service
  - Real-time subscriptions
  - Row Level Security (RLS)

### Utilities
- **date-fns 3.6.0** - Date manipulation and formatting
- **clsx & tailwind-merge** - Conditional class utilities
- **Recharts 2.15.4** - Chart library for data visualization

### PWA & Performance
- **vite-plugin-pwa 1.2.0** - Progressive Web App support
- **Vite Plugin React SWC** - Fast React compilation

## 📁 Project Structure

```
unitrack/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── layout/             # Layout components (sidebar, header)
│   │   ├── pwa/                # PWA install prompt
│   │   └── ui/                 # shadcn/ui components
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Theme management
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/
│   │   └── supabase/           # Supabase client configuration
│   ├── lib/                    # Utility functions
│   ├── pages/                  # Page components
│   │   ├── Auth.tsx            # Login/Signup
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Tasks.tsx           # Task management
│   │   ├── DayPlanner.tsx      # Schedule planning
│   │   ├── Expenses.tsx        # Expense tracking
│   │   ├── Notes.tsx           # Note management
│   │   ├── Profile.tsx         # User settings
│   │   └── Onboarding.tsx      # Welcome flow
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Application entry point
├── supabase/
│   └── migrations/             # Database schema migrations
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## 🗄️ Database Schema

The application uses Supabase PostgreSQL with the following tables:

- **profiles** - User profile information
- **subjects** - Categories for scheduling (with custom colors)
- **study_schedules** - Weekly schedule entries
- **tasks** - Task and assignment management
- **budgets** - Monthly budget tracking
- **expenses** - Expense records with categories
- **notes** - Quick notes with color coding

All tables implement Row Level Security (RLS) to ensure users can only access their own data.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (or use the provided configuration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SkWasimAfrose/unitrack.git
cd unitrack
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

4. **Run the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Building for Production

```bash
npm run build
npm run preview
```

## 📱 PWA Support

UniTrack is built as a Progressive Web App (PWA) with:
- Installable on desktop and mobile devices
- Offline capability with service workers
- App manifest for native-like experience
- Responsive design for all screen sizes

## 🎨 Design System

The application uses a custom design system with:
- **Brand Colors**: Purple, Pink, Yellow, Green, Blue
- **Typography**: Inter (body) and Space Grotesk (display)
- **Border Radius**: Consistent rounded corners (rounded-2xl, rounded-3xl)
- **Animations**: Smooth transitions and micro-interactions
- **Dark Mode**: Full dark mode support with system preference detection

## 🔒 Security

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Protected routes for authenticated users
- Environment variable management for sensitive data
- Input validation with Zod schemas

## 📄 License

This project is built and maintained by Sk Wasim Afrose.

## 👨‍💻 Author

**Sk Wasim Afrose**
- [Portfolio](https://whoiswasim.vercel.app/)
- [GitHub](https://github.com/SkWasimAfrose)

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Backend powered by [Supabase](https://supabase.com)
- Icons from [Lucide](https://lucide.dev)
