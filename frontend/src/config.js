// Configuration for API endpoints
const config = {
  // Use localhost:8000 for development, /api for production
  apiBaseUrl:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "/api"),

  // Get full API URL for a given endpoint
  getApiUrl: (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${config.apiBaseUrl}/${cleanEndpoint}`;
  },
};

export default config;
