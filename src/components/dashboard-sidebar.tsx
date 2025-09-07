'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Home,
  Users,
  Calendar,
  MessageSquare,
  MapPin,
  Trophy,
  Settings,
  BookOpen,
  ShoppingCart,
  BarChart3,
  Shield,
  Globe,
  User,
  Bell,
  Flag,
  Coins
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    title: 'Skills',
    href: '/dashboard/skills',
    icon: BookOpen,
  },
  {
    title: 'Find Teachers',
    href: '/dashboard/find-teachers',
    icon: Users,
  },
  {
    title: 'Offers',
    href: '/dashboard/offers',
    icon: BookOpen,
  },
  {
    title: 'Events',
    href: '/dashboard/events',
    icon: Calendar,
  },
  {
    title: 'Clubs',
    href: '/dashboard/clubs',
    icon: Users,
  },
  {
    title: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    title: 'Currency',
    href: '/dashboard/currency',
    icon: Coins,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: Flag,
  },
  {
    title: 'Leaderboard',
    href: '/dashboard/leaderboard',
    icon: Trophy,
  },
  {
    title: 'Shop',
    href: '/dashboard/shop',
    icon: ShoppingCart,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary text-secondary-foreground'
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
      
      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-medium">OLMA</p>
            <p className="text-xs text-muted-foreground">v0.1.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

