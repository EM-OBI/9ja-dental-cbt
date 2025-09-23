// Environment configuration for API endpoints
export const config = {
  development: {
    apiUrl: "http://localhost:8787", // Wrangler dev server
  },
  production: {
    apiUrl: "https://dental-cbt-backend.your-subdomain.workers.dev", // Replace with your worker URL
  },
};

export const getApiUrl = () => {
  if (typeof window === "undefined") {
    // Server-side rendering
    return config.production.apiUrl;
  }

  const isProduction = window.location.hostname !== "localhost";
  return isProduction ? config.production.apiUrl : config.development.apiUrl;
};

export const apiEndpoints = {
  users: (userId: string) => `${getApiUrl()}/api/v1/users/${userId}`,
  userPreferences: (userId: string) =>
    `${getApiUrl()}/api/v1/users/${userId}/preferences`,
  progress: (userId: string) => `${getApiUrl()}/api/v1/progress/${userId}`,
  health: () => `${getApiUrl()}/health`,
};
