import { profile, skillGroups } from './portfolio'

// Verified Vercel production alias. Preview deployments must never become canonical.
export const seo = {
  url: 'https://jafeer-abdullah-portfolio.vercel.app/',
  title: 'Jafeer Abdullah | Full-Stack Developer & Software Portfolio',
  description:
    'Explore Jafeer Abdullah’s portfolio: full-stack web and mobile projects built with Laravel, Flutter, Java, and TypeScript, plus technical skills and certificates.',
  image: 'https://jafeer-abdullah-portfolio.vercel.app/images/social-cover.jpg',
  imageAlt: 'Jafeer Abdullah — developer portfolio with a monochrome portrait and dark typography',
} as const

export const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${seo.url}#website`,
      url: seo.url,
      name: 'Jafeer Abdullah — Developer Portfolio',
      description: seo.description,
      inLanguage: 'en',
      publisher: { '@id': `${seo.url}#person` },
    },
    {
      '@type': 'Person',
      '@id': `${seo.url}#person`,
      name: profile.name,
      url: seo.url,
      jobTitle: profile.role,
      description: 'Software developer and Applied IT undergraduate based in Sri Lanka, building web and mobile applications.',
      image: new URL('/images/jafeer-studio-portrait.webp', seo.url).href,
      homeLocation: { '@type': 'Place', name: profile.location },
      knowsAbout: skillGroups.flatMap((group) => [...group.items]),
      sameAs: [profile.github, profile.linkedin],
    },
  ],
}
