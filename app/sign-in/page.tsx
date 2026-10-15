'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Account } from 'appwrite'
import { client } from '@/lib/appwrite'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const account = new Account(client)
      await account.createEmailPasswordSession({ email, password })
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        data-mcp-action="user-sign-in"
        data-mcp-description="Authenticate an existing user account with email and password"
        data-mcp-params='{"required": ["email", "password"]}'
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-xs text-muted-foreground">Enter your credentials below to access your account</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

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

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
