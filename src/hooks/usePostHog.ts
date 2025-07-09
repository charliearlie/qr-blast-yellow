import { usePostHog as usePostHogOriginal } from 'posthog-js/react'

export const usePostHog = () => {
  const posthog = usePostHogOriginal()

  const track = (event: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(event, properties)
    }
  }

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.identify(userId, properties)
    }
  }

  const reset = () => {
    if (posthog) {
      posthog.reset()
    }
  }

  return {
    track,
    identify,
    reset,
    posthog
  }
}