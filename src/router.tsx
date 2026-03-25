import { createRouter, createRootRoute, createRoute, Outlet, useRouter, useLocation } from '@tanstack/react-router'
import { useAuth } from './hooks/useAuth'
import { useEffect } from 'react'
import { Shell } from './Shell'
import { Sidebar, SidebarGroup, SidebarItem } from '@blinkdotnew/ui'
import { LayoutDashboard, User, CheckSquare, Heart, LogOut, Bell } from 'lucide-react'
import { supabase } from './lib/supabase'
import { FloatingChat } from './components/chat/FloatingChat'
import { ThemeToggle } from './components/ThemeToggle'
import { MusicButton } from './components/MusicButton'

// Page imports
import { LandingPage } from './pages/Landing'
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
    const location = useLocation()
    
    const currentPath = location.pathname
    // Public pages: landing, login, signup
    const isPublicPage = currentPath === '/' || currentPath === '/login' || currentPath === '/signup'
    // Auth-only pages (inside shell)
    const isAppPage = !isPublicPage

    useEffect(() => {
      if (!loading) {
        // If not logged in and trying to access app pages, redirect to landing
        if (!user && isAppPage) {
          router.navigate({ to: '/' })
        }
        // If logged in and on login/signup, redirect to dashboard
        if (user && (currentPath === '/login' || currentPath === '/signup')) {
          router.navigate({ to: '/dashboard' })
        }
      }
    }, [loading, user, router, isAppPage, currentPath])

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    // Public pages render without the shell
    if (isPublicPage) return <Outlet />

    // App pages require auth
    if (!user) return null

    return (
      <Shell
        appName="Neuro Guide"
        sidebar={
          <Sidebar>
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Heart className="w-6 h-6 fill-primary" />
                  Neuro Guide
                </h1>
                <ThemeToggle />
              </div>
            </div>
            <div className="flex-1 py-4">
              <SidebarGroup>
                <SidebarItem 
                  icon={<LayoutDashboard size={18} />} 
                  label="Dashboard" 
                  href="/dashboard" 
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
            <div className="p-4 border-t border-border space-y-3">
              <div className="px-2">
                <MusicButton />
              </div>
              <SidebarItem 
                icon={<LogOut size={18} />} 
                label="Logout" 
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.navigate({ to: '/' })
                }}
              />
            </div>
          </Sidebar>
        }
      >
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
          <Outlet />
        </div>
        <FloatingChat />
      </Shell>
    )
  },
})

// Landing route (public)
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

// Dashboard route (authenticated)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
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
  landingRoute,
  dashboardRoute,
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