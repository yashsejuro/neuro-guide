import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, toast } from '@blinkdotnew/ui'
import { supabase } from '../lib/supabase'
import { useRouter } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Registration successful! Please login.')
      router.navigate({ to: '/login' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Start Your Journey</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">Create an account for personalized mental guide</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary font-semibold hover:underline">
              Login here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
