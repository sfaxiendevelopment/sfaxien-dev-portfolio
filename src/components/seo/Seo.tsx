import { useEffect } from 'react'
import { siteUrl } from '@/lib/media'

interface SeoProps {
  title?: string
  description?: string
  path?: string
  image?: string | null
  type?: 'website' | 'article'
  noIndex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function canonicalUrl(path: string | undefined, noIndex: boolean): string | null {
  if (noIndex) return null
  const url = path ? `${siteUrl}${path.startsWith('/') ? path : `/${path}`}` : siteUrl
  return url
}

export default function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noIndex = false,
}: SeoProps) {
  useEffect(() => {
    const siteTitle = 'SFAXIEN DEV'
    const fullTitle = title ? `${title} — ${siteTitle}` : `${siteTitle} — Full-Stack · FiveM · Game · UI/UX`
    const desc =
      description ??
      'SFAXIEN DEV — full-stack, FiveM, game, and UI/UX development. Premium digital products, engineered with precision.'

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', canonicalUrl(path, false) ?? siteUrl)
    upsertMeta('property', 'og:site_name', siteTitle)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)

    const ogImage = image ?? '/og-cover.svg'
    upsertMeta('property', 'og:image', ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`)
    upsertMeta('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`)

    const robots = noIndex ? 'noindex, nofollow' : 'index, follow'
    upsertMeta('name', 'robots', robots)

    let canonical: HTMLLinkElement | null = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    const href = canonicalUrl(path, noIndex)
    if (href) canonical.setAttribute('href', href)
    else canonical.removeAttribute('href')
  }, [title, description, path, image, type, noIndex])

  return null
}