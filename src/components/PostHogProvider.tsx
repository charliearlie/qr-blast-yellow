import { createContext, useContext, ReactNode } from 'react'
import { usePostHog } from '@/hooks/usePostHog'

interface PostHogContextType {
  track: (event: string, properties?: Record<string, any>) => void
  identify: (userId: string, properties?: Record<string, any>) => void
  reset: () => void
}

const PostHogContext = createContext<PostHogContextType | undefined>(undefined)

export const PostHogProvider = ({ children }: { children: ReactNode }) => {
  const { track, identify, reset } = usePostHog()

  return (
    <PostHogContext.Provider value={{ track, identify, reset }}>
      {children}
    </PostHogContext.Provider>
  )
}

export const usePostHogContext = () => {
  const context = useContext(PostHogContext)
  if (!context) {
    throw new Error('usePostHogContext must be used within a PostHogProvider')
  }
  return context
}