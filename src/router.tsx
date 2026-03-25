import { createRouter, createRootRoute, createRoute, Outlet, useRouter } from '@tanstack/react-router'
import { useAuth } from './hooks/useAuth'
import React from 'react'
import { Shell } from './Shell'
import { Sidebar, SidebarGroup, SidebarItem } from '@blinkdotnew/ui'
import { LayoutDashboard, User, CheckSquare, Heart, LogOut, Bell } from 'lucide-react'
import { supabase } from './lib/supabase'

// Page imports
import { DashboardPage } from './pages/Dashboard'
import { ProfilePage } from './pages/Profile'
import { ActivitiesPage } from './pages/Activities'
import { MoodPage } from './pages/Mood'
import { RemindersPage } from './pages/Reminders'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/Signup'

// Root route
const rootRoute = createRootRoute({
  component: () => {
    const { user, loading } = useAuth()
    const router = useRouter()
    
    // Check path to see if it's an auth page
    const currentPath = window.location.pathname
    const isAuthPage = currentPath === '/login' || currentPath === '/signup'

    React.useEffect(() => {
      if (!loading) {
        if (!user && !isAuthPage) {
          router.navigate({ to: '/login' })
        } else if (user && isAuthPage) {
          router.navigate({ to: '/' })
        }
      }
    }, [loading, user, router, isAuthPage])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!user && !isAuthPage) return null

    if (isAuthPage) return <Outlet />

    return (
      <Shell
        appName="Neuro Guide"
        sidebar={
          <Sidebar>
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                <Heart className="w-6 h-6 fill-primary" />
                Neuro Guide
              </h1>
            </div>
            <div className="flex-1 py-4">
              <SidebarGroup>
                <SidebarItem 
                  icon={<LayoutDashboard size={18} />} 
                  label="Dashboard" 
                  href="/" 
                />
                <SidebarItem 
                  icon={<User size={18} />} 
                  label="Profile" 
                  href="/profile" 
                />
                <SidebarItem 
                  icon={<CheckSquare size={18} />} 
                  label="Activities" 
                  href="/activities" 
                />
                <SidebarItem 
                  icon={<Heart size={18} />} 
                  label="Mood Tracker" 
                  href="/mood" 
                />
                <SidebarItem 
                  icon={<Bell size={18} />} 
                  label="Reminders" 
                  href="/reminders" 
                />
              </SidebarGroup>
            </div>
            <div className="p-4 border-t">
              <SidebarItem 
                icon={<LogOut size={18} />} 
                label="Logout" 
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.navigate({ to: '/login' })
                }}
              />
            </div>
          </Sidebar>
        }
      >
        <div className="min-h-screen bg-background/50">
          <Outlet />
        </div>
      </Shell>
    )
  },
})

// Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

// Profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

// Activities route
const activitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activities',
  component: ActivitiesPage,
})

// Mood route
const moodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mood',
  component: MoodPage,
})

// Reminders route
const remindersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reminders',
  component: RemindersPage,
})

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Signup route
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  activitiesRoute,
  moodRoute,
  remindersRoute,
  loginRoute,
  signupRoute,
])

// Create the router
export const router = createRouter({ routeTree })

// Declare route types for TypeScript
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}