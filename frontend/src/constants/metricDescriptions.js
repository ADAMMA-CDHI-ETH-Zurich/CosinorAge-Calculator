// Descriptions for each section
export const metricDescriptions = {
  // Cosinor
  mesor: {
    title: "Mesor",
    description:
      "The mean value of the fitted cosine curve, representing the average activity level over 24 hours (in mg).",
  },
  amplitude: {
    title: "Amplitude",
    description:
      "Half the difference between the peak and trough of the fitted cosine curve, indicating the strength of the rhythm (in mg).",
  },
  acrophase: {
    title: "Acrophase",
    description:
      "The timing of the peak of the fitted cosine curve, expressed in radians or minutes, indicating when the highest activity occurs.",
  },
  acrophase_time: {
    title: "Acrophase Time",
    description:
      "The time of day (in HH:MM format) when the peak of the fitted cosine curve occurs.",
  },
  // Nonparametric
  is: {
    title: "Interdaily Stability (IS)",
    description:
      "A measure of the consistency of activity patterns between days. Ranges from 0 (random) to 1 (perfectly stable). Higher values indicate more regular daily rhythms.",
  },
  iv: {
    title: "Intradaily Variability (IV)",
    description:
      "A measure of fragmentation of activity within a day. It is greater than 0 - values close to 0 reflect a smooth pattern whereas greater values indicate more transitions between rest and activity. Values below 2 are considered as being acceptable.",
  },
  ra: {
    title: "Relative Amplitude (RA)",
    description:
      "The difference between the most active 10 hours (M10) and least active 5 hours (L5), normalized by their sum. Ranges from 0 to 1. Higher values indicate a more robust rhythm.",
  },
  sri: {
    title: "Sleep Regularity Index (SRI)",
    description:
      "A measure of the consistency of sleep/wake patterns across days. Ranges from -100 (irregular) to 100 (perfectly regular).",
  },
  m10: {
    title: "L5 & M10",
    description:
      "L5 represents the mean activity during the 5 least active consecutive hours of the day (in mg), and M10 represents the mean activity during the 10 most active consecutive hours; together, these metrics describe the least and most active periods within a 24-hour cycle.",
  },
  l5: {
    title: "L5 & M10",
    description:
      "L5 represents the mean activity during the 5 least active consecutive hours of the day (in mg), and M10 represents the mean activity during the 10 most active consecutive hours; together, these metrics describe the least and most active periods within a 24-hour cycle.",
  },
  m10_start: {
    title: "M10 Start",
    description:
      "The start time of the 10 most active consecutive hours of the day.",
  },
  l5_start: {
    title: "L5 Start",
    description:
      "The start time of the 5 least active consecutive hours of the day.",
  },
  // Physical Activity
  sedentary: {
    title: "Sedentary",
    description:
      "Total minutes per day spent in sedentary activity (<1.5 METs).",
  },
  light: {
    title: "Light",
    description: "Total minutes per day spent in light activity (1.5–3 METs).",
  },
  moderate: {
    title: "Moderate",
    description: "Total minutes per day spent in moderate activity (3–6 METs).",
  },
  vigorous: {
    title: "Vigorous",
    description: "Total minutes per day spent in vigorous activity (>6 METs).",
  },
  // Sleep
  tst: {
    title: "Total Sleep Time (TST)",
    description: "Total minutes of sleep obtained per night.",
  },
  waso: {
    title: "Wake After Sleep Onset (WASO)",
    description: "Total minutes spent awake after initially falling asleep.",
  },
  pta: {
    title: "Percent Time Asleep (PTA)",
    description: "Percentage of the sleep period spent asleep.",
  },
  nwb: {
    title: "Number of Wake Bouts (NWB)",
    description: "Number of times the person woke up during the sleep period.",
  },
  sol: {
    title: "Sleep Onset Latency (SOL)",
    description: "Minutes it took to fall asleep after going to bed.",
  },
};
