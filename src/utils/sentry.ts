import * as Sentry from "@sentry/react";

// Initialize Sentry
export const initSentry = () => {
  Sentry.init({
    dsn: "https://6dc2200c78474838a13d3fbaa2b8d139@o87060.ingest.us.sentry.io/1223243",
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD, // Only enable in production
  });
};