import {
  Activity,
  Braces,
  Check,
  CreditCard,
  FileText,
  Package,
  ShoppingBag,
  Terminal,
} from 'lucide-react'
import type { Project } from '../data/portfolio'
import { AlgorithmCover, CampusRecordsCover } from './ProjectConceptCovers'

export function ProjectVisual({ project }: { project: Project }) {
  if (project.visual === 'blog')
    return (
      <div className="project-visual blog-visual">
        <span className="visual-caption">CODOMAX JOURNAL / FULL STACK PUBLISHING</span>
        <div className="browser-frame">
          <div className="browser-chrome">
            <span />
            <span />
            <span />
            <span className="browser-url">Codomax Journal / Home</span>
          </div>
          <img
            src="/images/codomax-blog.webp"
            alt="Actual Codomax Journal homepage showing the editorial blog and article discovery interface"
            loading="lazy"
            width="1440"
            height="1050"
          />
        </div>
        <span className="visual-footnote">
          <FileText size={12} /> WRITE. SAVE. PUBLISH.
        </span>
      </div>
    )
  if (project.visual === 'erp')
    return (
      <div className="project-visual erp-visual">
        <span className="visual-caption">THE CONNECTED CAMPUS STORE</span>
        <div className="browser-frame">
          <div className="browser-chrome">
            <span />
            <span />
            <span />
            <span className="browser-url">Campus Store ERP / Dashboard</span>
          </div>
          <img
            src="/images/campus-dashboard.webp"
            alt="Actual Campus Store ERP administrator dashboard from the project repository"
            loading="lazy"
            width="1440"
            height="900"
          />
        </div>
        <span className="visual-footnote">
          <Package size={12} /> INVENTORY. SALES. SIMPLIFIED.
        </span>
      </div>
    )
  if (project.visual === 'fashion')
    return (
      <div className="project-visual fashion-visual">
        <div className="fashion-wordmark">
          ABU<span>FASHION STORE</span>
        </div>
        <div className="phone phone-back">
          <img
            src="/images/abu-screen-2.webp"
            alt="Abu Fashion Store application screen from the project README"
            loading="lazy"
            width="360"
            height="780"
          />
        </div>
        <div className="phone phone-front">
          <img
            src="/images/abu-screen-3.webp"
            alt="Abu Fashion Store mobile shopping interface from the project README"
            loading="lazy"
            width="360"
            height="780"
          />
        </div>
        <span className="visual-footnote">DESIGNED FOR THE EVERYDAY.</span>
      </div>
    )
  if (project.visual === 'graph') return <AlgorithmCover />
  if (project.visual === 'campus') return <CampusRecordsCover />
  if (project.visual === 'billing')
    return (
      <div className="project-visual billing-visual">
        <div className="billing-brand">
          <CreditCard size={30} strokeWidth={1} />
          <span>
            Swift<span>Billing</span>
            <small>A CLEARER CHECKOUT.</small>
          </span>
        </div>
        <div className="receipt">
          <div className="receipt-top">
            <ShoppingBag size={20} />
            <span>SWIFTBILLING</span>
            <Check size={16} />
          </div>
          <div className="receipt-rule" />
          <p>
            <span>Billing</span>
            <FileText size={13} />
          </p>
          <p>
            <span>Sales management</span>
            <Check size={13} />
          </p>
          <div className="receipt-rule" />
          <div className="receipt-bars">|||| ||| |||||| || |||| ||||</div>
        </div>
        <span className="visual-footnote">PROJECT IDENTITY / CONCEPT VISUAL</span>
      </div>
    )
  return (
    <div className="project-visual hospital-visual">
      <div className="terminal-window">
        <div className="terminal-header">
          <Terminal size={13} />
          <span>Hospital Emergency Management</span>
          <Braces size={13} />
        </div>
        <div className="terminal-body">
          <span className="terminal-muted">// A structured approach to care</span>
          <p>
            <span>01</span> Patient records
          </p>
          <p>
            <span>02</span> Emergency queue <Activity size={13} />
          </p>
          <p>
            <span>03</span> Treatment history
          </p>
          <p>
            <span>04</span> Visit management
          </p>
          <div className="terminal-prompt">
            java<span> ›</span>
            <i />
          </div>
        </div>
      </div>
      <span className="visual-footnote">JAVA CONSOLE / CONCEPT VISUAL</span>
    </div>
  )
}
