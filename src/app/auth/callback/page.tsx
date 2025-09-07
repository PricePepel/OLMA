'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          toast.error('Authentication failed')
          setTimeout(() => router.push('/auth/signin'), 3000)
          return
        }

        if (data.session) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, full_name, username')
            .eq('id', data.session.user.id)
            .single()

          if (profileError || !profile) {
            // Try to create profile from auth user data
            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email || '',
                full_name: data.session.user.user_metadata?.full_name || '',
                username: data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0] || 'user',
              })

            if (createError) {
              // If still can't create profile, redirect to profile setup
              setStatus('success')
              setMessage('Account created! Setting up your profile...')
              toast.success('Account created successfully!')
              setTimeout(() => router.push('/profile'), 2000)
            } else {
              // Profile created successfully, redirect to dashboard
              setStatus('success')
              setMessage('Welcome! Redirecting to dashboard...')
              toast.success('Signed in successfully!')
              setTimeout(() => router.push('/dashboard'), 2000)
            }
          } else {
            // Profile exists, redirect to dashboard
            setStatus('success')
            setMessage('Welcome back! Redirecting to dashboard...')
            toast.success('Signed in successfully!')
            setTimeout(() => router.push('/dashboard'), 2000)
          }
        } else {
          setStatus('error')
          setMessage('No session found. Please try signing in again.')
          toast.error('Authentication failed')
          setTimeout(() => router.push('/auth/signin'), 3000)
        }
      } catch (error) {
        setStatus('error')
        setMessage('An unexpected error occurred.')
        toast.error('Authentication failed')
        setTimeout(() => router.push('/auth/signin'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Authentication</CardTitle>
          <CardDescription className="text-center">
            Processing your sign-in...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-center text-muted-foreground">
                  Verifying your account...
                </p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-center text-green-600 font-medium">
                  {message}
                </p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-center text-red-600 font-medium">
                  {message}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Authentication</CardTitle>
            <CardDescription className="text-center">
              Processing your sign-in...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Loading...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
