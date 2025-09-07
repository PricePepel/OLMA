'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useApi } from '@/hooks/use-api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  User,
  Users,
  Trophy,
  Star
} from 'lucide-react'

interface CurrencyTransaction {
  id: string
  amount: number
  currency_type: string
  transaction_type: string
  description: string
  reference_type?: string
  created_at: string
  club?: {
    id: string
    name: string
  }
}

export function CurrencyComponent() {
  const { user, profile } = useAuth()

  // Fetch currency transactions
  const { data: transactions, isLoading: transactionsLoading } = useApi<CurrencyTransaction[]>({
    url: '/api/currency/transactions',
    enabled: !!user
  })

  const getTransactionIcon = (type: string, referenceType?: string) => {
    switch (referenceType) {
      case 'skill_teaching':
        return <User className="h-4 w-4 text-green-600" />
      case 'event_attendance':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-600" />
      case 'level_up':
        return <Star className="h-4 w-4 text-purple-600" />
      default:
        return type === 'earned' ? 
          <ArrowUpRight className="h-4 w-4 text-green-600" /> : 
          <ArrowDownRight className="h-4 w-4 text-red-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    return type === 'earned' ? 'text-green-600' : 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+${amount}` : `${amount}`
  }

  const getTransactionTypeLabel = (type: string, referenceType?: string) => {
    switch (referenceType) {
      case 'skill_teaching':
        return 'Skill Teaching'
      case 'event_attendance':
        return 'Event Attendance'
      case 'achievement':
        return 'Achievement Reward'
      case 'level_up':
        return 'Level Up Bonus'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const TransactionCard = ({ transaction }: { transaction: CurrencyTransaction }) => {
    return (
      <Card className="card-hover">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex-shrink-0">
            {getTransactionIcon(transaction.transaction_type, transaction.reference_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">
                  {getTransactionTypeLabel(transaction.transaction_type, transaction.reference_type)}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {transaction.description}
                </p>
                {transaction.club && (
                  <p className="text-xs text-muted-foreground">
                    Club: {transaction.club.name}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                  {formatAmount(transaction.amount)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {transaction.currency_type}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDate(transaction.created_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TransactionSkeleton = () => (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <Skeleton className="h-4 w-4" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </CardContent>
    </Card>
  )

  const personalBalance = profile?.personal_currency || 0
  const recentTransactions = transactions?.slice(0, 10) || []
  const earnedThisMonth = transactions?.filter(t => 
    t.transaction_type === 'earned' && 
    new Date(t.created_at).getMonth() === new Date().getMonth()
  ).reduce((sum, t) => sum + t.amount, 0) || 0

  return (
    <div className="space-y-6">
      {/* Currency Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{personalBalance}</p>
              <p className="text-sm text-muted-foreground">Personal Balance</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{earnedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Earned This Month</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile?.level || 1}</p>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your recent currency transactions and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">
                Start participating in the community to earn currency!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currency Info */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Currency</CardTitle>
          <CardDescription>
            Ways to earn and spend your personal currency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Earning Currency</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Teaching skills to others</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Attending events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Earning achievements</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Leveling up</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">Spending Currency</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Learning skills from others</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Joining premium clubs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Purchasing cosmetics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Special features</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

