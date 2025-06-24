// Configuration for API endpoints
const config = {
  // API base URL - will be /api/ when running in Docker, or localhost:8000 for development
  apiBaseUrl: process.env.REACT_APP_API_URL || '/api',
  
  // Get full API URL for a given endpoint
  getApiUrl: (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${config.apiBaseUrl}/${cleanEndpoint}`;
  }
};

export default config; 