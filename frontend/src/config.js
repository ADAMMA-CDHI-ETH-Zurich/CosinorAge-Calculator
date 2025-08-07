// Configuration for API endpoints
const config = {
  // Use localhost:8000 for development, /api for production
  apiBaseUrl:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "/api"),

  // File upload configuration
  ENABLE_FILE_SIZE_LIMIT: true,  // Global switch to enable/disable file size limit
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,  // 10MB in bytes

  // Get full API URL for a given endpoint
  getApiUrl: (endpoint) => {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${config.apiBaseUrl}/${cleanEndpoint}`;
  },

  // Get formatted file size limit for display
  getFileSizeLimitMB: () => {
    return config.MAX_FILE_SIZE_BYTES / (1024 * 1024);
  },
};

export default config;
