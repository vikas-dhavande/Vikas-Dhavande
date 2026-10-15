'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Account, ID } from 'appwrite'
import { client } from '@/lib/appwrite'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
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
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name: name.trim() || undefined,
      })
      await account.createEmailPasswordSession({ email, password })
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        data-mcp-action="user-sign-up"
        data-mcp-description="Register a new user account with name, email, and password"
        data-mcp-params='{"required": ["email", "password"], "optional": ["name"]}'
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-xs text-muted-foreground">Sign up to get access to custom features</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="signup-name" className="text-xs font-semibold text-foreground">
            Full Name
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
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
