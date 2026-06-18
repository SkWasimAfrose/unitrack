# UniTrack - Project Details & Interview Preparation

## 📋 Project Overview

**Project Name:** UniTrack  
**Tagline:** One place to organize your day and stay on track  
**Type:** Productivity & Organization Web Application  
**Development Period:** 2026  
**Developer:** Sk Wasim Afrose  

### Problem Statement

Students and professionals often struggle with managing multiple aspects of their daily lives across different applications. They need to track tasks, manage schedules, monitor expenses, and capture quick notes, but using separate apps for each function leads to fragmentation and reduced productivity.

### Solution

UniTrack is an all-in-one productivity platform that integrates task management, daily planning, expense tracking, and note-taking into a single, cohesive application with a beautiful, intuitive interface.

---

## 🎯 Key Features

### 1. Dashboard
- **Purpose:** Central hub for productivity overview
- **Features:**
  - Real-time statistics (pending tasks, today's sessions, monthly expenses, saved notes)
  - Upcoming tasks with one-click completion
  - Today's schedule preview
  - Monthly budget progress visualization
- **Technical Implementation:**
  - Aggregates data from multiple Supabase tables
  - Uses TanStack Query for efficient data fetching
  - Responsive grid layout with stat cards

### 2. Tasks & Assignments
- **Purpose:** Academic and personal task management
- **Features:**
  - Create tasks with titles, descriptions, and deadlines
  - Visual completion tracking with checkboxes
  - Filter by active/completed status
  - Deadline formatting (Today, Tomorrow, or date)
  - Overdue task highlighting
- **Technical Implementation:**
  - CRUD operations on Supabase `tasks` table
  - Date manipulation with date-fns
  - Tab-based UI for task filtering
  - Optimistic UI updates for better UX

### 3. Day Planner
- **Purpose:** Weekly schedule and time management
- **Features:**
  - Create custom subject categories with color coding
  - Plan sessions for each day of the week
  - Time-based scheduling (start/end times)
  - Visual timeline display
  - "Live Today" indicator for current day
- **Technical Implementation:**
  - Relational database design (subjects → study_schedules)
  - Color palette selection for categories
  - Time formatting and validation
  - Responsive card grid layout

### 4. Financial Dashboard
- **Purpose:** Personal finance tracking
- **Features:**
  - Set monthly budgets
  - Log expenses with categories
  - Real-time budget utilization percentage
  - Category-wise spending breakdown
  - Transaction history with dates
- **Technical Implementation:**
  - Budget calculation with upsert operations
  - Expense aggregation by category
  - Progress bar visualization
  - Currency formatting (INR - ₹)
  - Seven expense categories with emoji icons

### 5. Quick Notes
- **Purpose:** Capture ideas and thoughts instantly
- **Features:**
  - Create notes with custom colors
  - Inline editing capabilities
  - Grid layout for visual organization
  - Timestamp tracking
  - Five color options (Yellow, Green, Blue, Pink, Purple)
- **Technical Implementation:**
  - HSL color values for consistent theming
  - Textarea components for content
  - Edit mode with save/cancel actions
  - Responsive grid (1-4 columns based on screen size)

### 6. Profile & Settings
- **Purpose:** User preferences and account management
- **Features:**
  - Profile information editing (name, role)
  - Theme switching (Light/Dark/System)
  - Data reset functionality
  - Secure sign-out
- **Technical Implementation:**
  - Theme context with localStorage persistence
  - System theme detection and automatic switching
  - Confirmation dialogs for destructive actions
  - Profile updates via Supabase

### 7. Authentication
- **Purpose:** Secure user access management
- **Features:**
  - Email/password signup and login
  - Google OAuth integration
  - Session persistence
  - Protected routes
  - Onboarding flow
- **Technical Implementation:**
  - Supabase Auth service
  - React Context for auth state
  - Zod validation for form inputs
  - LocalStorage for onboarding completion
  - Redirect logic based on auth state

---

## 🏗️ Architecture & Design

### Frontend Architecture

**Component Structure:**
- **Pages:** Route-level components (Dashboard, Tasks, Expenses, etc.)
- **Layout:** AppLayout with sidebar navigation
- **Components:** Reusable UI components (StatCard, UpcomingTasks, etc.)
- **UI Kit:** shadcn/ui components (Button, Dialog, Input, etc.)

**State Management:**
- **Global State:** React Context (AuthContext, ThemeContext)
- **Server State:** TanStack Query for Supabase data
- **Local State:** React useState for component-level state
- **Form State:** React Hook Form with Zod validation

**Routing:**
- React Router DOM for client-side routing
- Protected routes with authentication checks
- Onboarding flow with conditional redirects

### Backend Architecture

**Database:** Supabase PostgreSQL
- Row Level Security (RLS) for data isolation
- Automatic triggers for user registration
- Timestamp triggers for updated_at columns
- Foreign key relationships with CASCADE deletes

**Authentication:** Supabase Auth
- Email/password authentication
- Google OAuth provider
- Session management with auto-refresh
- User metadata storage

**API Integration:**
- Supabase JavaScript client
- Type-safe database queries
- Real-time subscription support (infrastructure ready)

### Design System

**Color Palette:**
- Brand Colors: Purple (#6366f1), Pink (#ec4899), Yellow (#eab308), Green (#22c55e), Blue (#3b82f6)
- Semantic Colors: Destructive, Warning, Info, Success
- Note Colors: Yellow, Green, Blue, Pink, Purple (HSL values)
- Category Colors: Food, Travel, Rent, Personal, Other

**Typography:**
- Body Font: Inter (system-ui fallback)
- Display Font: Space Grotesk
- Font Weights: Regular (400), Medium (500), Semibold (600), Bold (700)

**Spacing & Layout:**
- Container-based layout with max-width constraints
- Responsive breakpoints (mobile-first approach)
- Consistent padding and margins using Tailwind
- Rounded corners (rounded-2xl, rounded-3xl) for modern look

**Animations:**
- Fade-in animations for page transitions
- Hover effects with scale transforms
- Loading spinners for async operations
- Smooth transitions for theme switching

---

## 🗄️ Database Schema

### Tables

#### 1. profiles
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users, Unique)
- full_name (TEXT)
- course (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```
**Purpose:** Store user profile information  
**RLS Policies:** Users can view/insert/update their own profile

#### 2. subjects
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- name (TEXT, Not Null)
- color (TEXT, Default: '#6366f1')
- created_at (TIMESTAMP)
```
**Purpose:** Categories for day planner scheduling  
**RLS Policies:** Full CRUD for user's own subjects

#### 3. study_schedules
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- subject_id (UUID, Foreign Key to subjects)
- day_of_week (INTEGER, 0-6)
- start_time (TIME, Not Null)
- end_time (TIME, Not Null)
- created_at (TIMESTAMP)
```
**Purpose:** Weekly schedule entries  
**RLS Policies:** Full CRUD for user's own schedules

#### 4. tasks
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- title (TEXT, Not Null)
- description (TEXT)
- deadline (TIMESTAMP)
- is_completed (BOOLEAN, Default: false)
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
```
**Purpose:** Task and assignment management  
**RLS Policies:** Full CRUD for user's own tasks

#### 5. budgets
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- month (INTEGER, 1-12)
- year (INTEGER)
- amount (DECIMAL, Default: 0)
- created_at (TIMESTAMP)
- Unique Constraint: (user_id, month, year)
```
**Purpose:** Monthly budget tracking  
**RLS Policies:** Full CRUD for user's own budgets

#### 6. expenses
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- amount (DECIMAL, Not Null)
- category (TEXT, Not Null)
- description (TEXT)
- date (DATE, Default: CURRENT_DATE)
- created_at (TIMESTAMP)
```
**Purpose:** Expense records  
**RLS Policies:** Full CRUD for user's own expenses

#### 7. notes
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- content (TEXT, Not Null)
- color (TEXT, Default: '#fef3c7')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```
**Purpose:** Quick notes  
**RLS Policies:** Full CRUD for user's own notes

### Database Functions & Triggers

#### handle_new_user()
- **Trigger:** Fires on new user registration
- **Actions:**
  - Creates profile entry
  - Inserts default subjects (Cooking, Running, Study, Work)
- **Security:** SECURITY DEFINER with search_path = public

#### update_updated_at_column()
- **Trigger:** Fires on UPDATE for profiles and notes
- **Action:** Automatically updates updated_at timestamp
- **Security:** SECURITY DEFINER

---

## 🔧 Technical Implementation Details

### Key Technologies & Their Usage

#### React 18.3.1
- Functional components with hooks
- Context API for global state
- Custom hooks for reusable logic
- Suspense-ready architecture

#### TypeScript 5.8.3
- Type-safe component props
- Interface definitions for data models
- Generic types for reusable components
- Strict type checking enabled

#### Vite 5.4.19
- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Plugin ecosystem (PWA, React SWC)
- Path aliases (@/ for src/)

#### Supabase 2.89.0
- PostgreSQL database hosting
- Authentication service
- Real-time subscriptions
- Type-safe client with generated types

#### TanStack Query 5.83.0
- Server state management
- Automatic caching and refetching
- Optimistic updates
- Loading and error states

#### React Hook Form 7.61.1
- Form state management
- Performance optimization
- Integration with Zod validation
- Reduced re-renders

#### Zod 3.25.76
- Runtime type validation
- Schema definitions
- Error message customization
- TypeScript inference

#### Tailwind CSS 3.4.17
- Utility-first styling
- Custom design system
- Dark mode support
- Responsive design utilities

#### shadcn/ui
- Accessible component library
- Radix UI primitives
- Customizable themes
- Copy-paste components

### Code Patterns Used

#### 1. Protected Routes
```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  
  return <AppLayout>{children}</AppLayout>;
}
```

#### 2. Supabase CRUD Operations
```typescript
// Create
const { data, error } = await supabase
  .from('tasks')
  .insert({ user_id: user.id, title, description })
  .select()
  .single();

// Read
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// Update
await supabase
  .from('tasks')
  .update({ is_completed: true })
  .eq('id', taskId);

// Delete
await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

#### 3. Context Providers
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // ... implementation
  
  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### 4. Custom Hooks
```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 5. Form Validation with Zod
```typescript
const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

try {
  emailSchema.parse(loginEmail);
  passwordSchema.parse(loginPassword);
} catch (err) {
  if (err instanceof z.ZodError) {
    toast({ title: "Validation Error", description: err.errors[0].message });
  }
}
```

### Performance Optimizations

1. **Code Splitting:** React Router lazy loading (ready to implement)
2. **Image Optimization:** WebP format for logo
3. **Bundle Size:** Tree-shaking with Vite
4. **Caching:** TanStack Query automatic caching
5. **Lazy Loading:** Component-level code splitting
6. **PWA:** Service worker for offline capability
7. **Optimistic Updates:** Immediate UI feedback for better UX

### Security Measures

1. **Row Level Security (RLS):** Database-level access control
2. **Environment Variables:** Sensitive data in .env files
3. **Input Validation:** Zod schemas for all forms
4. **SQL Injection Prevention:** Parameterized queries via Supabase
5. **XSS Protection:** React's built-in escaping
6. **Authentication:** Secure session management
7. **CORS:** Configured in Supabase dashboard

---

## 📊 Project Statistics

### Code Metrics
- **Total Files:** 100+ (including components, pages, configs)
- **Components:** 50+ reusable UI components
- **Pages:** 8 main application pages
- **Database Tables:** 7 tables with RLS
- **Dependencies:** 60+ npm packages
- **Lines of Code:** ~15,000+ (estimated)

### Feature Breakdown
- **Authentication:** 2 methods (Email, Google OAuth)
- **Task Management:** CRUD with deadlines
- **Schedule Planning:** Weekly with categories
- **Expense Tracking:** 7 categories with budgets
- **Note Taking:** 5 color options
- **Theme Support:** 3 modes (Light, Dark, System)

---

## 🚀 Deployment & DevOps

### Development Workflow
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Deployment Options
1. **Vercel:** Recommended for React apps
2. **Netlify:** Alternative with easy setup
3. **GitHub Pages:** Free static hosting
4. **Supabase Hosting:** Backend hosting included

### PWA Configuration
- **Manifest:** Auto-generated by vite-plugin-pwa
- **Service Worker:** Auto-update strategy
- **Install Prompt:** Custom component for better UX
- **Icons:** 192x192 and 512x512 WebP format

---

## 🎯 Interview Talking Points

### 1. Project Overview
"UniTrack is a comprehensive productivity platform that helps students and professionals manage their daily tasks, schedules, expenses, and notes in one place. I built this to solve the problem of app fragmentation - instead of using multiple apps for different purposes, users can now manage everything in a single, beautifully designed interface."

### 2. Technical Challenges & Solutions

**Challenge:** Managing complex state across multiple features
**Solution:** "I implemented a layered state management approach using React Context for global auth/theme state and TanStack Query for server state. This separation of concerns made the codebase more maintainable and efficient."

**Challenge:** Ensuring data security in a multi-user application
**Solution:** "I implemented Row Level Security (RLS) policies in Supabase, ensuring users can only access their own data. All database queries include user_id filtering, and I used Supabase's authentication service for secure session management."

**Challenge:** Building a responsive design that works on all devices
**Solution:** "I used a mobile-first approach with Tailwind CSS, implementing responsive breakpoints and a collapsible sidebar navigation. The layout adapts seamlessly from mobile phones to desktop screens."

### 3. Architecture Decisions

**Why Supabase over traditional backend?**
"Supabase provided a complete backend solution with PostgreSQL, authentication, and real-time capabilities. This allowed me to focus on frontend development while having a scalable, secure backend. The RLS policies and automatic type generation were significant productivity boosters."

**Why shadcn/ui over other UI libraries?**
"shadcn/ui gives you full ownership of the components - they're copied into your codebase rather than imported as a black box. This allows for complete customization while still providing accessible, well-designed components built on Radix UI primitives."

**Why TanStack Query for state management?**
"TanStack Query handles server state complexity like caching, background updates, and optimistic updates out of the box. It significantly reduced boilerplate code and improved the user experience with automatic loading states and error handling."

### 4. Performance Optimizations

"I implemented several performance optimizations:
- Code splitting with React Router for lazy loading
- TanStack Query's automatic caching to reduce API calls
- Optimistic UI updates for immediate user feedback
- Image optimization using WebP format
- PWA capabilities with service workers for offline support"

### 5. Future Enhancements

"Planned features include:
- Real-time collaboration for shared schedules
- Data export functionality (CSV, PDF)
- Advanced analytics and insights
- Calendar integration (Google Calendar, Outlook)
- Push notifications for task deadlines
- Mobile app development with React Native"

### 6. Learning Outcomes

"Building UniTrack taught me:
- Full-stack development with TypeScript
- Database design and security best practices
- State management patterns in React
- PWA development and deployment
- Authentication and authorization implementation
- Responsive design principles
- Performance optimization techniques"

---

## 💡 Key Achievements

1. **Full-Stack Development:** Built complete application from frontend to database
2. **Type Safety:** 100% TypeScript coverage with strict mode
3. **Security:** Implemented RLS and secure authentication
4. **UX Excellence:** Smooth animations and intuitive interface
5. **PWA Ready:** Installable with offline capabilities
6. **Responsive Design:** Works seamlessly on all devices
7. **Clean Code:** Modular architecture with reusable components
8. **Performance:** Optimized builds and efficient data fetching

---

## 📚 Resources & References

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Tools & Libraries
- [Vite](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Radix UI](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev)

### Learning Resources
- [React Patterns](https://reactpatterns.com)
- [Database Design](https://www.postgresql.org/docs)
- [PWA Guide](https://web.dev/progressive-web-apps)
- [Type Safety in React](https://www.totaltypescript.com)

---

## 🎓 Conclusion

UniTrack represents a comprehensive full-stack web application that demonstrates modern React development practices, database design, security implementation, and user experience design. The project showcases the ability to build complex, production-ready applications while maintaining clean code architecture and following best practices.

The application successfully addresses the problem of productivity tool fragmentation by providing an integrated solution that is both powerful and easy to use. With its solid technical foundation, UniTrack is well-positioned for future enhancements and scaling.

---

**Project Repository:** [GitHub](https://github.com/SkWasimAfrose/unitrack)  
**Developer Portfolio:** [whoiswasim.vercel.app](https://whoiswasim.vercel.app/)  
**Contact:** Sk Wasim Afrose
