export function isDeadlineApproaching(deadline: Date | string | null) {
  if (!deadline) return false;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const timeDiff = deadlineDate.getTime() - now.getTime();

  // Return true if less than 5 minutes remaining
  return timeDiff > 0 && timeDiff < 5 * 60 * 1000;
}

export function getRemainingTime(date: Date | string | null) {
  if (!date) return null;

  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);

  return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
}
