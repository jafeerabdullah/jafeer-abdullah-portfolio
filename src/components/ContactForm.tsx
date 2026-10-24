import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react'
import { profile } from '../data/portfolio'

type Fields = { name: string; email: string; subject: string; message: string }
const empty: Fields = { name: '', email: '', subject: '', message: '' }
export function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [feedback, setFeedback] = useState('')
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Partial<Fields> = {}
    if (!fields.name.trim()) next.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
      next.email = 'Please enter a valid email address.'
    if (!fields.subject.trim()) next.subject = 'Please add a subject.'
    if (fields.message.trim().length < 10)
      next.message = 'Please write a message of at least 10 characters.'
    setErrors(next)
    if (Object.keys(next).length) {
      setFeedback('Please check the highlighted fields.')
      const first = Object.keys(next)[0]
      document.getElementById(`contact-${first}`)?.focus()
      return
    }
    const body = `${fields.message.trim()}\n\nFrom: ${fields.name.trim()}\nReply to: ${fields.email.trim()}`
    setDraft(`To: ${profile.email}\nSubject: ${fields.subject.trim()}\n\n${body}`)
    setCopied(false)
    setFeedback(
      'Your email draft is ready. Complete sending in your email app. If it did not open, copy the message below.',
    )
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(fields.subject.trim())}&body=${encodeURIComponent(body)}`
  }
  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
    } catch {
      setFeedback('Copy is unavailable here. Select and copy the email draft below.')
    }
  }
  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="form-row">
        {(['name', 'email'] as const).map((name) => (
          <div className="form-field" key={name}>
            <label htmlFor={`contact-${name}`}>
              {name === 'name' ? 'Your name' : 'Email address'}
              <span>*</span>
            </label>
            <input
              id={`contact-${name}`}
              name={name}
              type={name === 'email' ? 'email' : 'text'}
              autoComplete={name}
              placeholder={name === 'name' ? 'How should I call you?' : 'you@company.com'}
              value={fields[name]}
              maxLength={name === 'name' ? 100 : 254}
              onChange={(e) => setFields({ ...fields, [name]: e.target.value })}
              aria-invalid={!!errors[name]}
              aria-describedby={errors[name] ? `${name}-error` : undefined}
              required
            />
            {errors[name] && (
              <span className="field-error" id={`${name}-error`}>
                {errors[name]}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="form-field">
        <label htmlFor="contact-subject">
          Subject<span>*</span>
        </label>
        <input
          id="contact-subject"
          name="subject"
          placeholder="An opportunity, a project, a hello…"
          value={fields.subject}
          maxLength={160}
          onChange={(e) => setFields({ ...fields, subject: e.target.value })}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          required
        />
        {errors.subject && (
          <span className="field-error" id="subject-error">
            {errors.subject}
          </span>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">
          Your message<span>*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="Tell me a little about what you have in mind."
          value={fields.message}
          maxLength={4000}
          onChange={(e) => setFields({ ...fields, message: e.target.value })}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
          required
        />
        {errors.message && (
          <span className="field-error" id="message-error">
            {errors.message}
          </span>
        )}
      </div>
      <div className="form-actions">
        <p>
          <Mail size={13} /> Opens your email app
        </p>
        <button className="button button-gold" type="submit">
          Prepare email
          <ArrowUpRight size={17} />
        </button>
      </div>
      <p className="form-feedback" role="status" aria-live="polite">
        {feedback}
      </p>
      {draft && (
        <div className="draft-fallback">
          <label htmlFor="email-draft">Your email draft</label>
          <textarea id="email-draft" readOnly rows={6} value={draft} />
          <button className="text-link" type="button" onClick={copyDraft}>
            {copied ? <Check size={15} /> : <Copy size={15} />}{' '}
            {copied ? 'Copied to clipboard' : 'Copy email draft'}
          </button>
        </div>
      )}
    </form>
  )
}
