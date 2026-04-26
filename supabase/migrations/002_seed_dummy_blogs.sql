-- Seed: 6 dummy blog posts
-- Run this in the Supabase SQL Editor or via supabase db push

INSERT INTO blogs (title, slug, content, thumbnail_url, author_name, metadata, published_at, created_at, updated_at)
VALUES

(
  'Building a Full-Stack App with Next.js 15 and Supabase',
  'nextjs-15-supabase-full-stack',
  E'Next.js 15 brings a wave of improvements that make full-stack development feel truly seamless. Combined with Supabase as your backend, you get authentication, a Postgres database, real-time subscriptions, and file storage — all in one platform.\n\n## Setting Up the Project\n\nStart by creating a new Next.js project with the App Router:\n\n```bash\nnpx create-next-app@latest my-app --typescript --tailwind --app\ncd my-app\nnpm install @supabase/ssr @supabase/supabase-js\n```\n\n## Configuring the Supabase Client\n\nCreate two clients — one for server components and one for client components. This separation is critical for correct cookie handling in the App Router.\n\n```ts\n// src/lib/supabase-server.ts\nimport { createServerClient } from "@supabase/ssr";\nimport { cookies } from "next/headers";\n\nexport async function createClient() {\n  const cookieStore = await cookies();\n  return createServerClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\n    { cookies: { get: (n) => cookieStore.get(n)?.value } }\n  );\n}\n```\n\n## Authentication with GitHub OAuth\n\nSupabase makes OAuth trivial. Call `signInWithOAuth` from the client and Supabase handles the full PKCE flow:\n\n```ts\nawait supabase.auth.signInWithOAuth({\n  provider: "github",\n  options: { redirectTo: `${origin}/auth/callback` }\n});\n```\n\n## Row Level Security\n\nAlways enable RLS on your tables. A typical policy for a blogs table:\n\n```sql\nCREATE POLICY "Public can read published blogs"\n  ON blogs FOR SELECT\n  USING (published_at IS NOT NULL AND published_at <= NOW());\n```\n\n## Conclusion\n\nNext.js 15 and Supabase form one of the most productive stacks available today. The combination of server components, edge functions, and a managed Postgres database lets small teams ship production-grade applications in days, not weeks.',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
  'Vikas Dhavande',
  '{"category": "Development", "tags": ["Next.js", "Supabase", "TypeScript"], "readingTime": 8}',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),

(
  'Mastering TypeScript: Advanced Patterns for Modern Apps',
  'mastering-typescript-advanced-patterns',
  E'TypeScript has evolved far beyond simple type annotations. Modern TypeScript empowers you to encode complex business logic directly into the type system, catching entire categories of bugs at compile time.\n\n## Discriminated Unions\n\nOne of the most powerful patterns in TypeScript is the discriminated union:\n\n```ts\ntype RequestState<T> =\n  | { status: "idle" }\n  | { status: "loading" }\n  | { status: "success"; data: T }\n  | { status: "error"; message: string };\n```\n\nThe compiler forces you to handle every case — making impossible states unrepresentable.\n\n## Template Literal Types\n\n```ts\ntype EventName = "click" | "focus" | "blur";\ntype Handler = `on${Capitalize<EventName>}`;\n// "onClick" | "onFocus" | "onBlur"\n```\n\n## Satisfies Operator\n\nThe `satisfies` operator validates a value against a type while preserving the most specific inferred type:\n\n```ts\nconst palette = {\n  red: [255, 0, 0],\n  green: "#00ff00",\n} satisfies Record<string, string | number[]>;\n```\n\n## Conditional Types\n\n```ts\ntype NonNullable<T> = T extends null | undefined ? never : T;\ntype ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\n```\n\n## Conclusion\n\nInvesting time in advanced TypeScript patterns pays dividends across the lifetime of a project. When your types encode your domain model accurately, refactoring becomes safer and bugs become less frequent.',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop',
  'Vikas Dhavande',
  '{"category": "TypeScript", "tags": ["TypeScript", "Patterns", "Best Practices"], "readingTime": 6}',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),

(
  'Designing a Premium Dark UI: Principles and Techniques',
  'designing-premium-dark-ui',
  E'Dark mode has become the default aesthetic for premium software products. Designing a dark UI that feels polished rather than flat requires a different mindset than light-mode design.\n\n## Use True Black Sparingly\n\nPure black (#000000) creates harsh contrast. Use very dark grays with subtle hue shifts:\n\n- Background: `hsl(222, 15%, 7%)`\n- Surface: `hsl(222, 13%, 11%)`\n- Elevated: `hsl(222, 12%, 15%)`\n\n## Layering with Elevation\n\nIn dark mode, elevation is communicated through lightness, not shadows:\n\n```css\n--layer-0: hsl(222, 15%, 7%);   /* page background */\n--layer-1: hsl(222, 13%, 11%);  /* cards */\n--layer-2: hsl(222, 12%, 15%);  /* tooltips */\n--layer-3: hsl(222, 11%, 20%);  /* active states */\n```\n\n## Typography for Dark Mode\n\nAvoid pure white text — use slightly off-white:\n\n```css\n--text-primary: hsl(210, 40%, 96%);\n--text-secondary: hsl(215, 20%, 65%);\n--text-muted: hsl(215, 15%, 45%);\n```\n\n## Glassmorphism Done Right\n\n```css\n.glass-card {\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  backdrop-filter: blur(12px);\n}\n```\n\n## Conclusion\n\nA premium dark UI is the result of dozens of small, deliberate decisions. The difference between a flat dark interface and a rich, premium one comes down to consistency, subtlety, and attention to elevation, contrast, and motion.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
  'Vikas Dhavande',
  '{"category": "Design", "tags": ["UI", "Dark Mode", "CSS", "Design Systems"], "readingTime": 7}',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days'
),

(
  'Cloud Architecture on AWS: A Practical Guide for Developers',
  'cloud-architecture-aws-practical-guide',
  E'Cloud architecture is not just about picking services — it is about designing systems that are resilient, scalable, and cost-efficient. This guide distils key patterns every developer should know before deploying to AWS.\n\n## The Well-Architected Framework\n\nAWS defines five pillars for good architecture:\n\n1. **Operational Excellence** — automate operations, collect metrics\n2. **Security** — apply least privilege, encrypt data at rest and in transit\n3. **Reliability** — design for failure, use multi-AZ\n4. **Performance Efficiency** — use managed services, right-size resources\n5. **Cost Optimisation** — pay for what you use\n\n## Stateless Services\n\nDesign your compute layer to be stateless so any instance can handle any request:\n\n- Store sessions in ElastiCache (Redis)\n- Store uploads in S3, not on the instance\n- Use environment variables for configuration\n\n## Event-Driven Architecture\n\n```\nUser Action → API Gateway → Lambda → SQS → Worker Lambda → DynamoDB\n```\n\n## Infrastructure as Code\n\n```ts\nconst bucket = new s3.Bucket(this, "AssetsBucket", {\n  encryption: s3.BucketEncryption.S3_MANAGED,\n  removalPolicy: cdk.RemovalPolicy.RETAIN,\n  versioned: true,\n});\n```\n\n## Conclusion\n\nGood cloud architecture is not built in a day. Start with the basics — stateless compute, managed databases, infrastructure as code — and evolve your architecture as your scale and requirements grow.',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
  'Vikas Dhavande',
  '{"category": "Cloud", "tags": ["AWS", "Architecture", "DevOps", "Infrastructure"], "readingTime": 9}',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days',
  NOW() - INTERVAL '14 days'
),

(
  'React Performance: From Slow to Blazing Fast',
  'react-performance-optimisation-guide',
  E'React is fast by default, but complex applications can accumulate performance debt quickly. Understanding how React renders and re-renders is the foundation of all optimisation work.\n\n## Understand the Render Cycle\n\nReact re-renders a component when:\n1. Its state changes\n2. Its props change\n3. Its parent re-renders\n4. A context it consumes changes\n\n## useMemo and useCallback\n\n```ts\nconst total = useMemo(() =>\n  items.reduce((sum, item) => sum + item.price, 0),\n[items]);\n\nconst handleClick = useCallback((id: string) => {\n  setSelected(id);\n}, []);\n```\n\n## Code Splitting\n\n```ts\nconst Dashboard = lazy(() => import("./pages/Dashboard"));\n\n<Suspense fallback={<Spinner />}>\n  <Dashboard />\n</Suspense>\n```\n\n## Virtualisation\n\n```ts\nimport { FixedSizeList } from "react-window";\n\n<FixedSizeList height={600} itemCount={items.length} itemSize={40}>\n  {({ index, style }) => (\n    <div style={style}>{items[index].name}</div>\n  )}\n</FixedSizeList>\n```\n\n## Conclusion\n\nPerformance optimisation is iterative. Measure first with the React DevTools Profiler, fix the top offender, and measure again. Do not guess — the bottleneck is almost never where you expect it.',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop',
  'Vikas Dhavande',
  '{"category": "React", "tags": ["React", "Performance", "JavaScript", "Optimisation"], "readingTime": 7}',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),

(
  'The DevOps Mindset: CI/CD, Docker, and GitHub Actions',
  'devops-cicd-docker-github-actions',
  E'DevOps is not a tool or a role — it is a culture of shared ownership. At its heart lies one practice that transforms teams: Continuous Integration and Continuous Deployment.\n\n## Docker Basics\n\n```dockerfile\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nCOPY --from=builder /app/.next/standalone ./\nEXPOSE 3000\nCMD ["node", "server.js"]\n```\n\n## GitHub Actions Pipeline\n\n```yaml\nname: Deploy\non:\n  push:\n    branches: [main]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: "20"\n          cache: "npm"\n      - run: npm ci\n      - run: npm run type-check\n      - run: npm run test\n      - run: npm run build\n      - name: Deploy to Vercel\n        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}\n```\n\n## Branch Strategy\n\n- `main` → production\n- `develop` → staging\n- Feature branches → preview deployments\n\n## Conclusion\n\nA solid CI/CD pipeline is one of the highest-leverage investments a team can make. It enforces code quality, eliminates deployment fear, and lets you ship features faster with more confidence.',
  'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&auto=format&fit=crop',
  'Vikas Dhavande',
  '{"category": "DevOps", "tags": ["Docker", "CI/CD", "GitHub Actions", "DevOps"], "readingTime": 8}',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '28 days'
)

ON CONFLICT (slug) DO NOTHING;
