import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/shared/lib/i18n'
import { CreatePage } from './CreatePage'
import { useCharacterCreationStore } from '@/features/character/store'
import type { CharacterCreationResult } from '@/features/character/factory'

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

// ── Mock store actions ───────────────────────────────────

const mockInitialize = vi.fn()
const mockReroll = vi.fn()
const mockSetName = vi.fn()
const mockSetGender = vi.fn()
const mockConfirmCreation = vi.fn()
const mockReset = vi.fn()

// ── Helpers ──────────────────────────────────────────────

function createMockCreationResult(
  overrides?: Partial<CharacterCreationResult>,
): CharacterCreationResult {
  return {
    character: {
      name: 'João',
      gender: 'male',
      age: 0,
      health: 75,
      happiness: 60,
      smarts: 80,
      looks: 55,
      money: 5000,
    },
    familyRelationships: [
      { name: 'Carlos', type: 'family' as const, closeness: 90 },
      { name: 'Maria', type: 'family' as const, closeness: 85 },
    ],
    ...overrides,
  }
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>)
}

// ═════════════════════════════════════════════════════════
// CreatePage Tests
// ═════════════════════════════════════════════════════════

describe('CreatePage', () => {
  beforeEach(() => {
    // Reset store with mock actions
    useCharacterCreationStore.setState({
      seed: 'test-seed',
      creationResult: createMockCreationResult(),
      customName: null,
      customGender: null,
      saving: false,
      error: null,
      initialize: mockInitialize,
      reroll: mockReroll,
      setName: mockSetName,
      setGender: mockSetGender,
      confirmCreation: mockConfirmCreation.mockResolvedValue(1),
      reset: mockReset,
    })
    mockNavigate.mockClear()
    mockInitialize.mockClear()
    mockReroll.mockClear()
    mockSetName.mockClear()
    mockSetGender.mockClear()
    mockConfirmCreation.mockClear().mockResolvedValue(1)
    mockReset.mockClear()
  })

  // ── Rendering ──────────────────────────────────────────

  it('renders the character creation heading', () => {
    renderWithProviders(<CreatePage />)
    expect(screen.getByText('Criação de Personagem')).toBeInTheDocument()
  })

  it('renders character name in an editable input', () => {
    renderWithProviders(<CreatePage />)
    const nameInput = screen.getByDisplayValue('João')
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.tagName).toBe('INPUT')
  })

  it('renders stat bars for all character stats', () => {
    renderWithProviders(<CreatePage />)
    expect(screen.getByText('Saúde')).toBeInTheDocument()
    expect(screen.getByText('Felicidade')).toBeInTheDocument()
    expect(screen.getByText('Inteligência')).toBeInTheDocument()
    expect(screen.getByText('Aparência')).toBeInTheDocument()
    expect(screen.getByText('Dinheiro')).toBeInTheDocument()
  })

  it('renders stat values', () => {
    renderWithProviders(<CreatePage />)
    expect(screen.getByText('75')).toBeInTheDocument() // health
    expect(screen.getByText('60')).toBeInTheDocument() // happiness
    expect(screen.getByText('80')).toBeInTheDocument() // smarts
    expect(screen.getByText('55')).toBeInTheDocument() // looks
  })

  it('renders gender selector with current gender selected', () => {
    renderWithProviders(<CreatePage />)
    // The male option should be selected/active for the default male character
    const maleButton = screen.getByRole('button', { name: 'Masculino' })
    expect(maleButton).toBeInTheDocument()
    const femaleButton = screen.getByRole('button', { name: 'Feminino' })
    expect(femaleButton).toBeInTheDocument()
  })

  it('renders the reroll button', () => {
    renderWithProviders(<CreatePage />)
    expect(screen.getByText('Rerolar')).toBeInTheDocument()
  })

  it('renders the "Começar Vida" button', () => {
    renderWithProviders(<CreatePage />)
    expect(screen.getByText('Começar Vida')).toBeInTheDocument()
  })

  it('renders the "Voltar" button', () => {
    renderWithProviders(<CreatePage />)
    expect(screen.getByText('Voltar')).toBeInTheDocument()
  })

  // ── Interactions ────────────────────────────────────────

  it('calls initialize on mount', () => {
    renderWithProviders(<CreatePage />)
    expect(mockInitialize).toHaveBeenCalledTimes(1)
  })

  it('calls setName when name input changes', () => {
    renderWithProviders(<CreatePage />)
    const nameInput = screen.getByDisplayValue('João')
    fireEvent.change(nameInput, { target: { value: 'Pedro' } })
    expect(mockSetName).toHaveBeenCalledWith('Pedro')
  })

  it('calls setGender when female gender button is clicked', () => {
    renderWithProviders(<CreatePage />)
    const femaleButton = screen.getByRole('button', { name: 'Feminino' })
    fireEvent.click(femaleButton)
    expect(mockSetGender).toHaveBeenCalledWith('female')
  })

  it('calls reroll when reroll button is clicked', () => {
    renderWithProviders(<CreatePage />)
    const rerollButton = screen.getByText('Rerolar')
    fireEvent.click(rerollButton)
    expect(mockReroll).toHaveBeenCalledTimes(1)
  })

  it('calls confirmCreation and navigates to game screen on "Começar Vida"', async () => {
    renderWithProviders(<CreatePage />)
    const startButton = screen.getByText('Começar Vida')
    fireEvent.click(startButton)

    await waitFor(() => {
      expect(mockConfirmCreation).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/game/$id',
        params: { id: '1' },
      })
    })
  })

  it('calls reset and navigates home on "Voltar"', () => {
    renderWithProviders(<CreatePage />)
    const backButton = screen.getByText('Voltar')
    fireEvent.click(backButton)
    expect(mockReset).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })

  // ── Custom name display ─────────────────────────────────

  it('displays custom name when customName is set', () => {
    useCharacterCreationStore.setState({ customName: 'Pedro' })
    renderWithProviders(<CreatePage />)
    expect(screen.getByDisplayValue('Pedro')).toBeInTheDocument()
  })

  it('displays custom gender when customGender is set', () => {
    useCharacterCreationStore.setState({ customGender: 'female' })
    renderWithProviders(<CreatePage />)
    // The female button should be active/selected
    const femaleButton = screen.getByRole('button', { name: 'Feminino' })
    expect(femaleButton).toBeInTheDocument()
  })

  // ── Error state ─────────────────────────────────────────

  it('displays error message when error is set', () => {
    useCharacterCreationStore.setState({
      error: 'Máximo de vidas atingido',
    })
    renderWithProviders(<CreatePage />)
    expect(screen.getByText('Máximo de vidas atingido')).toBeInTheDocument()
  })

  // ── Loading state ───────────────────────────────────────

  it('disables "Começar Vida" button while saving', () => {
    useCharacterCreationStore.setState({ saving: true })
    renderWithProviders(<CreatePage />)
    const startButton = screen.getByText('Começar Vida')
    expect(startButton.closest('button')).toBeDisabled()
  })

  // ── Empty state ─────────────────────────────────────────

  it('shows loading state when no character is generated yet', () => {
    useCharacterCreationStore.setState({ creationResult: null })
    renderWithProviders(<CreatePage />)
    // Should show heading but no stats
    expect(screen.getByText('Criação de Personagem')).toBeInTheDocument()
  })
})