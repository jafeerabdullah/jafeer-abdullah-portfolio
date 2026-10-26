import { StrictMode } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import App from './App'
import { certifications, profile, projects, skillGroups } from './data/portfolio'
import { portraitImages } from './data/seo'

// A usable document for visitors with JavaScript disabled, using the same portfolio data.
// It is emitted only inside <noscript>, never alongside the interactive design.
function StaticPortfolio() {
  return (
    <main className="static-portfolio">
      <h1>{profile.name} — {profile.role}</h1>
      <p>Software developer and Applied IT undergraduate in {profile.location}.</p>
      <p>Web and mobile applications, thoughtful interfaces, and practical problem solving.</p>
      {portraitImages.map((image) => (
        <figure key={image.path}>
          <img src={image.path} alt={image.caption} width={image.width} height={image.height} style={{ maxWidth: '100%', width: 280, height: 'auto' }} />
          <figcaption>{image.caption}</figcaption>
        </figure>
      ))}
      <p>The interactive portfolio, video, and galleries require JavaScript. You can explore the work and documents below.</p>
      <p><a href={profile.resume} download>Download résumé</a> · <a href={`mailto:${profile.email}`}>Email Jafeer Abdullah</a> · <a href={profile.github}>GitHub</a> · <a href={profile.linkedin}>LinkedIn</a></p>
      <section>
        <h2>Technical skills</h2>
        {skillGroups.map((group) => <div key={group.title}><h3>{group.title}</h3><p>{group.items.join(' · ')}</p></div>)}
      </section>
      <section>
        <h2>Selected projects</h2>
        {projects.map((project) => (
          <article key={project.id}>
            <h3>{project.title}</h3>
            <p>{project.description}</p><p>{project.technologies.join(' · ')}</p>
            <a href={project.repository}>View {project.shortTitle} source on GitHub</a>
            {project.liveUrl && <> · <a href={project.liveUrl}>Visit {project.shortTitle}</a></>}
          </article>
        ))}
      </section>
      <section>
        <h2>Certificates and achievements</h2>
        {certifications.map((certificate) => (
          <article key={certificate.id}>
            <h3>{certificate.title}</h3>
            <p>{certificate.issuer} · {certificate.date}</p>
            <p>{certificate.description}</p>
            <a href={certificate.document}>View {certificate.title} document</a>
            {certificate.badgeUrl && <> · <a href={certificate.badgeUrl}>Verify {certificate.title} badge</a></>}
          </article>
        ))}
      </section>
    </main>
  )
}

export function render() {
  return {
    app: renderToString(<StrictMode><App /></StrictMode>),
    fallback: renderToStaticMarkup(<StaticPortfolio />),
  }
}
