import { describe, it, expect } from 'vitest'
import { renderWithI18n } from './test-utils'
import { LifePhaseBadge } from './LifePhaseBadge'
import { type LifePhase } from '@/shared/config/gameBalance'

describe('LifePhaseBadge', () => {
  it('renders phase name (translated)', () => {
    const { getByText } = renderWithI18n(<LifePhaseBadge phase="infancy" age={3} />)
    expect(getByText('Infância')).toBeInTheDocument()
  })

  it('renders age number', () => {
    const { getByText } = renderWithI18n(<LifePhaseBadge phase="infancy" age={3} />)
    expect(getByText((content) => content.includes('3'))).toBeInTheDocument()
  })

  it('renders for each life phase', () => {
    const phases: LifePhase[] = ['infancy', 'school', 'youngAdult', 'adult', 'senior']
    const expectedNames = ['Infância', 'Escola', 'Jovem Adulto', 'Adulto', 'Idoso']

    phases.forEach((phase, index) => {
      const { getByText } = renderWithI18n(<LifePhaseBadge phase={phase} age={10} />)
      expect(getByText(expectedNames[index])).toBeInTheDocument()
    })
  })
})
