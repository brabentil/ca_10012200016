import { render, screen } from '@testing-library/react'
import BackButton from '@/components/ui/back-button'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    pathname: '/',
  }),
}))

describe('BackButton Component', () => {
  it('should render back button', () => {
    const { container } = render(<BackButton />)
    expect(container).toBeTruthy()
  })
})
