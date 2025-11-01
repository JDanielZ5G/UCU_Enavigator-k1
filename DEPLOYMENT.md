# Deployment Guide for UCU Event Nav

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code must be in a GitHub repository
3. **Supabase Project**: Already configured with environment variables

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure all code is committed and pushed to GitHub:

\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### 2. Deploy to Vercel

#### Method A: Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
6. Environment variables are already configured in your project
7. Click "Deploy"

#### Method B: Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
\`\`\`

### 3. Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., events.ucu.ac.ug)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

### 4. Configure Supabase Redirect URLs

1. Go to your Supabase dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Vercel deployment URLs:
   - `http://localhost:3000/**` (for local development)
   - `https://your-app.vercel.app/**` (your production URL)
   - `https://*.vercel.app/**` (for preview deployments)

### 5. Run Database Migrations

Execute SQL scripts in Supabase dashboard in order:

1. `scripts/001_create_events_table.sql`
2. `scripts/002_create_profiles_table.sql`
3. `scripts/003_admin_policies.sql`

**Important**: Before running the seed script, create at least one user account via the signup page.

4. `scripts/004_seed_sample_events.sql` (optional - run AFTER creating a user)

### 6. Create Admin User

1. Sign up with a @ucu.ac.ug email on your deployed site
2. Verify your email via the confirmation link
3. In Supabase dashboard SQL Editor, run:

\`\`\`sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@ucu.ac.ug';
\`\`\`

### 7. Test Deployment

1. Visit your deployed URL
2. Test authentication (sign up/login)
3. Test event creation
4. Test admin dashboard (if admin)
5. Test offline functionality
6. Test notifications
7. Test location information and external Google Maps links

## Environment Variables

All required environment variables are already configured in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (set to your deployment URL)

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Monitoring

1. **Analytics**: Enabled via @vercel/analytics
2. **Logs**: View in Vercel Dashboard → Deployments → Logs
3. **Performance**: Check Vercel Speed Insights

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Ensure all dependencies are in package.json
- Verify TypeScript has no errors: `npm run build` locally

### Authentication Issues

- Verify Supabase environment variables
- Check redirect URLs in Supabase dashboard
- Ensure email confirmation is configured

### Database Errors

**Foreign Key Constraint Error**:
\`\`\`
insert or update on table "events" violates foreign key constraint "events_created_by_fkey"
\`\`\`
**Solution**: Create a user account first before running the seed script (004_seed_sample_events.sql).

**RLS Policy Errors**:
- Verify RLS policies are created (run scripts 001-003)
- Check that you're authenticated when accessing protected data
- Ensure admin role is set correctly for admin operations

### Events Not Displaying

- Verify database migrations completed successfully
- Check that approved events exist in the database
- Review browser console for errors
- Confirm Supabase connection is active

## Performance Optimization

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js
3. **Caching**: Configured for offline support
4. **CDN**: Automatic with Vercel Edge Network

## Security Checklist

- ✅ Environment variables secured
- ✅ RLS policies enabled
- ✅ Email domain validation
- ✅ HTTPS enforced
- ✅ CORS configured

## Backup Strategy

1. **Database**: Supabase automatic backups
2. **Code**: GitHub repository
3. **Environment Variables**: Documented and backed up

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs
3. Contact development team
4. Open GitHub issue

## Post-Deployment

1. Monitor error rates
2. Check user feedback
3. Review analytics
4. Plan feature updates
5. Schedule maintenance windows
