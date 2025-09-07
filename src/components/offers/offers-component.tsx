'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function OffersComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skill Offers</CardTitle>
          <CardDescription>
            Find people to teach or learn skills from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Offers component will be implemented here</p>
            <p className="text-sm">This will display skill offers, filtering, and matching</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
