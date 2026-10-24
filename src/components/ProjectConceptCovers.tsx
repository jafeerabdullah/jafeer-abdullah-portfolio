import { Check, GraduationCap } from 'lucide-react'
import './ProjectConceptCovers.css'

export function AlgorithmCover() {
  return (
    <div
      className="project-visual concept-cover algorithm-cover"
      role="img"
      aria-label="Concept cover for Graph Performance Analyzer: an algorithm study with distinct linear and logarithmic growth curves"
    >
      <div className="concept-cover-topline">
        <span>ALGORITHM LAB</span>
        <span>JAVA / 04</span>
      </div>
      <div className="algorithm-cover-body">
        <div className="algorithm-cover-intro">
          <span className="concept-cover-kicker">MAKE COMPLEXITY CLEAR.</span>
          <strong className="concept-cover-title">
            Performance,
            <br />
            <em>visualized.</em>
          </strong>
          <span className="algorithm-cover-formula">O(log n)</span>
          <span className="algorithm-cover-note">A STUDY IN EFFICIENCY</span>
        </div>
        <div className="algorithm-cover-chart">
          <div className="algorithm-chart-label">
            <span>ORDER OF GROWTH</span>
            <span>↗</span>
          </div>
          <svg viewBox="0 0 300 176" fill="none" aria-hidden="true">
            <path d="M24 12V150H282" stroke="#605f53" strokeWidth="1" />
            <path
              d="M24 44H282M24 80H282M24 115H282M88 12V150M153 12V150M218 12V150M282 12V150"
              stroke="#ddd5ba"
              strokeOpacity=".1"
              strokeDasharray="2 5"
            />
            <path d="M24 150L274 18" stroke="#b7c0af" strokeWidth="2" />
            <path
              d="M24 150C38 121 55 105 82 94C124 77 182 68 274 61"
              stroke="#c7a66b"
              strokeWidth="2.5"
            />
            <path
              d="M24 150C38 121 55 105 82 94C124 77 182 68 274 61V150Z"
              fill="#c7a66b"
              fillOpacity=".06"
            />
            <circle cx="274" cy="18" r="3.5" fill="#b7c0af" />
            <circle cx="274" cy="61" r="4" fill="#c7a66b" />
            <g fill="#c7c4b7" fontSize="9" fontFamily="DM Mono, monospace">
              <text x="29" y="23">
                operations
              </text>
              <text x="250" y="169">
                input →
              </text>
              <text x="237" y="18">
                O(n)
              </text>
              <text x="215" y="54" fill="#d2b680">
                O(log n)
              </text>
            </g>
          </svg>
          <div className="algorithm-chart-legend">
            <span>Linear</span>
            <span>Logarithmic</span>
          </div>
        </div>
      </div>
      <div className="concept-cover-footer">
        <span>SEARCH / TRAVERSE / COMPARE</span>
        <span>CONCEPT VISUAL</span>
      </div>
    </div>
  )
}

export function CampusRecordsCover() {
  return (
    <div
      className="project-visual concept-cover campus-records-cover"
      role="img"
      aria-label="Concept cover for Student Records and Campus Routes: a student directory card beside an architectural campus map connecting the gate, lecture block, library, and administration"
    >
      <div className="concept-cover-topline">
        <span>CAMPUS DIRECTORY</span>
        <span>JAVA / 06</span>
      </div>
      <div className="campus-records-body">
        <div className="campus-student-card">
          <span className="campus-student-label">STUDENT RECORD</span>
          <div className="campus-student-avatar">
            <GraduationCap size={28} strokeWidth={1.3} aria-hidden="true" />
          </div>
          <strong>
            Student
            <br />
            directory.
          </strong>
          <span className="campus-student-description">Profiles. Courses. Records.</span>
          <span className="campus-student-status">
            <Check size={11} aria-hidden="true" /> Structured data
          </span>
        </div>
        <div className="campus-route-plan">
          <strong>
            One campus.
            <br />
            <em>Connected.</em>
          </strong>
          <svg viewBox="0 0 320 184" fill="none" aria-hidden="true">
            <path
              d="M8 158H309M105 9V176M217 9V176M8 81H309"
              stroke="#c6b995"
              strokeOpacity=".11"
              strokeWidth="12"
            />
            <path
              d="M8 158H309M105 9V176M217 9V176M8 81H309"
              stroke="#c6b995"
              strokeOpacity=".12"
              strokeDasharray="3 6"
            />
            <g fill="#3c3b31" stroke="#8c8268" strokeWidth="1">
              <path d="M26 19H82V57H26Z" />
              <path d="M32 25H76V51H32Z" strokeOpacity=".3" />
              <path d="M133 101H185V137H133Z" />
              <path d="M139 107H179V131H139Z" strokeOpacity=".3" />
              <path d="M245 22H301V58H245Z" />
              <path d="M251 28H295V52H251Z" strokeOpacity=".3" />
              <path d="M248 107H294V135H248Z" />
            </g>
            <path
              d="M37 158H105V81H217V40H237"
              stroke="#d1b480"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="37" cy="158" r="4" fill="#d1b480" />
            <path
              d="M237 32C233 32 230 35 230 39C230 45 237 51 237 51S244 45 244 39C244 35 241 32 237 32Z"
              fill="#d1b480"
            />
            <circle cx="237" cy="39" r="2.5" fill="#272820" />
            <g fill="#c6bfac" fontSize="8" fontFamily="DM Mono, monospace" letterSpacing=".7">
              <text x="26" y="70">
                LECTURES
              </text>
              <text x="138" y="150">
                ADMIN
              </text>
              <text x="252" y="71">
                LIBRARY
              </text>
              <text x="26" y="179">
                GATE
              </text>
            </g>
          </svg>
        </div>
      </div>
      <div className="concept-cover-footer">
        <span>RECORDS / ROUTES / CONNECTIONS</span>
        <span>CONCEPT VISUAL</span>
      </div>
    </div>
  )
}
