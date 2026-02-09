// =========================
// TIMEZONE UTILITIES (IST-FOCUSED)
// =========================

// Convert UTC Date to IST string (DD MMM HH:MM IST)
export const formatToIST = (dateString: string) => {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

// Get contest status in IST timezone
export function getContestStatusInIST(startTime: Date, endTime: Date): 'upcoming' | 'live' | 'ended' {
  // Get current time in IST
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);

  const startIST = new Date(startTime.getTime() + istOffset);
  const endIST = new Date(endTime.getTime() + istOffset);

  if (nowIST < startIST) return 'upcoming';
  if (startIST <= nowIST && nowIST <= endIST) return 'live';
  return 'ended';
}

// Convert IST string back to UTC Date (for parsing user input)
export function parseISTString(istString: string): Date {
  // Expected format: "DD MMM HH:MM IST"
  const parts = istString.replace(' IST', '').split(' ');
  if (parts.length !== 3) throw new Error('Invalid IST format');

  const [day, month, time] = parts;
  const [hour, minute] = time.split(':');

  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  const year = new Date().getFullYear();
  const istDate = new Date(year, monthMap[month], parseInt(day), parseInt(hour), parseInt(minute));

  // Convert IST back to UTC
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(istDate.getTime() - istOffset);
}

// Get time until contest starts in IST
export function getTimeUntilInIST(startTime: Date): number {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  const startIST = new Date(startTime.getTime() + istOffset);

  return Math.max(0, Math.floor((startIST.getTime() - nowIST.getTime()) / (1000 * 60)));
}
