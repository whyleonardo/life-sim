import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithI18n } from './test-utils'
import { AgeButton } from './AgeButton'

describe('AgeButton', () => {
  it('renders "Envelhecer +1" text (translated)', () => {
    const { getByText } = renderWithI18n(<AgeButton onAge={vi.fn()} />)
    expect(getByText('Envelhecer +1')).toBeInTheDocument()
  })

  it('calls onAge when clicked', () => {
    const onAge = vi.fn()
    const { getByRole } = renderWithI18n(<AgeButton onAge={onAge} />)
    fireEvent.click(getByRole('button'))
    expect(onAge).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    const onAge = vi.fn()
    const { getByRole } = renderWithI18n(<AgeButton onAge={onAge} disabled />)
    const button = getByRole('button')
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onAge).not.toHaveBeenCalled()
  })

  it('shows infancy indicator when isInfancy is true', () => {
    const { getByText } = renderWithI18n(<AgeButton onAge={vi.fn()} isInfancy />)
    expect(getByText('Avançando automaticamente...')).toBeInTheDocument()
  })
})
