import Seo from '@/components/seo/Seo'
import { Hero } from '@/components/hero/Hero'
import { TechMarquee } from '@/components/home/TechMarquee'
import { FeaturedProjects } from '@/components/home/FeaturedProjects'
import { TechnologyEcosystem } from '@/components/home/TechnologyEcosystem'
import { AboutTeaser } from '@/components/home/AboutTeaser'
import { ServicesTeaser } from '@/components/home/ServicesTeaser'
import { CtaBand } from '@/components/home/CtaBand'
import { site } from '@/config/site'

export default function Home() {
  return (
    <>
      <Seo
        title="Full-Stack · FiveM · Game · UI/UX Developer"
        description={site.description}
        path="/"
      />
      <Hero />
      <TechMarquee />
      <FeaturedProjects />
      <TechnologyEcosystem />
      <ServicesTeaser />
      <AboutTeaser />
      <CtaBand />
    </>
  )
}