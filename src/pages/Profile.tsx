import React, { useEffect, useState } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Input, toast } from '@blinkdotnew/ui'
import { getProfile, updateProfile, CONDITIONS, Condition } from '../lib/recommendations'
import { useAuth } from '../hooks/useAuth'

export function ProfilePage() {
  const { user } = useAuth()
  const [condition, setCondition] = useState<Condition | ''>('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getProfile(user.id).then((data) => {
        if (data) {
          setCondition(data.condition || '')
          setDisplayName(data.display_name || '')
        }
        setLoading(false)
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    try {
      await updateProfile(user.id, { 
        condition: condition as Condition, 
        display_name: displayName 
      })
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Page>
      <PageHeader>
        <PageTitle>Your Well-being Profile</PageTitle>
      </PageHeader>
      <PageBody>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Tell us about yourself</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input 
                placeholder="How should we call you?" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Focus / Condition</label>
              <Select value={condition} onValueChange={(val) => setCondition(val as Condition)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select what you'd like help with" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                We'll use this to give you tailored wellness recommendations.
              </p>
            </div>

            <Button onClick={handleSave} className="w-full">Save Profile</Button>
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
