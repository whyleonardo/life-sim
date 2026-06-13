import { describe, it, expect } from 'vitest'
import { renderWithI18n } from './test-utils'
import { StatBar } from './StatBar'

describe('StatBar', () => {
  it('renders stat name (translated)', () => {
    const { getByText } = renderWithI18n(<StatBar name="stats.health" value={75} />)
    expect(getByText('Saúde')).toBeInTheDocument()
  })

  it('renders numeric value', () => {
    const { getByText } = renderWithI18n(<StatBar name="stats.health" value={75} />)
    expect(getByText('75')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    const { container } = renderWithI18n(<StatBar name="stats.health" value={75} />)
    const bar = container.querySelector('[data-testid="stat-bar-progress"]')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveStyle('width: 75%')
  })

  it('uses default color when none specified', () => {
    const { container } = renderWithI18n(<StatBar name="stats.health" value={50} />)
    const bar = container.querySelector('[data-testid="stat-bar-progress"]')
    expect(bar).toHaveClass('bg-green-500')
  })

  it('uses custom color when specified', () => {
    const { container } = renderWithI18n(
      <StatBar name="stats.health" value={50} color="bg-red-500" />
    )
    const bar = container.querySelector('[data-testid="stat-bar-progress"]')
    expect(bar).toHaveClass('bg-red-500')
  })

  it('uses correct default colors for different stats', () => {
    const { container: healthContainer } = renderWithI18n(
      <StatBar name="stats.health" value={50} />
    )
    expect(healthContainer.querySelector('[data-testid="stat-bar-progress"]')).toHaveClass('bg-green-500')

    const { container: happinessContainer } = renderWithI18n(
      <StatBar name="stats.happiness" value={50} />
    )
    expect(happinessContainer.querySelector('[data-testid="stat-bar-progress"]')).toHaveClass('bg-yellow-500')

    const { container: smartsContainer } = renderWithI18n(
      <StatBar name="stats.smarts" value={50} />
    )
    expect(smartsContainer.querySelector('[data-testid="stat-bar-progress"]')).toHaveClass('bg-blue-500')

    const { container: looksContainer } = renderWithI18n(
      <StatBar name="stats.looks" value={50} />
    )
    expect(looksContainer.querySelector('[data-testid="stat-bar-progress"]')).toHaveClass('bg-pink-500')

    const { container: moneyContainer } = renderWithI18n(
      <StatBar name="stats.money" value={50} />
    )
    expect(moneyContainer.querySelector('[data-testid="stat-bar-progress"]')).toHaveClass('bg-amber-500')
  })
})
