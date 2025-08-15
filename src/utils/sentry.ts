import * as Sentry from "@sentry/react";

// Initialize Sentry
export const initSentry = () => {
  // Check if Sentry should be enabled
  const isEnabled = import.meta.env.VITE_SENTRY_ENABLED === 'true' || 
                    (import.meta.env.VITE_SENTRY_ENABLED === undefined && import.meta.env.PROD);
  
  Sentry.init({
    dsn: "https://6dc2200c78474838a13d3fbaa2b8d139@o87060.ingest.us.sentry.io/1223243",
    environment: import.meta.env.MODE,
    enabled: isEnabled,
    // Removed feedbackIntegration since we're using a custom modal
    beforeSend(event) {
      // Show crash report dialog for exceptions when enabled
      if (event.exception && event.event_id && isEnabled) {
        Sentry.showReportDialog({ eventId: event.event_id });
      }
      return event;
    },
  });
};

// Export Sentry for use in components
export { Sentry };