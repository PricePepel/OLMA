import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security headers
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// Rate limiting function
function checkRateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const key = `rate_limit:${ip}`
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean up every minute

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  // Rate limiting
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // Create response with security headers
  let response = NextResponse.next({
    request,
  })

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add performance headers
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Middleware auth error:', error)
    }

    // Define route patterns
    const protectedRoutes = [
      '/dashboard',
      '/profile', 
      '/settings',
      '/clubs/create',
      '/events/create',
      '/messages'
    ]
    
    const authRoutes = [
      '/auth/signin', 
      '/auth/signup',
      '/auth/reset-password'
    ]
    
    const publicRoutes = [
      '/',
      '/about',
      '/contact',
      '/privacy',
      '/terms'
    ]

    const currentPath = request.nextUrl.pathname
    
    // Check if current path matches any route patterns
    const isProtectedRoute = protectedRoutes.some(route => 
      currentPath.startsWith(route)
    )
    const isAuthRoute = authRoutes.some(route => 
      currentPath.startsWith(route)
    )
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route
    )

    // API routes handling
    const isApiRoute = currentPath.startsWith('/api/')
    
    if (isApiRoute) {
      // Add CORS headers for API routes
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 200 })
      }
    }

    // Authentication logic
    if (isProtectedRoute && !user) {
      // Redirect unauthenticated users to sign in
      const redirectUrl = new URL('/auth/signin', request.url)
      redirectUrl.searchParams.set('redirectTo', currentPath)
      return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && user) {
      // Redirect authenticated users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user info to headers for server-side use
    if (user) {
      response.headers.set('X-User-ID', user.id)
      response.headers.set('X-User-Email', user.email || '')
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // Return error response for critical errors
    if (error instanceof Error && error.message.includes('auth')) {
      return new NextResponse('Authentication Error', { status: 401 })
    }
    
    // For other errors, continue with the request
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
