type Experience = {
  company: string
  position: string
  startDate: string
  endDate: string | null
  description: string
  companyUrl: string
}

export const EXPERIENCE: Experience[] = [
  {
    company: 'LINE MAN Wongnai',
    position: 'Software Engineer (Frontend)',
    startDate: '2026-06-15',
    endDate: null,
    description:
      'Being a part of the Advertising Technology (AdTech) team. Designed and implemented the end-to-end affiliate application experience, enabling users to register directly through the LINE MAN platform.',
    companyUrl: 'https://lineman.line.me/',
  },
  {
    company: 'Skooldio Tech',
    position: 'Software Engineer',
    startDate: '2022-06-16',
    endDate: '2026-06-12',
    description:
      'Led the technical design and feature development for a learning platform with 5,200 active students improving their reading literacy and critical thinking skills. ',
    companyUrl: 'https://www.skooldio.tech/',
  },
  {
    company: 'True Digital Group',
    position: 'Fullstack Developer (Intern)',
    startDate: '2021-06-01',
    endDate: '2021-12-31',
    description:
      'Designed and developed a mini telemedicine platform that addresses the challenge faced by small to medium hospitals in scheduling appointments for their patients during the COVID-19 pandemic.',
    companyUrl: 'https://www.truedigital.com/',
  },
]

export const LINKEDIN_URL = 'https://www.linkedin.com/in/peeranatd/'
export const GITHUB_URL = 'https://github.com/peeranat-dan'
export const RESUME_URL = '/Resume_Peeranat_Danaidusadeekul.pdf'
