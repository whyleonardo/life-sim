import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithI18n } from './test-utils'
import { EventCard } from './EventCard'

describe('EventCard', () => {
  it('renders event description (translated)', () => {
    const { getByText } = renderWithI18n(
      <EventCard description="events.eventHappened" />
    )
    expect(getByText('Evento ocorreu')).toBeInTheDocument()
  })

  it('renders choice buttons when choices provided', () => {
    const choices = [
      { label: 'common.confirm', effects: { health: 5 } },
      { label: 'common.cancel', effects: { health: -5 } },
    ]
    const { getByText } = renderWithI18n(
      <EventCard description="events.eventHappened" choices={choices} />
    )
    expect(getByText('Confirmar')).toBeInTheDocument()
    expect(getByText('Cancelar')).toBeInTheDocument()
  })

  it('calls onChoice with correct index when button clicked', () => {
    const onChoice = vi.fn()
    const choices = [
      { label: 'common.confirm', effects: { health: 5 } },
      { label: 'common.cancel', effects: { health: -5 } },
    ]
    const { getByText } = renderWithI18n(
      <EventCard
        description="events.eventHappened"
        choices={choices}
        onChoice={onChoice}
      />
    )
    fireEvent.click(getByText('Confirmar'))
    expect(onChoice).toHaveBeenCalledWith(0)
    fireEvent.click(getByText('Cancelar'))
    expect(onChoice).toHaveBeenCalledWith(1)
  })

  it('renders without choices when none provided', () => {
    const { getByText, queryAllByRole } = renderWithI18n(
      <EventCard description="events.eventHappened" />
    )
    expect(getByText('Evento ocorreu')).toBeInTheDocument()
    expect(queryAllByRole('button')).toHaveLength(0)
  })
})
