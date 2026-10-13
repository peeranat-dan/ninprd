export type FaciRole = 'facilitator' | 'ta' | 'teaching' | 'organizer'

type FaciExperience = {
  title: string
  organizer: string
  role: FaciRole
  roleLabel: string
  batch?: string
  period?: string
  description: string
  topics: string[]
  url?: string
}

export const FACI_ROLES: { id: FaciRole | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'facilitator', label: 'Facilitator' },
  { id: 'ta', label: 'TA' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'organizer', label: 'Organizer' },
]

export const FACI_SINCE = 2024

// Newest first. The page renders this order as-is, so add new entries at the
// top. The role filter already groups by role - don't group here.
export const FACI_EXPERIENCE: FaciExperience[] = [
  {
    title: 'Product Management Bootcamp',
    organizer: 'Skooldio',
    role: 'facilitator',
    roleLabel: 'Facilitator',
    batch: 'Batch 9',
    period: '2026',
    description:
      'Facilitated group exercises, keeping teams moving and bringing an engineer’s point of view into their product discussions.',
    topics: ['Product management'],
    url: 'https://landing.skooldio.com/product-management-bootcamp',
  },
  {
    title: 'WordCamp Bangkok 2025',
    organizer: 'WordPress Bangkok',
    role: 'organizer',
    roleLabel: 'Organizer, speaker team',
    period: '2025',
    description:
      'Part of the organizing team - sourced speakers, reviewed their slides, and coordinated them on the day.',
    topics: ['Community', 'Event organizing'],
    url: 'https://bangkok.wordcamp.org/2025/',
  },
  {
    title: 'AI Automation Transformation',
    organizer: 'Skooldio',
    role: 'facilitator',
    roleLabel: 'Facilitator',
    batch: 'Batch 1 - 3',
    period: '2025',
    description:
      'Walked the room during hands-on sessions, unblocking participants one by one as they turned their own work processes into automations.',
    topics: ['AI automation', 'n8n'],
    url: 'https://www.skooldio.com/workshops/ai-automation-transformation',
  },
  {
    title: 'AI Automation for Business Transformation',
    organizer: 'Skooldio',
    role: 'facilitator',
    roleLabel: 'Facilitator',
    batch: 'Batch 1',
    period: '2025',
    description:
      'Facilitated the first batch of the workshop, helping business participants build and debug their own n8n automation workflows hands-on.',
    topics: ['AI automation', 'n8n'],
    url: 'https://www.skooldio.com/workshops/ai-automation-for-business-transformation',
  },
  {
    title: 'Prompt Engineering and RAG',
    organizer: 'Skooldio',
    role: 'facilitator',
    roleLabel: 'Facilitator',
    period: '2025',
    description:
      'Supported participants through the hands-on exercises, explaining prompt engineering and retrieval concepts in plain language when they got stuck.',
    topics: ['Prompt engineering', 'RAG'],
  },
  {
    title: 'Git class, Web Development Bootcamp',
    organizer: 'Skooldio',
    role: 'teaching',
    roleLabel: 'Instructor',
    batch: 'Batch 2',
    period: '2024',
    description:
      'Taught the Git & Version Control class for the bootcamp, explaining version control from the angle of someone who also switched careers into software.',
    topics: ['Git', 'Teaching'],
    url: 'https://landing.skooldio.com/web-development-bootcamp',
  },
  {
    title: 'Web Development Bootcamp',
    organizer: 'Skooldio',
    role: 'ta',
    roleLabel: 'Teaching assistant',
    batch: 'Batch 1 & 2',
    period: '2024',
    description:
      'Supported learners across two cohorts of the three-month bootcamp - debugging next to them, answering questions, and helping people who were writing code for the first time get unstuck.',
    topics: ['Web development', 'React'],
    url: 'https://landing.skooldio.com/web-development-bootcamp',
  },
  {
    title: 'Guest speaker, first-year Computer Engineering class',
    organizer: 'Chulalongkorn University',
    role: 'teaching',
    roleLabel: 'Guest speaker',
    period: '2023',
    description:
      'Shared what working at a software company is actually like with a classroom of first-year Computer Engineering students.',
    topics: ['Career', 'Public speaking'],
  },
]
