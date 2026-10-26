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

// These are the two supplied portraits actually displayed on the homepage.
export const portraitImages = [
  {
    path: '/images/jafeer-studio-portrait.webp',
    caption: 'Jafeer Abdullah wearing a suit',
    width: 1448,
    height: 1086,
    encodingFormat: 'image/webp',
  },
  {
    path: '/images/jafeer-about-sunglasses.jpeg',
    caption: 'Jafeer Abdullah outdoors wearing sunglasses and a striped shirt',
    width: 960,
    height: 1280,
    encodingFormat: 'image/jpeg',
  },
] as const

const portraitId = (image: (typeof portraitImages)[number]) =>
  `${new URL(image.path, seo.url).href}#image`

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
      '@type': 'ProfilePage',
      '@id': `${seo.url}#profile`,
      url: seo.url,
      name: seo.title,
      description: seo.description,
      isPartOf: { '@id': `${seo.url}#website` },
      mainEntity: { '@id': `${seo.url}#person` },
      primaryImageOfPage: { '@id': portraitId(portraitImages[0]) },
    },
    {
      '@type': 'Person',
      '@id': `${seo.url}#person`,
      name: profile.name,
      url: seo.url,
      jobTitle: profile.role,
      description: 'Software developer and Applied IT undergraduate based in Sri Lanka, building web and mobile applications.',
      mainEntityOfPage: { '@id': `${seo.url}#profile` },
      image: portraitImages.map((image) => ({ '@id': portraitId(image) })),
      homeLocation: { '@type': 'Place', name: profile.location },
      knowsAbout: skillGroups.flatMap((group) => [...group.items]),
      sameAs: [profile.github, profile.linkedin],
    },
    ...portraitImages.map((image) => ({
      '@type': 'ImageObject',
      '@id': portraitId(image),
      url: new URL(image.path, seo.url).href,
      contentUrl: new URL(image.path, seo.url).href,
      name: image.caption,
      caption: image.caption,
      width: image.width,
      height: image.height,
      encodingFormat: image.encodingFormat,
      about: { '@id': `${seo.url}#person` },
      representativeOfPage: image === portraitImages[0],
    })),
  ],
}
