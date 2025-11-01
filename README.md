# UCU Event Nav

A professional web application for discovering and navigating events at Uganda Christian University's Faculty of Engineering, Design and Technology.

## Features

- **Authentication**: Secure login/signup restricted to @ucu.ac.ug email domains
- **Event Discovery**: Browse, search, and filter events by department and time
- **Event Sign-Ups**: Integrated Google Forms for RSVP
- **Notifications**: Browser-based reminders 1 hour before events
- **Admin Dashboard**: Role-based access for event approval and management
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

**Important**: Create at least one user account via signup before running the seed script to avoid foreign key constraint errors.

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

## Project Structure

\`\`\`
ucu-event-nav/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Authentication pages
│   ├── events/             # Event pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── admin/              # Admin components
│   ├── events/             # Event components
│   ├── notifications/      # Notification components
│   ├── offline/            # Offline components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── utils/              # Utility functions
│   └── types.ts            # TypeScript types
├── scripts/                # Database migration scripts
└── public/                 # Static assets
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
- `role`: Enum (user, admin)
- `created_at`, `updated_at`: Timestamp

## Troubleshooting

### Foreign Key Constraint Error

If you see this error when running the seed script:
\`\`\`
insert or update on table "events" violates foreign key constraint "events_created_by_fkey"
\`\`\`

**Solution**: This means no users exist in the database yet. Create a user account via the signup page first, then run the seed script again.

### Authentication Issues

- Verify Supabase environment variables are set correctly
- Check that redirect URLs include your domain in Supabase dashboard
- Ensure email confirmation is enabled in Supabase Auth settings

### Events Not Loading

- Confirm database migrations have been run successfully
- Check that at least one approved event exists
- Verify RLS policies are enabled on the events table

## Security

- Row Level Security (RLS) enabled on all tables
- Email domain validation (@ucu.ac.ug only)
- Role-based access control for admin features
- Secure API key management via environment variables

## Future Enhancements

### Interactive Campus Navigation (Planned)

Interactive campus navigation with GPS-based directions will be added in a future update when resources are available.

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

## Support

For issues or questions, please contact the development team or open an issue in the repository.

## License

This project is proprietary to Uganda Christian University.
