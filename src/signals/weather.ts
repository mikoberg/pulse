import { config } from "../config.js";
import type { Decision } from "../decision.js";

const RAIN_PROBABILITY_THRESHOLD = 60; // percent
const COLD_THRESHOLD_C = 5;

// Does today's weather change what you'd wear or carry. Ordinary is silent.
export async function weatherDecision(): Promise<Decision | null> {
  const { latitude, longitude } = config.weather;
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&daily=precipitation_probability_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API returned ${res.status}`);

  const data = (await res.json()) as {
    daily: { precipitation_probability_max: number[]; temperature_2m_min: number[] };
  };

  const rainChance = data.daily.precipitation_probability_max[0];
  const minTemp = data.daily.temperature_2m_min[0];

  if (rainChance >= RAIN_PROBABILITY_THRESHOLD) {
    return {
      action: "Take a jacket.",
      reason: `${rainChance}% chance of rain today.`,
      priority: 60,
    };
  }

  if (minTemp <= COLD_THRESHOLD_C) {
    return {
      action: "Take a jacket.",
      reason: `Low of ${minTemp}°C today.`,
      priority: 60,
    };
  }

  return null;
}
