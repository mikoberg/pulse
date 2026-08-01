const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function position(now: Date = new Date()): string {
  return `${WEEKDAYS[now.getDay()]} · ${MONTHS[now.getMonth()]}`;
}
