import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  useCharacterCreationStore,
  getCurrentCharacter,
} from '@/features/character/store'
import { StatBar } from '@/components/game/StatBar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    creationResult,
    customName,
    customGender,
    saving,
    error,
    reroll,
    setName,
    setGender,
    confirmCreation,
    reset,
  } = useCharacterCreationStore()

  useEffect(() => {
    useCharacterCreationStore.getState().initialize()
  }, [])

  const currentCharacter = getCurrentCharacter(
    useCharacterCreationStore.getState(),
  )

  const handleStartLife = async () => {
    try {
      const gameId = await confirmCreation()
      navigate({ to: '/game/$id', params: { id: String(gameId) } })
    } catch {
      // Error is handled by the store setting error state
    }
  }

  const handleBack = () => {
    reset()
    navigate({ to: '/' })
  }

  const activeGender =
    customGender ?? creationResult?.character.gender ?? 'male'

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="mb-2 text-center text-2xl font-bold text-white">
        {t('screens.characterCreation')}
      </h1>

      {error && (
        <div className="rounded bg-red-900/50 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!creationResult ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-gray-400">Carregando...</div>
        </div>
      ) : (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {t('character.name')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <input
              type="text"
              value={currentCharacter?.character.name ?? ''}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white">
                {t('character.gender')}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 ${
                    activeGender === 'male'
                      ? 'border-2 border-amber-500 bg-amber-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'border-2 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t('character.male')}
                </Button>
                <Button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 ${
                    activeGender === 'female'
                      ? 'border-2 border-amber-500 bg-amber-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                      : 'border-2 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t('character.female')}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <StatBar
                name="stats.health"
                value={currentCharacter!.character.health}
              />
              <StatBar
                name="stats.happiness"
                value={currentCharacter!.character.happiness}
              />
              <StatBar
                name="stats.smarts"
                value={currentCharacter!.character.smarts}
              />
              <StatBar
                name="stats.looks"
                value={currentCharacter!.character.looks}
              />
              <StatBar
                name="stats.money"
                value={currentCharacter!.character.money}
              />
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <Button
                onClick={reroll}
                className="border-2 border-gray-600 bg-gray-700 px-6 py-4 text-base font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-gray-600"
              >
                {t('common.reroll')}
              </Button>

              <Button
                onClick={handleStartLife}
                disabled={saving}
                className="border-2 border-amber-500 bg-amber-600 px-6 py-4 text-base font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('common.start')}
              </Button>

              <Button
                onClick={handleBack}
                className="border-2 border-gray-600 bg-gray-700 px-6 py-4 text-base font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-gray-600"
              >
                {t('common.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
