import posthog from 'posthog-js'

export const initPostHog = () => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: 'https://eu.posthog.com',
      person_profiles: 'identified_only',
      // Disable automatic page view capturing since we'll handle it with React Router
      capture_pageview: false,
      // Disable automatic click capturing - we'll add manual events where needed
      autocapture: false,
    })
  }
}

export { posthog }