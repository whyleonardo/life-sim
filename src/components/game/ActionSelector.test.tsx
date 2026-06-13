import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { renderWithI18n } from './test-utils'
import { ActionSelector } from './ActionSelector'

describe('ActionSelector', () => {
  const actions = [
    { label: 'actions.infantry.play', description: 'actions.infantry.playDesc', statEffects: { happiness: 5 } },
    { label: 'actions.infantry.eatWell', description: 'actions.infantry.eatWellDesc', statEffects: { health: 4 } },
    { label: 'actions.infantry.read', description: 'actions.infantry.readDesc', statEffects: { smarts: 3 } },
  ]

  it('renders action labels (translated)', () => {
    const { getByText } = renderWithI18n(
      <ActionSelector actions={actions} onSelect={vi.fn()} />
    )
    expect(getByText('Brincar')).toBeInTheDocument()
    expect(getByText('Comer bem')).toBeInTheDocument()
    expect(getByText('Ler')).toBeInTheDocument()
  })

  it('calls onSelect with correct index when action clicked', () => {
    const onSelect = vi.fn()
    const { getByText } = renderWithI18n(
      <ActionSelector actions={actions} onSelect={onSelect} />
    )
    fireEvent.click(getByText('Brincar'))
    expect(onSelect).toHaveBeenCalledWith(0)
    fireEvent.click(getByText('Comer bem'))
    expect(onSelect).toHaveBeenCalledWith(1)
    fireEvent.click(getByText('Ler'))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('highlights selected action', () => {
    const { container } = renderWithI18n(
      <ActionSelector actions={actions} onSelect={vi.fn()} selected={1} />
    )
    const buttons = container.querySelectorAll('button')
    expect(buttons[1]).toHaveClass('ring-2')
  })
})
