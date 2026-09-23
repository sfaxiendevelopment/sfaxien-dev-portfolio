import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react'
import Seo from '@/components/seo/Seo'
import { signInWithUsernameOrEmail } from '@/lib/auth'
import { useAdmin } from '@/providers/AdminProvider'
import { Wordmark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useAdmin()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [keepSignedIn, setKeepSignedIn] = useState(true)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)
    const { session, error: loginError } = await signInWithUsernameOrEmail(identifier, password)
    setLoading(false)
    if (loginError || !session) {
      setError(loginError?.message ?? 'Invalid credentials.')
      return
    }
    await refresh()
    const from = (location.state as { from?: string } | null)?.from
    navigate(from ?? '/admin-sec/dashboard', { replace: true })
  }

  return (
    <>
      <Seo title="Admin" path="/admin-sec" noIndex />
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
        <div aria-hidden className="absolute inset-0">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <LinkToLogo />
            <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin Access
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border/70 bg-card/90 p-7 shadow-xl backdrop-blur"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or email</Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username or you@email.com"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Checkbox id="keep" checked={keepSignedIn} onCheckedChange={(v) => setKeepSignedIn(Boolean(v))} />
              <Label htmlFor="keep" className="text-sm text-muted-foreground">
                Keep me signed in
              </Label>
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="mt-5 w-full" disabled={loading || !identifier || !password}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  <Lock className="mr-1.5 h-4 w-4" /> Sign in
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            Restricted area — authorized personnel only
          </p>
        </div>
      </div>
    </>
  )
}

function LinkToLogo() {
  return (
    <a href="/" className="flex items-center gap-2.5">
      <Wordmark />
    </a>
  )
}