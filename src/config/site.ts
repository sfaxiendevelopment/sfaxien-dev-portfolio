import type { LucideIcon } from 'lucide-react'
import {
  Boxes,
  BrainCircuit,
  Gamepad2,
  Monitor,
  ServerCog,
  Palette,
  Code2,
} from 'lucide-react'

export const site = {
  name: 'SFAXIEN DEV',
  legalName: 'Sfaxien Dev',
  domain: 'SFAXIEN.DEV',
  email: 'sfaxiendevelopment@gmail.com',
  location: 'Remote — Worldwide',
  roles: ['Full-Stack Developer', 'FiveM Developer', 'Game Developer', 'UI/UX Developer'],
  tagline: 'Full-stack, FiveM, game, and UI/UX development — engineered with cinematic precision.',
  description:
    'SFAXIEN DEV is a full-stack developer crafting premium web applications, FiveM experiences, games, and UI/UX systems. Built for performance, engineered to last.',
  socials: {
    github: 'https://github.com/sfaxien-dev',
    discord: 'https://discord.gg/sfaxien-dev',
    x: '',
  },
} as const

export interface ServiceDetail {
  slug: string
  title: string
  blurb: string
  description: string
  icon: LucideIcon
  features: string[]
}

export const services: ServiceDetail[] = [
  {
    slug: 'full-stack-development',
    title: 'Full-Stack Development',
    blurb:
      'Complete product builds — from database to interface. Modern, typed, and production-ready.',
    description:
      'Full ownership of the stack: database schema, APIs, auth and the interface on top. I deliver features that are typed, tested and deployed — not demos that fall apart in production.',
    icon: Code2,
    features: ['Product architecture', 'End-to-end features', 'API & database design', 'Deployment & scaling'],
  },
  {
    slug: 'frontend-development',
    title: 'Frontend Development',
    blurb:
      'Interfaces with intent. Fast, accessible, and satisfying to use on every device.',
    description:
      'React, TypeScript and modern tooling, sharpened into interfaces that load fast, move beautifully and stay accessible. Motion as a communication tool, never a distraction.',
    icon: Monitor,
    features: ['React / Vite / TypeScript', 'Design systems', 'Motion & interaction', 'Performance budgets'],
  },
  {
    slug: 'backend-development',
    title: 'Backend Development',
    blurb:
      'Reliable servers, secure auth, raw speed. Backends built to be trusted.',
    description:
      'Backends engineered around security and data integrity — Postgres schemas, row-level security, realtime subscriptions and Node APIs built to scale without drama.',
    icon: ServerCog,
    features: ['PostgreSQL', 'Node.js APIs', 'Authentication & sessions', 'Realtime systems'],
  },
  {
    slug: 'fivem-development',
    title: 'FiveM Development',
    blurb:
      'Server resources and scripts that feel native — clean code, no spaghetti.',
    description:
      'FiveM resources written like production software: framework-agnostic cores, clean event flow and performance profiling. Garages, jobs, economies, admin panels — built to hold up under load.',
    icon: Boxes,
    features: ['Server resources', 'Custom scripts & core systems', 'Garage / jobs / economy systems', 'Performance-optimized Lua'],
  },
  {
    slug: 'game-development',
    title: 'Game Development',
    blurb:
      'Gameplay systems, tools, and worlds that players actually enjoy.',
    description:
      'From Unreal Engine gameplay mechanics to engines and tools — systems designed around fun, then built with engineering rigour so they stay stable as they grow.',
    icon: Gamepad2,
    features: ['Gameplay programming', 'Unreal Engine mechanics', 'UI/HUD for games', 'Prototyping & iteration'],
  },
  {
    slug: 'ui-ux-development',
    title: 'UI/UX Development',
    blurb:
      'Interfaces that look expensive on purpose — and are usable to prove it.',
    description:
      'Design systems, cinematic interfaces and micro-interactions that make products feel premium. Every screen is a compiled component, not a static picture.',
    icon: Palette,
    features: ['Design systems', 'Cinematic UI', 'Interactive prototypes', 'Usability & accessibility'],
  },
  {
    slug: 'ai-integration',
    title: 'AI Integration',
    blurb:
      'Intelligence inside your product — not bolted on the side.',
    description:
      'LLM APIs and retrieval pipelines composed safely into your product — typed inputs, scraped outputs, rate limits and guardrails baked in from the start.',
    icon: BrainCircuit,
    features: ['LLM APIs', 'RAG pipelines', 'Automations & agents', 'Production guardrails'],
  },
] as const

export const technologies: { name: string; slug: string }[] = [
  { name: 'React', slug: 'react' },
  { name: 'Vite', slug: 'vite' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'Tailwind CSS', slug: 'tailwind-css' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'Node.js', slug: 'nodejs' },
  { name: 'Lua', slug: 'lua' },
  { name: 'FiveM', slug: 'fivem' },
  { name: 'Unreal Engine', slug: 'unreal-engine' },
  { name: 'Python', slug: 'python' },
  { name: 'Git', slug: 'git' },
  { name: 'GitHub', slug: 'github' },
] as const