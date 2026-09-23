import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AdminProvider } from '@/providers/AdminProvider'
import { RequireAdmin, GuestOnly } from '@/lib/route-guards'
import { CustomCursor } from '@/components/motion/CustomCursor'
import { ScrollProgress } from '@/components/motion/ScrollProgress'
import { PublicNav } from '@/components/navigation/PublicNav'
import { Footer } from '@/components/navigation/Footer'
import { CommandPalette } from '@/components/navigation/CommandPalette'
import { useCommandPalette } from '@/components/navigation/links'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Loader2 } from 'lucide-react'

const Home = lazy(() => import('@/pages/Home'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDetails = lazy(() => import('@/pages/ProjectDetails'))
const About = lazy(() => import('@/pages/About'))
const Services = lazy(() => import('@/pages/Services'))
const Contact = lazy(() => import('@/pages/Contact'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const AdminLogin = lazy(() => import('@/features/admin/AdminLogin'))
const AdminOverview = lazy(() => import('@/features/admin/AdminOverview'))
const AdminProjects = lazy(() => import('@/features/admin/AdminProjects'))
const AdminProjectEditor = lazy(() => import('@/features/admin/AdminProjectEditor'))
const AdminMedia = lazy(() => import('@/features/admin/AdminMedia'))
const AdminCategories = lazy(() => import('@/features/admin/AdminCategories'))
const AdminTechnologies = lazy(() => import('@/features/admin/AdminTechnologies'))
const AdminMessages = lazy(() => import('@/features/admin/AdminMessages'))
const AdminSettings = lazy(() => import('@/features/admin/AdminSettings'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" role="status" aria-label="Loading" />
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function PublicLayout() {
  const { open, setOpen } = useCommandPalette()
  return (
    <>
      <ScrollProgress />
      <PublicNav />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:slug" element={<ProjectDetails />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin-sec/dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<AdminProjectEditor />} />
          <Route path="projects/:id/edit" element={<AdminProjectEditor />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="technologies" element={<AdminTechnologies />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin-sec/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <AdminProvider>
          <ScrollToTop />
          <CustomCursor />
          <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
            <Routes>
              <Route path="/*" element={<PublicLayout />} />
              <Route element={<GuestOnly />}>
                <Route
                  path="/admin-sec"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLogin />
                    </Suspense>
                  }
                />
              </Route>
              <Route
                path="/admin-sec/*"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminRoutes />
                  </Suspense>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}