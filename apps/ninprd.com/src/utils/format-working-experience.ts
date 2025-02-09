export function formatWorkingExperience(
  startDate: string,
  endDate: string | undefined,
) {
  return `${startDate} - ${endDate ?? "Present"}`;
}
