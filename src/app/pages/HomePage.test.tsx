import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/shared/lib/i18n'
import { HomePage } from './HomePage'
import { useHomeStore } from '@/features/home/store'
import type { Game, Character } from '@/shared/types'

// ── Mock window.matchMedia (required by Credenza/useMediaQuery) ──

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// ── Mock navigate ────────────────────────────────────────

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// ── Helpers ───────────────────────────────────────────────

function createMockGame(
  id: number,
  status: 'alive' | 'dead',
): Game & { character?: Character } {
  return {
    id,
    createdAt: Date.now(),
    currentYear: 2024,
    seed: `seed-${id}`,
    status,
    character: {
      id,
      gameId: id,
      name: status === 'alive' ? `LivingChar${id}` : `DeadChar${id}`,
      gender: 'male' as const,
      age: status === 'alive' ? 25 : 80,
      health: status === 'alive' ? 80 : 30,
      happiness: 70,
      smarts: 60,
      looks: 75,
      money: 5000,
    },
  }
}

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      {ui}
    </I18nextProvider>
  )
}

// ═════════════════════════════════════════════════════════
// HomePage Tests
// ═════════════════════════════════════════════════════════

describe('HomePage', () => {
  beforeEach(() => {
    // Reset store with noop actions to prevent async loadGames from
    // interfering with test assertions
    useHomeStore.setState({
      games: [],
      loading: false,
      error: null,
      canCreateNewLife: true,
      loadGames: async () => {},
      deleteGame: async () => {},
    })
    mockNavigate.mockClear()
  })

  it('renders "Minhas Vidas" heading', () => {
    renderWithI18n(<HomePage />)
    expect(screen.getByText('Minhas Vidas')).toBeInTheDocument()
  })

  it('shows empty state when no games exist', () => {
    renderWithI18n(<HomePage />)
    expect(screen.getByText('Nenhuma vida salva ainda.')).toBeInTheDocument()
  })

  it('shows "Nova Vida" button in empty state', () => {
    renderWithI18n(<HomePage />)
    const newLifeBtn = screen.getByText('Nova Vida')
    expect(newLifeBtn).toBeInTheDocument()
    expect(newLifeBtn.tagName).toBe('BUTTON')
  })

  it('shows game cards when games exist', () => {
    useHomeStore.setState({
      games: [
        createMockGame(1, 'alive'),
        createMockGame(2, 'dead'),
      ],
      canCreateNewLife: true,
    })

    renderWithI18n(<HomePage />)

    // Should show character names
    expect(screen.getByText('LivingChar1')).toBeInTheDocument()
    expect(screen.getByText('DeadChar2')).toBeInTheDocument()

    // Should have "Nova Vida" button in game list too
    const newLifeButtons = screen.getAllByText('Nova Vida')
    expect(newLifeButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('"Nova Vida" button is disabled when 5 alive games exist', () => {
    const games = Array.from({ length: 5 }, (_, i) =>
      createMockGame(i + 1, 'alive'),
    )
    useHomeStore.setState({
      games,
      canCreateNewLife: false,
    })

    renderWithI18n(<HomePage />)

    const newLifeButtons = screen.getAllByText('Nova Vida')
    // The main "Nova Vida" button should be disabled
    const mainNewLifeButton = newLifeButtons.find(
      (btn) => btn.tagName === 'BUTTON',
    )
    expect(mainNewLifeButton).toBeDisabled()
  })

  it('shows max lives reached message when 5 alive games exist', () => {
    const games = Array.from({ length: 5 }, (_, i) =>
      createMockGame(i + 1, 'alive'),
    )
    useHomeStore.setState({
      games,
      canCreateNewLife: false,
    })

    renderWithI18n(<HomePage />)

    expect(
      screen.getByText('Máximo de vidas atingido (5)'),
    ).toBeInTheDocument()
  })

  it('clicking a living game card navigates to /game/:id', () => {
    useHomeStore.setState({
      games: [createMockGame(42, 'alive')],
      canCreateNewLife: true,
    })

    renderWithI18n(<HomePage />)

    // Click on the living character card (the Card has cursor-pointer class)
    const card = screen.getByText('LivingChar42').closest('.cursor-pointer')
    expect(card).not.toBeNull()
    fireEvent.click(card!)

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/game/$id',
      params: { id: '42' },
    })
  })

  it('clicking a dead game card navigates to /gameover/:id', () => {
    useHomeStore.setState({
      games: [createMockGame(99, 'dead')],
      canCreateNewLife: true,
    })

    renderWithI18n(<HomePage />)

    // Click on the dead character card
    const card = screen.getByText('DeadChar99').closest('.cursor-pointer')
    expect(card).not.toBeNull()
    fireEvent.click(card!)

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/gameover/$id',
      params: { id: '99' },
    })
  })
})
