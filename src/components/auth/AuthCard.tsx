'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Account, ID, OAuthProvider } from 'appwrite'
import { motion, AnimatePresence } from 'framer-motion'
import { client } from '@/lib/appwrite'

type Tab = 'sign-in' | 'sign-up'

interface AuthCardProps {
  defaultTab?: Tab
}

const account = new Account(client)

function friendlyError(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong. Please try again.'
  const msg = err.message.toLowerCase()
  if (msg.includes('invalid credentials')) return 'Incorrect email or password.'
  if (msg.includes('already exists') || msg.includes('email already')) return 'An account with this email already exists.'
  if (msg.includes('password must')) return 'Password must be at least 8 characters.'
  return err.message
}

export default function AuthCard({ defaultTab = 'sign-in' }: AuthCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [tab, setTab] = useState<Tab>(defaultTab)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchTab = useCallback((next: Tab) => {
    setTab(next)
    setError('')
  }, [])

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await account.createEmailPasswordSession({ email, password })
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name: name.trim() || undefined,
      })
      await account.createEmailPasswordSession({ email, password })
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleGoogleOAuth() {
    const successUrl = `${window.location.origin}${redirectTo}`
    const failureUrl = `${window.location.origin}/sign-in`
    account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl)
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">

        {/* Tabs */}
        <div className="relative flex rounded-lg bg-muted p-1 text-sm font-medium">
          {(['sign-in', 'sign-up'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={`relative z-10 flex-1 rounded-md py-1.5 transition-colors duration-200 ${
                tab === t ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'sign-in' ? 'Sign in' : 'Sign up'}
              {tab === t && (
                <motion.span
                  layoutId="auth-tab-indicator"
                  className="absolute inset-0 -z-10 rounded-md bg-background shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'sign-in' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'sign-in' ? 12 : -12 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'sign-in' ? (
              <form
                onSubmit={handleSignIn}
                data-mcp-action="user-sign-in"
                data-mcp-description="Authenticate an existing user account with email and password"
                data-mcp-params='{"required": ["email", "password"]}'
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="signin-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </label>
                  <input
                    id="signin-email"
                    type="email"
                    name="email"
                    data-mcp-param="email"
                    data-mcp-description="User account email address"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signin-password" className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    name="password"
                    data-mcp-param="password"
                    data-mcp-description="User account password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleSignUp}
                data-mcp-action="user-sign-up"
                data-mcp-description="Register a new user account with name, email, and password"
                data-mcp-params='{"required": ["email", "password"], "optional": ["name"]}'
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label htmlFor="signup-name" className="text-xs font-semibold text-foreground">
                    Full Name <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    data-mcp-param="name"
                    data-mcp-description="User display name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    data-mcp-param="email"
                    data-mcp-description="User account email address"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    name="password"
                    data-mcp-param="password"
                    data-mcp-description="User account password (minimum 8 characters)"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Creating account…' : 'Sign up'}
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleOAuth}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Footer toggle */}
        <p className="text-center text-xs text-muted-foreground">
          {tab === 'sign-in' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => switchTab('sign-up')} className="font-semibold text-primary hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => switchTab('sign-in')} className="font-semibold text-primary hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
