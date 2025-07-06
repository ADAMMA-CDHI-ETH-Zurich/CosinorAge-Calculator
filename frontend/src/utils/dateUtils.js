// Helper function to get the first date in YYYY-MM-DD from data.data
export function getFirstDate(data) {
  if (data.data && data.data.length > 0 && data.data[0].TIMESTAMP) {
    const d = new Date(data.data[0].TIMESTAMP);
    // Use the local date string as base, then parse back to Date to avoid timezone issues
    const dateStr = d.toLocaleDateString("en-CA");
    return new Date(dateStr);
  }
  return null;
}

export function getDateForIndex(key, index, data) {
  if (
    key === "M10" &&
    data.features.nonparam.M10_start &&
    data.features.nonparam.M10_start[index]
  ) {
    return data.features.nonparam.M10_start[index].split("T")[0];
  }
  if (
    key === "L5" &&
    data.features.nonparam.L5_start &&
    data.features.nonparam.L5_start[index]
  ) {
    return data.features.nonparam.L5_start[index].split("T")[0];
  }
  // For sleep features and RA, generate sequential dates if possible
  if (["TST", "WASO", "PTA", "NWB", "SOL", "RA"].includes(key.toUpperCase())) {
    const firstDate = getFirstDate(data);
    if (firstDate) {
      const d = new Date(firstDate);
      d.setDate(d.getDate() + index);
      return d.toLocaleDateString("en-CA");
    }
  }
  if (data.data && data.data[index] && data.data[index].TIMESTAMP) {
    return new Date(data.data[index].TIMESTAMP).toLocaleDateString("en-CA");
  }
  return `Day ${index + 1}`;
}
