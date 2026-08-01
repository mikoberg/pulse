function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  calendar: {
    icsUrl: required("PULSE_CALENDAR_ICS_URL"),
    travelMinutes: Number(process.env.PULSE_CALENDAR_TRAVEL_MINUTES) || 20,
  },
  github: {
    owner: required("PULSE_GITHUB_OWNER"),
    repo: required("PULSE_GITHUB_REPO"),
    branch: process.env.PULSE_GITHUB_BRANCH || "main",
  },
  weather: {
    latitude: Number(process.env.PULSE_WEATHER_LAT) || 52.37,
    longitude: Number(process.env.PULSE_WEATHER_LON) || 4.9,
  },
  launch: {
    icsUrl: required("PULSE_LAUNCH_ICS_URL"),
  },
};
