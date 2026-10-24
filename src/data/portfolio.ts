export const profile = {
  name: 'Jafeer Abdullah',
  role: 'Full Stack Software Developer',
  email: 'jafeerabdullah4g@gmail.com',
  phone: '+94 77 067 1752',
  location: 'Kattankudy, Batticaloa, Sri Lanka',
  github: 'https://github.com/jafeerabdullah',
  linkedin: 'https://www.linkedin.com/in/jafeer-abdullah',
  resume: '/documents/Jafeer-Abdullah-CV.pdf',
} as const

export type ProjectCategory = 'Web' | 'Mobile' | 'Java'
export interface Project {
  id: string
  number: string
  title: string
  shortTitle: string
  category: ProjectCategory
  type: string
  description: string
  problem: string
  contribution: string
  technologies: string[]
  features: string[]
  repository: string
  liveUrl?: string
  visual: 'erp' | 'fashion' | 'billing' | 'graph' | 'campus' | 'hospital' | 'blog'
}

export const projects: Project[] = [
  {
    id: 'codomax-blog',
    number: '01',
    title: 'Codomax Blog Website',
    shortTitle: 'Codomax Blog Website',
    category: 'Web',
    type: 'Full stack application · Codomax internship',
    description:
      'An editorial blog where writers publish stories, save private drafts, and manage their work in a personal dashboard.',
    problem:
      'A publishing platform needs to connect a readable public journal with private author workflows. The application brings article discovery, account access, and content management together.',
    contribution:
      'Developed the frontend, Express REST API, Supabase database integration, and authenticated publishing workflows during the Codomax Full Stack Web Development Internship.',
    technologies: ['JavaScript', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL', 'HTML & CSS'],
    features: [
      'Registration and JWT authentication',
      'Create, edit, and delete your own articles',
      'Private drafts and published stories',
      'Search and category filtering',
      'Personal dashboard and author statistics',
      'Responsive reading and writing interfaces',
    ],
    repository: `${profile.github}/codomax-fullstack-blog`,
    liveUrl: 'https://codomax-fullstack-blog.vercel.app/',
    visual: 'blog',
  },
  {
    id: 'campus-erp',
    number: '02',
    title: 'Campus Store Management ERP System',
    shortTitle: 'Campus Store ERP',
    category: 'Web',
    type: 'Full stack web application',
    description:
      'Bringing inventory, sales, staff, and reporting into one connected campus store system.',
    problem:
      'Manual store operations make it difficult to keep stock, sales, and staff records consistent. This application brings those workflows together in a single ERP.',
    contribution:
      'Developed the full stack application and implemented the inventory, sales processing, staff management, and reporting modules.',
    technologies: ['PHP', 'Laravel', 'MySQL', 'JavaScript'],
    features: [
      'Inventory and stock movement management',
      'Sales processing and invoices',
      'Staff management and role-based access',
      'Sales and inventory reporting',
    ],
    repository: `${profile.github}/campus-store-erp`,
    visual: 'erp',
  },
  {
    id: 'abu-fashion',
    number: '03',
    title: 'Abu Fashion Store',
    shortTitle: 'Abu Fashion Store',
    category: 'Mobile',
    type: 'Cross-platform e-commerce application',
    description:
      'A mobile shopping experience built around easy discovery and a clear path from product to order.',
    problem:
      'A shopping application needs to make product discovery and account access straightforward across devices. This Flutter application connects the interface to Firebase services.',
    contribution:
      'Developed the cross-platform shopping application, integrated Firebase, and designed the product browsing and category navigation interfaces.',
    technologies: ['Flutter', 'Dart', 'Firebase'],
    features: [
      'Product browsing and categories',
      'Firebase authentication',
      'Cart and checkout flow',
      'Order history and profile management',
    ],
    repository: `${profile.github}/abu-fashion-store-updated`,
    visual: 'fashion',
  },
  {
    id: 'graph-analyzer',
    number: '04',
    title: 'Data Structure & Graph Performance Analyzer',
    shortTitle: 'Graph Performance Analyzer',
    category: 'Java',
    type: 'University project · Team lead',
    description:
      'Exploring how data structures, searching, and graph algorithms behave through practical performance analysis.',
    problem:
      'Algorithm complexity is easier to understand when it can be observed. This Java console application lets users work with structures and compare algorithm steps and execution times.',
    contribution:
      'Led the university project team implementing data structures, graph algorithms, and searching techniques, and performed performance analysis.',
    technologies: ['Java', 'Data Structures', 'Algorithms'],
    features: [
      'Array, stack, queue, and linked-list operations',
      'Linear and binary searching',
      'Breadth-first and depth-first graph traversal',
      'Algorithm performance comparison',
    ],
    repository: `${profile.github}/Data-Structure-and-Graph-Performance-Analyzer`,
    visual: 'graph',
  },
  {
    id: 'swift-billing',
    number: '05',
    title: 'SwiftBilling — Single-User POS System',
    shortTitle: 'SwiftBilling',
    category: 'Web',
    type: 'Collaborative group project',
    description:
      'A point of sale application focused on billing, sales management, and a usable everyday interface.',
    problem:
      'Billing and sales management need clear, connected workflows. Our team collaborated on a single-user point of sale system to support these tasks.',
    contribution:
      'Contributed to application development, interface design, and core functionality, while tracking team work in Jira.',
    technologies: ['TypeScript', 'JavaScript', 'CSS', 'Jira'],
    features: [
      'Billing workflows',
      'Sales management',
      'Interface design',
      'Team collaboration with Jira',
    ],
    repository: `${profile.github}/Swift_Billing-`,
    visual: 'billing',
  },
  {
    id: 'university-records',
    number: '06',
    title: 'University Student Record & Campus Route Management System',
    shortTitle: 'Student Records & Campus Routes',
    category: 'Java',
    type: 'University project · Team lead',
    description:
      'Connecting student records and campus route management through structured Java programming.',
    problem:
      'Student information and campus routes involve different kinds of connected data. This project combines record operations and campus graph traversal in one console application.',
    contribution:
      'Led development of the university system, applying programming concepts and data structures to organize student records and campus routes.',
    technologies: ['Java', 'Data Structures', 'Graph Traversal'],
    features: [
      'Student record management',
      'Campus location and route management',
      'Data structure-based organization',
      'Integrated console interface',
    ],
    repository: `${profile.github}/University-Student-Record-Campus-Route-Management-System`,
    visual: 'campus',
  },
  {
    id: 'hospital-emergency',
    number: '07',
    title: 'Mini Hospital Emergency Management System',
    shortTitle: 'Hospital Emergency System',
    category: 'Java',
    type: 'Java console application',
    description:
      'Structured patient records, emergency queues, and treatment history in a practical Java application.',
    problem:
      'Emergency processes involve patient information, waiting order, and treatment records. This console application models these workflows with core data structures.',
    contribution:
      'Developed the Java application for emergency processes and patient records, applying structured problem solving and programming concepts.',
    technologies: ['Java', 'OOP', 'Data Structures'],
    features: [
      'Patient record operations',
      'FIFO emergency waiting queue',
      'Treatment history stack',
      'Patient visit linked lists',
    ],
    repository: `${profile.github}/MiniHospitalEmergencyManagementSystem`,
    visual: 'hospital',
  },
]

export const skillGroups = [
  {
    title: 'Languages',
    icon: 'code',
    items: ['Java', 'PHP', 'JavaScript', 'TypeScript', 'Dart', 'Python'],
  },
  {
    title: 'Web & mobile',
    icon: 'layers',
    items: ['Laravel', 'Flutter', 'Firebase', 'UI/UX Design', 'Node.js', 'Express.js', 'Supabase'],
  },
  {
    title: 'Data & foundations',
    icon: 'database',
    items: [
      'MySQL',
      'Database Management',
      'Data Structures & Algorithms',
      'Networking Fundamentals',
    ],
  },
  {
    title: 'Tools & creative',
    icon: 'tool',
    items: [
      'Git & GitHub',
      'Jira',
      'Power BI',
      'Data Analysis',
      'Canva',
      'Adobe Photoshop',
      'Adobe Illustrator',
    ],
  },
] as const

export type CertificateCategory = 'Technology' | 'Academic' | 'Achievements'
export interface Certificate {
  id: string
  title: string
  issuer: string
  date: string
  category: CertificateCategory
  credential: string
  description: string
  recipient: string
  image: string
  document: string
  format: 'PDF' | 'JPG'
  badgeUrl?: string
  featured?: boolean
  width: number
  height: number
}

export const certifications: Certificate[] = [
  {
    id: 'networking-basics',
    title: 'Networking Basics',
    issuer: 'Cisco Networking Academy',
    date: '19 October 2026',
    category: 'Technology',
    credential: 'Student level credential',
    description:
      'Foundations of network communication, Ethernet, IPv4 and IPv6 addressing, routing, and network troubleshooting.',
    recipient: 'Jafeer Abdullah',
    image: '/certificates/networking-basics-hq.png',
    document: '/certificates/networking-basics.pdf',
    format: 'PDF',
    badgeUrl: 'https://www.credly.com/badges/1d8dec9b-1ff4-4e22-8e6e-e022567abf56/public_url',
    featured: true,
    width: 2376,
    height: 1836,
  },
  {
    id: 'introduction-to-cybersecurity',
    title: 'Introduction to Cybersecurity',
    issuer: 'Cisco Networking Academy',
    date: '12 October 2026',
    category: 'Technology',
    credential: 'Student level credential',
    description:
      'An introduction to online safety, common cyber threats, attacks and vulnerabilities, and protecting people and organizations.',
    recipient: 'Jafeer Abdullah',
    image: '/certificates/introduction-to-cybersecurity-hq.png',
    document: '/certificates/introduction-to-cybersecurity.pdf',
    format: 'PDF',
    badgeUrl: 'https://www.credly.com/badges/66bad64b-5a51-4334-affd-809ee43f06a9/public_url',
    featured: true,
    width: 2376,
    height: 1836,
  },
  {
    id: 'icta-open-office',
    title: 'Information Technology & Open Office',
    issuer: 'ICTA Sri Lanka · Skills International',
    date: 'Undated certificate',
    category: 'Technology',
    credential: 'Certificate of participation',
    description:
      'Information Technology and Open Office training under the capacity building program for Nenasala operators in the Northern and Eastern Province.',
    recipient: 'Jabir Abdullah — OSDA Nenasala — Kattankudy',
    image: '/certificates/icta-open-office-hq.jpg',
    document: '/certificates/icta-open-office-hq.jpg',
    format: 'JPG',
    width: 3200,
    height: 2287,
  },
  {
    id: 'gce-ordinary-level',
    title: 'G.C.E. Ordinary Level',
    issuer: 'Department of Examinations, Sri Lanka',
    date: '2019 · Statement issued 23 February 2023',
    category: 'Academic',
    credential: '6 A passes · 3 B passes',
    description:
      'Official examination statement, including distinction passes in Mathematics, English Language, and Information & Communication Technology.',
    recipient: 'Jafeer Abdullah',
    image: '/certificates/gce-ordinary-level-hq.jpg',
    document: '/certificates/gce-ordinary-level-hq.jpg',
    format: 'JPG',
    width: 2263,
    height: 3200,
  },
  {
    id: 'energy-club-innovation',
    title: 'Energy Club Competition — Innovation',
    issuer: 'Zonal Education Office, Batticaloa Central Zone',
    date: '2016',
    category: 'Achievements',
    credential: '1st place · Zonal level',
    description:
      'First place in the innovation competition, Group 01, at the zonal level Energy Club Competition.',
    recipient: 'J. Abdullah',
    image: '/certificates/energy-club-innovation-hq.jpg',
    document: '/certificates/energy-club-innovation-hq.jpg',
    format: 'JPG',
    width: 3055,
    height: 2133,
  },
  {
    id: 'ahadhiyyah-intermediate',
    title: 'Ahadhiyyah Intermediate National Examination',
    issuer: 'The Ceylon Islamic Instructions Society Limited',
    date: '31 December 2017',
    category: 'Achievements',
    credential: 'National certificate examination',
    description:
      'Passed the intermediate examination in Islamic Law, Islamic Ethics, and Islamic Biography and History, with grades A, A, and B.',
    recipient: 'J. Abdullah',
    image: '/certificates/ahadhiyyah-intermediate-hq.jpg',
    document: '/certificates/ahadhiyyah-intermediate-hq.jpg',
    format: 'JPG',
    width: 3200,
    height: 2514,
  },
  {
    id: 'islamic-studies-arabic',
    title: 'Basics of Islamic Studies & Arabic Language',
    issuer: 'Islamic Model School · Centre for Islamic Guidance',
    date: '1 September 2018 · Examination December 2017',
    category: 'Achievements',
    credential: 'Certificate of accomplishment · Very Good',
    description:
      'Completed the prescribed course at the Islamic Model School in Kattankudy, with an overall attainment of Very Good.',
    recipient: 'Jafeer Abdullah',
    image: '/certificates/islamic-studies-arabic-hq.jpg',
    document: '/certificates/islamic-studies-arabic-hq.jpg',
    format: 'JPG',
    width: 2282,
    height: 3200,
  },
]
