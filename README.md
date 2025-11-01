# UCU Event Nav

A professional web application for discovering and navigating events at Uganda Christian University's Faculty of Engineering, Design and Technology.

## Features

- **Authentication**: Secure login/signup with email verification and password reset
- **Role-Based Access Control**: Department admins vs. student users with distinct privileges
- **Event Discovery**: Browse, search, and filter events by department and time
- **Event Sign-Ups**: Integrated Google Forms for RSVP
- **Notifications**: Browser-based reminders 1 hour before events
- **Admin Dashboard**: Event approval and management for authorized admins
- **Offline Support**: Cached data and offline detection with graceful degradation
- **Location Information**: Venue details with external Google Maps links (interactive navigation coming soon)

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Backend**: Supabase (Auth, Database, RLS)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ucu-event-nav
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:

The following variables are already configured in Vercel:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_deployment_url
\`\`\`

For local development, create a `.env.local` file with these values.

4. Run database migrations:

Execute the SQL scripts in the `scripts/` folder in order:
- `001_create_events_table.sql`
- `002_create_profiles_table.sql`
- `003_admin_policies.sql`
- `004_seed_sample_events.sql` (run AFTER creating your first user account)
- `007_setup_role_based_access.sql` (**CRITICAL** - fixes RLS bug and enables admin system)

**Important**: 
- Create at least one user account via signup before running the seed script to avoid foreign key constraint errors.
- Script 007 MUST be run to fix the "infinite recursion detected in policy" error and enable the department admin system.

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables (already set up in this project)
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
\`\`\`bash
npm i -g vercel
\`\`\`

2. Login to Vercel:
\`\`\`bash
vercel login
\`\`\`

3. Deploy:
\`\`\`bash
vercel
\`\`\`

4. For production deployment:
\`\`\`bash
vercel --prod
\`\`\`

## Authentication & Access Control System

### Role-Based Access

The application implements a two-tier access control system:

#### Department Admins (3 Designated Users)
Only these email addresses have admin privileges:
- `wasikejamesdaniel@gmail.com` - Admin 1
- `wjdaniel379@gmail.com` - Admin 2
- `trizzydaniels352@gmail.com` - Admin 3

**Admin Capabilities:**
- Create events (published immediately as "approved")
- Edit any event
- Delete events
- Access admin dashboard
- View all user profiles
- Full event management privileges

#### Students (All Other Users)
Any valid email address can sign up as a student user.

**Student Capabilities:**
- Browse all approved events
- Search and filter events
- View event details
- Enable notifications
- Access offline cached events
- **Cannot** create, edit, or delete events

### Security Layers

Access control is enforced at three levels:

1. **Frontend**: UI elements hidden from non-admins (UX layer)
2. **Server Routes**: Role validation before page access (middleware layer)
3. **Database RLS**: Supabase Row Level Security policies (data layer - most critical)

This ensures that even if someone bypasses the UI, they cannot perform unauthorized actions.

### Open Sign-Up with Email Verification

- **Open Registration**: Users can register with any valid email address
- **Email Verification**: All new accounts require email verification for security
- **Automatic Role Assignment**: 
  - If email matches admin list → assigned 'admin' role
  - All other emails → assigned 'student' role
- **Password Reset**: Secure password recovery via email link

### Modifying Admin List

To change which emails have admin access:

1. Update `lib/config/admins.ts`:
\`\`\`typescript
export const DEPARTMENT_ADMINS = [
  'newemail1@example.com',
  'newemail2@example.com',
  'newemail3@example.com',
]
\`\`\`

2. Update the database trigger in `scripts/007_setup_role_based_access.sql`:
\`\`\`sql
IF user_email IN (
  'newemail1@example.com',
  'newemail2@example.com',
  'newemail3@example.com'
) THEN
  user_role := 'admin';
\`\`\`

3. Re-run script 007 in Supabase SQL editor
4. Redeploy the application to Vercel

### Password Reset Flow

1. Click "Forgot Password?" on the login page
2. Enter your email address
3. Check your email for the reset link
4. Click the link and enter your new password
5. Login with your new credentials

## Project Structure

\`\`\`
ucu-event-nav/
├── app/
│   ├── admin/              # Admin dashboard (protected route)
│   ├── auth/               # Authentication pages
│   ├── events/             # Event pages
│   │   ├── create/         # Create event (admin only)
│   │   └── [id]/           # Event details
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── admin/              # Admin components
│   ├── events/             # Event components
│   ├── notifications/      # Notification components
│   ├── offline/            # Offline components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── config/             # Configuration (admin list)
│   ├── supabase/           # Supabase clients
│   ├── utils/              # Utility functions
│   └── types.ts            # TypeScript types
├── scripts/                # Database migration scripts
└── public/                 # Static assets (including UCU logo)
\`\`\`

## Database Schema

### Events Table
- `id`: UUID (Primary Key)
- `title`: Text
- `description`: Text
- `department`: Enum (Computing and Technology, Visual Art and Design, Engineering)
- `date`: Timestamp
- `venue`: Text
- `latitude`, `longitude`: Decimal (optional)
- `google_form_url`: Text (optional)
- `status`: Enum (pending, approved, rejected)
- `created_by`: UUID (Foreign Key to auth.users)
- `created_at`, `updated_at`: Timestamp

### Profiles Table
- `id`: UUID (Primary Key, Foreign Key to auth.users)
- `email`: Text
- `full_name`: Text
- `role`: Enum (student, admin)
- `department`: Text (optional, for admin tracking)
- `created_at`, `updated_at`: Timestamp

## Troubleshooting

### "Infinite Recursion Detected in Policy" Error

**Cause**: RLS policy on profiles table queries itself, creating infinite loop.

**Solution**: Run `scripts/007_setup_role_based_access.sql`. This script:
- Creates a helper function `is_admin()` to prevent recursion
- Updates all RLS policies to use the function
- Implements the 3-admin system with hardcoded emails
- Fixes role assignments

### Foreign Key Constraint Error

If you see this error when running the seed script:
\`\`\`
insert or update on table "events" violates foreign key constraint "events_created_by_fkey"
\`\`\`

**Solution**: This means no users exist in the database yet. Create a user account via the signup page first, then run the seed script again.

### Users Can't Create Events

**Possible Causes:**
1. User email is not in the DEPARTMENT_ADMINS list
2. Script 007 hasn't been executed
3. User role is 'student' instead of 'admin'

**Solution**:
- Verify email is in `lib/config/admins.ts`
- Check user role in Supabase profiles table
- Ensure script 007 has been run
- Try logging out and back in

### Authentication Issues

- Verify Supabase environment variables are set correctly
- Check that redirect URLs include your domain in Supabase dashboard
- Ensure email confirmation is enabled in Supabase Auth settings

### Events Not Loading

- Confirm database migrations have been run successfully (especially script 007)
- Check that at least one approved event exists
- Verify RLS policies are enabled on the events table
- Clear browser cache and localStorage

## Security

- Row Level Security (RLS) enabled on all tables
- Email verification required for all new accounts
- Password reset via secure Supabase tokens
- Three-layer access control (UI, routes, database)
- Hardcoded admin list prevents privilege escalation
- Secure API key management via environment variables
- Input validation on all forms

## Future Enhancements

### Interactive Campus Navigation (Planned)

Interactive campus navigation with GPS-based directions will be added in a future update when resources are available.

### Potential Admin System Improvements

- Move admin list to database table for easier management
- Add admin invitation system
- Implement department-specific admin permissions
- Add audit logs for admin actions

## Quality Checklist

- ✅ Responsive design (mobile and desktop)
- ✅ Offline support with caching
- ✅ Browser notifications
- ✅ Error handling and user feedback
- ✅ Loading states and skeletons
- ✅ Accessibility (WCAG guidelines)
- ✅ Type safety with TypeScript
- ✅ Security with RLS and input validation
- ✅ Performance optimization (code splitting, lazy loading)
- ✅ Role-based access control
- ✅ Three-layer security enforcement

## Support

For issues or questions, please contact the development team or open an issue in the repository.

## License

This project is proprietary to Uganda Christian University.
