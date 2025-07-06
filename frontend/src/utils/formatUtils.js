// Helper to clean and format feature names for display
export const cleanFeatureName = (featureName) => {
  // Remove category prefixes from feature names
  const prefixes = ["sleep_", "cosinor_", "physical_activity_", "nonparam_"];
  let cleanedName = featureName;
  for (const prefix of prefixes) {
    if (cleanedName.startsWith(prefix)) {
      cleanedName = cleanedName.substring(prefix.length);
      break;
    }
  }
  // Replace underscores with spaces
  cleanedName = cleanedName.replace(/_/g, " ");
  // Special case for MESOR - keep it in all caps
  if (cleanedName.toLowerCase() === "mesor") {
    return "MESOR";
  }
  // Preserve original capitalization, only apply title case to all-lowercase words
  return cleanedName
    .split(" ")
    .map((word) => {
      if (word.toLowerCase() === "mesor") {
        return "MESOR";
      }
      // If the word is all lowercase, capitalize it
      if (word === word.toLowerCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Otherwise, keep the original capitalization
      return word;
    })
    .join(" ");
};

// Format time in MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// Helper to interpolate between red and green
export function interpolateColor(wear) {
  // Linear interpolation between #ff5252 and #4caf50
  const r0 = 255,
    g0 = 82,
    b0 = 82; // red
  const r1 = 76,
    g1 = 175,
    b1 = 80; // green
  const r = Math.round(r0 + (r1 - r0) * wear);
  const g = Math.round(g0 + (g1 - g0) * wear);
  const b = Math.round(b0 + (b1 - b0) * wear);
  return `rgb(${r},${g},${b})`;
}
