export function formatWorkExperience(
  startDate: string,
  endDate: string | null,
) {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end ? end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}`
}
