'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  FileText, 
  MessageSquare, 
  User,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface ModerationStats {
  total_reports: number
  open_reports: number
  resolved_reports: number
  banned_users: number
  hidden_content: number
  reports_by_type?: Array<{
    type: string
    count: number
  }>
  reports_by_status?: Array<{
    status: string
    count: number
  }>
  reports_timeline?: Array<{
    date: string
    count: number
  }>
}

interface ModerationStatsProps {
  stats: ModerationStats | null
  isLoading: boolean
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function ModerationStats({ stats, isLoading }: ModerationStatsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading statistics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No statistics available</p>
        </div>
      </div>
    )
  }

  const resolutionRate = stats.total_reports > 0 
    ? ((stats.resolved_reports / stats.total_reports) * 100).toFixed(1)
    : '0'

  const openRate = stats.total_reports > 0 
    ? ((stats.open_reports / stats.total_reports) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.resolved_reports} of {stats.total_reports} reports resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.open_reports} reports pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ban Rate</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.banned_users}</div>
            <p className="text-xs text-muted-foreground">
              Users currently banned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hidden Content</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.hidden_content}</div>
            <p className="text-xs text-muted-foreground">
              Content currently hidden
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Type */}
        {stats.reports_by_type && stats.reports_by_type.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reports by Type</CardTitle>
              <CardDescription>Distribution of reports by content type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.reports_by_type}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.reports_by_type.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Reports by Status */}
        {stats.reports_by_status && stats.reports_by_status.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reports by Status</CardTitle>
              <CardDescription>Current status of all reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.reports_by_status}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline Chart */}
      {stats.reports_timeline && stats.reports_timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reports Timeline</CardTitle>
            <CardDescription>Reports over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.reports_timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.reports_by_type?.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.type === 'post' && <FileText className="h-4 w-4" />}
                  {item.type === 'message' && <MessageSquare className="h-4 w-4" />}
                  {item.type === 'profile' && <User className="h-4 w-4" />}
                  <span className="capitalize">{item.type}</span>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.reports_by_status?.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="capitalize">{item.status}</span>
                <Badge 
                  variant={
                    item.status === 'open' ? 'default' :
                    item.status === 'resolved' ? 'secondary' :
                    item.status === 'rejected' ? 'destructive' : 'outline'
                  }
                >
                  {item.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Total Reports</span>
              <Badge variant="outline">{stats.total_reports}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Open Reports</span>
              <Badge variant="default">{stats.open_reports}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Resolved</span>
              <Badge variant="secondary">{stats.resolved_reports}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Banned Users</span>
              <Badge variant="destructive">{stats.banned_users}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
