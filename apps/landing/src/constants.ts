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
    company: 'Skooldio Tech',
    position: 'Software Engineer',
    startDate: '2022-06-01',
    endDate: null,
    description:
      'Being a part of Research and Development (R&D) team, responsible for developing and quickly shipping new features for newly created products.',
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
export const RESUME_URL =
  'https://drive.google.com/file/d/19rnOZWjy4Y5icT7jbdAGaADzhl-L8nGq/view'
