import config from '../config';

/**
 * Fetch timezones from the backend API
 * @returns {Promise<Object>} Object containing timezones organized by continent
 */
export const fetchTimezones = async () => {
  try {
    const response = await fetch(config.getApiUrl('timezones'));
    if (!response.ok) {
      throw new Error('Failed to fetch timezones');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching timezones:', error);
    // Return a fallback with common timezones
    return {
      timezones: {
        'UTC': ['UTC'],
        'Europe': ['Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid'],
        'America': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
        'Asia': ['Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Seoul'],
        'Australia': ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Perth']
      },
      continents: ['UTC', 'Europe', 'America', 'Asia', 'Australia'],
      default: 'UTC'
    };
  }
};

/**
 * Filter timezones by continent
 * @param {Object} timezones - Object containing timezones organized by continent
 * @param {string} continent - Continent name to filter by
 * @returns {Array} Array of timezones for the specified continent
 */
export const filterTimezonesByContinent = (timezones, continent) => {
  if (!timezones || !continent) {
    return [];
  }
  
  return timezones[continent] || [];
};

/**
 * Search timezones by name
 * @param {Object} timezones - Object containing timezones organized by continent
 * @param {string} searchTerm - Search term to match against timezone names
 * @returns {Array} Array of matching timezones
 */
export const searchTimezones = (timezones, searchTerm) => {
  if (!timezones || !searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  const results = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  // Search through all continents
  Object.keys(timezones).forEach(continent => {
    timezones[continent].forEach(timezone => {
      if (timezone.toLowerCase().includes(lowerSearchTerm)) {
        results.push({
          timezone,
          continent,
          displayName: timezone.replace('_', ' ')
        });
      }
    });
  });
  
  // Sort results by relevance (exact matches first, then alphabetical)
  return results.sort((a, b) => {
    const aExact = a.timezone.toLowerCase().startsWith(lowerSearchTerm);
    const bExact = b.timezone.toLowerCase().startsWith(lowerSearchTerm);
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.timezone.localeCompare(b.timezone);
  }).slice(0, 10); // Limit to 10 results
}; 