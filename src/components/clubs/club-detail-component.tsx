'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ClubDetailComponentProps {
  clubId: string
}

export function ClubDetailComponent({ clubId }: ClubDetailComponentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Club Details</CardTitle>
          <CardDescription>
            Club ID: {clubId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Club detail component will be implemented here</p>
            <p className="text-sm">This will display club information, members, and events</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
