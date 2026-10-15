import { Suspense } from 'react'
import AuthCard from '@/components/auth/AuthCard'

export default function SignInPage() {
  return (
    <Suspense>
      <AuthCard defaultTab="sign-in" />
    </Suspense>
  )
}
