const budapestClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Budapest',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZoneName: 'shortOffset'
});

export function formatBudapestClock(date) {
  const parts = Object.fromEntries(budapestClock.formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.hour}:${parts.minute}:${parts.second} (${parts.timeZoneName})`;
}
