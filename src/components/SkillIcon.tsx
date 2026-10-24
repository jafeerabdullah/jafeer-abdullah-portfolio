import { ChartNoAxesCombined, Database, Network, Palette, Server, Workflow } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { skillGroups } from '../data/portfolio'

export type SkillName = (typeof skillGroups)[number]['items'][number]
type Artwork = { color: string; images?: readonly string[]; icon?: LucideIcon }
const logo = (name: string) => `/icons/skills/${name}.svg`

// Presentation metadata only: categories, order and names still come from skillGroups.
export const skillArtwork = {
  Java: { color: '234 45 46', images: [logo('java')] },
  PHP: { color: '149 155 209', images: [logo('php')] },
  JavaScript: { color: '240 219 79', images: [logo('javascript')] },
  TypeScript: { color: '0 122 204', images: [logo('typescript')] },
  Dart: { color: '0 168 225', images: [logo('dart')] },
  Python: { color: '55 118 171', images: [logo('python')] },
  Laravel: { color: '255 70 65', images: [logo('laravel')] },
  Flutter: { color: '66 165 245', images: [logo('flutter')] },
  Firebase: { color: '255 179 0', images: [logo('firebase')] },
  'UI/UX Design': { color: '185 145 212', icon: Palette },
  'Node.js': { color: '94 160 67', images: [logo('nodejs')] },
  'Express.js': { color: '210 210 205', icon: Server },
  Supabase: { color: '62 207 142', images: [logo('supabase')] },
  MySQL: { color: '0 117 143', images: [logo('mysql')] },
  'Database Management': { color: '111 187 155', icon: Database },
  'Data Structures & Algorithms': { color: '211 163 98', icon: Workflow },
  'Networking Fundamentals': { color: '97 189 191', icon: Network },
  'Git & GitHub': { color: '243 79 41', images: [logo('git'), logo('github')] },
  Jira: { color: '38 132 255', images: [logo('jira')] },
  'Power BI': { color: '242 200 17', images: [logo('power-bi')] },
  'Data Analysis': { color: '215 182 111', icon: ChartNoAxesCombined },
  Canva: { color: '0 196 204', images: [logo('canva')] },
  'Adobe Photoshop': { color: '49 168 255', images: [logo('photoshop')] },
  'Adobe Illustrator': { color: '255 154 0', images: [logo('illustrator')] },
} satisfies Record<SkillName, Artwork>

export function SkillIcon({ name }: { name: SkillName }) {
  const artwork: Artwork = skillArtwork[name]
  const Icon = artwork.icon
  return (
    <span
      className={`skill-artwork ${artwork.images?.length === 2 ? 'is-pair' : ''}`}
      aria-hidden="true"
      data-skill-icon={name}
      data-icon-kind={Icon ? 'concept' : 'brand'}
      style={{ color: `rgb(${artwork.color})` }}
    >
      {artwork.images?.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      ))}
      {Icon && <Icon strokeWidth={1.7} />}
    </span>
  )
}
