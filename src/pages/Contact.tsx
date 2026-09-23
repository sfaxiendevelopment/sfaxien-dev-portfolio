import { useMemo, useRef, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Loader2, Mail, MapPin, ShieldCheck } from 'lucide-react'
import Seo from '@/components/seo/Seo'
import { SectionHeading } from '@/components/section/SectionHeading'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { isEmail } from '@/lib/utils'
import { submitContact } from '@/services/contact'
import { PROJECT_TYPES, BUDGET_RANGES } from '@/types'
import { site } from '@/config/site'

interface FormState {
  name: string
  email: string
  projectType: string
  budget: string
  message: string
}

const initial: FormState = { name: '', email: '', projectType: '', budget: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState<FormState>(initial)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')
  // Honeypot + spam heuristics
  const [website, setWebsite] = useState('')
  const startedAt = useRef(0)
  const fingerprint = useMemo(
    () => Math.random().toString(36).slice(2) + Date.now().toString(36),
    [],
  )

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Please enter your name.'
    if (!form.email.trim()) e.email = 'Please enter your email.'
    else if (!isEmail(form.email.trim())) e.email = 'That email does not look valid.'
    if (!form.projectType) e.projectType = 'Pick a project type.'
    if (form.message.trim().length < 10) e.message = 'Message should be at least 10 characters.'
    return e
  }, [form])

  const set = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }))
  const markTouched = (key: string) => () => setTouched((t) => ({ ...t, [key]: true }))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (website) return
    if (startedAt.current === 0) startedAt.current = Date.now()
    if (Object.keys(errors).length > 0) {
      setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])))
      setStatus('error')
      setError('Please fix the highlighted fields.')
      return
    }
    setStatus('sending')
    const result = await submitContact(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        projectType: form.projectType,
        budget: form.budget,
        message: form.message.trim(),
      },
      { website, startedAt: startedAt.current, fingerprint },
    )
    if (result.ok) {
      setStatus('sent')
    } else {
      setStatus('error')
      setError(result.error ?? 'Something went wrong.')
    }
  }

  return (
    <>
      <Seo
        title="Contact — Start a project"
        description="Tell SFAXIEN DEV about your project. Response within 24 hours."
        path="/contact"
      />

      <section className="container grid gap-14 pb-24 pt-28 md:pt-36 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title={
              <>
                Let's talk about <span className="text-gradient">your project</span>
              </>
            }
            description="Share what you're building. I'll reply within 24 hours with honest feedback and next steps."
          />

          <Reveal delay={0.1}>
            <ul className="mt-10 space-y-5">
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                  <a href={`mailto:${site.email}`} className="font-medium text-foreground hover:text-primary">
                    {site.email}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Based in</p>
                  <p className="font-medium text-foreground">Remote · Global</p>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Availability</p>
                  <p className="font-medium text-foreground">Currently accepting projects</p>
                </div>
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-9">
            {status === 'sent' ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">Message sent!</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Thanks for reaching out. I'll get back to you at <span className="text-foreground">{form.email}</span>{' '}
                  within 24 hours.
                </p>
                <Button variant="outline" className="mt-8" onClick={() => { setForm(initial); setStatus('idle') }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" error={touched.name ? errors.name : undefined}>
                      <Input
                        value={form.name}
                        onChange={(e) => set('name')(e.target.value)}
                        onBlur={markTouched('name')}
                        placeholder="Your name"
                        autoComplete="name"
                        aria-invalid={Boolean(touched.name && errors.name)}
                      />
                    </Field>
                    <Field label="Email" error={touched.email ? errors.email : undefined}>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email')(e.target.value)}
                        onBlur={markTouched('email')}
                        placeholder="you@company.com"
                        autoComplete="email"
                        aria-invalid={Boolean(touched.email && errors.email)}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Project type" error={touched.projectType ? errors.projectType : undefined}>
                      <Select value={form.projectType || undefined} onValueChange={set('projectType')}>
                        <SelectTrigger aria-invalid={Boolean(touched.projectType && errors.projectType)}>
                          <SelectValue placeholder="What do you need?" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Budget range">
                      <Select value={form.budget || undefined} onValueChange={set('budget')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_RANGES.map((b) => (
                            <SelectItem key={b} value={b}>
                              {b}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                  <Field label="Message" error={touched.message ? errors.message : undefined}>
                    <Textarea
                      value={form.message}
                      onChange={(e) => set('message')(e.target.value)}
                      onBlur={markTouched('message')}
                      placeholder="Describe your project, goals and timeline…"
                      rows={6}
                      aria-invalid={Boolean(touched.message && errors.message)}
                    />
                  </Field>
                </div>

                {/* Honeypot — hidden from humans */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute h-0 w-0 overflow-hidden opacity-0"
                />

                {status === 'error' && (
                  <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button type="submit" className="mt-6 w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      Send message <ArrowUpRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}