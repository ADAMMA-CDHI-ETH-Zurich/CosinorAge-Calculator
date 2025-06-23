// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:8000',
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://cosinorlab-backend.onrender.com',
  },
  test: {
    apiUrl: 'http://localhost:8000',
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = config[environment].apiUrl;

export default config[environment]; 