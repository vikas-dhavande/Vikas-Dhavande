import { Suspense } from 'react'
import AuthCard from '@/components/auth/AuthCard'

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthCard defaultTab="sign-up" />
    </Suspense>
  )
}
