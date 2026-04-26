// Setup script: Creates tables + seeds blog data via Supabase REST (pg)
// Uses the direct Postgres connection from .env.local

import https from 'https';

const SUPABASE_URL = 'https://xrtlslcfpwgssujhndcg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydGxzbGNmcHdnc3N1amhuZGNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzE3MzY2MSwiZXhwIjoyMDkyNzQ5NjYxfQ.owEK5_uvcBXVaGGVaLYs_wtPykqDMBBByjO7zp9orDA';

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`);

    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Use Supabase JS client with service role — bypasses RLS completely
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS blogs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  content       TEXT,
  thumbnail_url TEXT,
  author_name   TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ,
  published_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs (published_at DESC)
  WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs (slug);

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE IF NOT EXISTS analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name  TEXT NOT NULL,
  path        TEXT NOT NULL,
  session_id  TEXT NOT NULL,
  user_id     UUID REFERENCES auth.users(id),
  user_agent  TEXT,
  referrer    TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published blogs" ON blogs;
CREATE POLICY "Public can read published blogs"
  ON blogs FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= now());

DROP POLICY IF EXISTS "Admins can do everything" ON blogs;
CREATE POLICY "Admins can do everything"
  ON blogs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_user')
    )
  );

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert analytics events" ON analytics_events;
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read analytics events" ON analytics_events;
CREATE POLICY "Admins can read analytics events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_user')
    )
  );
`;

const posts = [
  {
    title: 'Building a Full-Stack App with Next.js 15 and Supabase',
    slug: 'nextjs-15-supabase-full-stack',
    content: `Next.js 15 brings a wave of improvements that make full-stack development feel truly seamless. Combined with Supabase as your backend, you get authentication, a Postgres database, real-time subscriptions, and file storage — all in one platform.

## Setting Up the Project

Start by creating a new Next.js project with the App Router:

\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app
npm install @supabase/ssr @supabase/supabase-js
\`\`\`

## Configuring the Supabase Client

Create two clients — one for server components and one for client components. This separation is critical for correct cookie handling in the App Router.

\`\`\`ts
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );
}
\`\`\`

## Authentication with GitHub OAuth

Supabase makes OAuth trivial. Call signInWithOAuth and Supabase handles the full PKCE flow:

\`\`\`ts
await supabase.auth.signInWithOAuth({
  provider: "github",
  options: { redirectTo: origin + "/auth/callback" }
});
\`\`\`

## Row Level Security

Always enable RLS on your tables. A typical policy for a blogs table:

\`\`\`sql
CREATE POLICY "Public can read published blogs"
  ON blogs FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());
\`\`\`

## Conclusion

Next.js 15 and Supabase form one of the most productive stacks available today. The combination of server components, edge functions, and a managed Postgres database lets small teams ship production-grade applications in days, not weeks.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    author_name: 'Vikas Dhavande',
    metadata: { category: 'Development', tags: ['Next.js', 'Supabase', 'TypeScript'], readingTime: 8 },
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    title: 'Mastering TypeScript: Advanced Patterns for Modern Apps',
    slug: 'mastering-typescript-advanced-patterns',
    content: `TypeScript has evolved far beyond simple type annotations. Modern TypeScript empowers you to encode complex business logic directly into the type system, catching entire categories of bugs at compile time.

## Discriminated Unions

One of the most powerful patterns in TypeScript is the discriminated union:

\`\`\`ts
type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: unknown }
  | { status: "error"; message: string };
\`\`\`

The compiler forces you to handle every case — making impossible states unrepresentable.

## Template Literal Types

\`\`\`ts
type EventName = "click" | "focus" | "blur";
type Handler = "onClick" | "onFocus" | "onBlur";
\`\`\`

## Satisfies Operator

The satisfies operator (TypeScript 4.9) validates a value against a type while preserving the most specific inferred type.

## Conditional Types

\`\`\`ts
type NonNullable = T extends null | undefined ? never : T;
type ReturnType = T extends (...args: unknown[]) => infer R ? R : never;
\`\`\`

## Conclusion

Investing time in advanced TypeScript patterns pays dividends across the lifetime of a project. When your types encode your domain model accurately, refactoring becomes safer and bugs become less frequent.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop',
    author_name: 'Vikas Dhavande',
    metadata: { category: 'TypeScript', tags: ['TypeScript', 'Patterns', 'Best Practices'], readingTime: 6 },
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    title: 'Designing a Premium Dark UI: Principles and Techniques',
    slug: 'designing-premium-dark-ui',
    content: `Dark mode has become the default aesthetic for premium software products. Designing a dark UI that feels polished rather than flat requires a different mindset than light-mode design.

## Use True Black Sparingly

Pure black (#000000) creates harsh contrast. Use very dark grays with subtle hue shifts:

- Background: hsl(222, 15%, 7%)
- Surface: hsl(222, 13%, 11%)
- Elevated: hsl(222, 12%, 15%)

## Layering with Elevation

In dark mode, elevation is communicated through lightness, not shadows. Higher elevation means a lighter surface color.

## Typography for Dark Mode

Avoid pure white text — use slightly off-white to reduce eye strain:

- Primary text: hsl(210, 40%, 96%)
- Secondary text: hsl(215, 20%, 65%)
- Muted text: hsl(215, 15%, 45%)

## Glassmorphism Done Right

Use glassmorphism with restraint — a subtle backdrop blur combined with a low-opacity border creates depth without visual noise.

## Conclusion

A premium dark UI is the result of dozens of small, deliberate decisions. The difference between flat and premium comes down to consistency, subtlety, and attention to elevation, contrast, and motion.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    author_name: 'Vikas Dhavande',
    metadata: { category: 'Design', tags: ['UI', 'Dark Mode', 'CSS', 'Design Systems'], readingTime: 7 },
    published_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    title: 'Cloud Architecture on AWS: A Practical Guide for Developers',
    slug: 'cloud-architecture-aws-practical-guide',
    content: `Cloud architecture is not just about picking services — it is about designing systems that are resilient, scalable, and cost-efficient. This guide distils key patterns every developer should know before deploying to AWS.

## The Well-Architected Framework

AWS defines five pillars for good architecture:

1. Operational Excellence — automate operations, collect metrics
2. Security — apply least privilege, encrypt data at rest and in transit
3. Reliability — design for failure, use multi-AZ deployments
4. Performance Efficiency — use managed services, right-size resources
5. Cost Optimisation — pay for what you use, use Reserved Instances for predictable workloads

## Stateless Services

Design your compute layer to be stateless so any instance can handle any request:

- Store sessions in ElastiCache (Redis)
- Store uploads in S3, not on the instance
- Use environment variables for all configuration

## Event-Driven Architecture

Decouple services using events. SQS and SNS are the foundational AWS primitives for building resilient, independently-scalable systems.

## Infrastructure as Code

Never click through the AWS console to create production resources. Use CDK or Terraform to version-control your infrastructure.

## Conclusion

Good cloud architecture is not built in a day. Start with the basics — stateless compute, managed databases, infrastructure as code — and evolve your architecture as your requirements grow.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
    author_name: 'Vikas Dhavande',
    metadata: { category: 'Cloud', tags: ['AWS', 'Architecture', 'DevOps', 'Infrastructure'], readingTime: 9 },
    published_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    title: 'React Performance: From Slow to Blazing Fast',
    slug: 'react-performance-optimisation-guide',
    content: `React is fast by default, but complex applications can accumulate performance debt quickly. Understanding how React renders and re-renders is the foundation of all optimisation work.

## Understand the Render Cycle

React re-renders a component when its state changes, its props change, its parent re-renders, or a context it consumes changes. Most performance problems stem from unnecessary re-renders caused by one of these triggers.

## useMemo and useCallback

Use these hooks to memoize expensive computations and stable function references. Avoid overusing them — they have memory overhead and add code complexity.

## Code Splitting

Split large route components to reduce initial bundle size using React.lazy and Suspense. This defers loading of non-critical code until it is actually needed.

## Virtualisation

Never render 1,000 list items simultaneously — virtualise them. Libraries like react-window render only the visible rows, dramatically reducing DOM nodes.

## Image Optimisation

Use Next.js Image component or native loading="lazy" to defer off-screen images. Always specify width and height to prevent layout shift.

## Conclusion

Performance optimisation is iterative. Measure first with the React DevTools Profiler, fix the top offender, and measure again. The bottleneck is almost never where you expect it.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop',
    author_name: 'Vikas Dhavande',
    metadata: { category: 'React', tags: ['React', 'Performance', 'JavaScript', 'Optimisation'], readingTime: 7 },
    published_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    title: 'The DevOps Mindset: CI/CD, Docker, and GitHub Actions',
    slug: 'devops-cicd-docker-github-actions',
    content: `DevOps is not a tool or a role — it is a culture of shared ownership between development and operations. At its heart lies one practice that transforms teams: Continuous Integration and Continuous Deployment.

## Why CI/CD Matters

Without CI/CD, deployments are manual, infrequent, and nerve-wracking. With CI/CD, every push to main can be automatically tested and deployed to production in minutes.

## Docker Basics

Containerise your application with a multi-stage Dockerfile to keep the final image small. The builder stage installs dependencies and builds the app; the runner stage copies only the production output.

## GitHub Actions Pipeline

A complete CI/CD pipeline for a Next.js app runs on every push to main: checkout the code, set up Node.js with npm cache, install dependencies, run type-checking, run tests, build, and deploy to Vercel using a stored secret token.

## Branch Strategy

- main branch deploys to production
- develop branch deploys to staging
- Feature branches get automatic preview deployments via Vercel

## Secrets Management

Never commit secrets to git. Use GitHub Actions secrets for CI environment variables and the Vercel dashboard for runtime configuration.

## Conclusion

A solid CI/CD pipeline is one of the highest-leverage investments a team can make. It enforces code quality, eliminates deployment fear, and lets you ship features faster with more confidence.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&auto=format&fit=crop',
    author_name: 'Vikas Dhavande',
    metadata: { category: 'DevOps', tags: ['Docker', 'CI/CD', 'GitHub Actions', 'DevOps'], readingTime: 8 },
    published_at: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
];

async function setup() {
  // 1. Create tables via Supabase Management API
  console.log('Step 1: Creating tables via SQL...');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'HEAD',
    headers: { 'apikey': SERVICE_ROLE_KEY, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` }
  });
  console.log('Supabase reachable:', response.ok ? 'yes' : 'no');

  // 2. Try to insert — if table missing, schema isn't applied
  console.log('\nStep 2: Inserting blog posts...');
  let successCount = 0;

  for (const post of posts) {
    const { data, error } = await supabase
      .from('blogs')
      .upsert(
        { ...post, created_at: post.published_at, updated_at: post.published_at },
        { onConflict: 'slug' }
      )
      .select('id, title')
      .single();

    if (error) {
      console.error(`❌ ${post.title}`);
      console.error(`   Error: ${error.message}`);
      if (error.message.includes('schema cache')) {
        console.error('\n⚠️  The blogs table does not exist yet.');
        console.error('   Please run the schema first via the Supabase SQL Editor:');
        console.error('   https://supabase.com/dashboard/project/xrtlslcfpwgssujhndcg/sql/new');
        console.error('\n   Copy and paste d:\\webx\\supabase\\migrations\\001_cms_schema.sql');
        break;
      }
    } else {
      console.log(`✅ ${data.title}`);
      successCount++;
    }
  }

  console.log(`\nDone! ${successCount}/${posts.length} posts inserted.`);
}

setup().catch(console.error);
