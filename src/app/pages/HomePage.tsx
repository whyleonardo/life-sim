import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useHomeStore } from '@/features/home/store'
import { getLifePhase } from '@/shared/config/gameBalance'
import { LifePhaseBadge } from '@/components/game/LifePhaseBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Credenza,
  CredenzaTrigger,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaClose,
} from '@/components/ui/credenza'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { games, loading, error, canCreateNewLife, loadGames, deleteGame } =
    useHomeStore()

  useEffect(() => {
    loadGames()
  }, [loadGames])

  const handleGameClick = (gameId: number, status: 'alive' | 'dead') => {
    if (status === 'alive') {
      navigate({ to: '/game/$id', params: { id: String(gameId) } })
    } else {
      navigate({ to: '/gameover/$id', params: { id: String(gameId) } })
    }
  }

  const handleDelete = (gameId: number) => {
    deleteGame(gameId)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="mb-2 text-center text-2xl font-bold">
        {t('screens.home')}
      </h1>

      {loading && games.length === 0 && (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-gray-400">Carregando...</div>
        </div>
      )}

      {error && (
        <div className="rounded bg-red-900/50 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && games.length === 0 && !error && (
        // ── Empty State ──────────────────────────────────────
        <div className="flex flex-col items-center gap-6 py-12">
          <p className="text-center text-gray-400">{t('home.emptyState')}</p>
          <Button
            onClick={() => navigate({ to: '/create' })}
            className="border-2 border-amber-500 bg-amber-600 px-8 py-6 text-lg font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-amber-500"
          >
            {t('home.newLifeButton')}
          </Button>
        </div>
      )}

      {games.length > 0 && (
        // ── Game List ─────────────────────────────────────────
        <>
          <div className="mb-2 flex flex-col items-center gap-1">
            <Button
              onClick={() => navigate({ to: '/create' })}
              disabled={!canCreateNewLife}
              className="border-2 border-amber-500 bg-amber-600 px-8 py-6 text-lg font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('home.newLifeButton')}
            </Button>
            {!canCreateNewLife && (
              <p className="text-xs text-amber-400">
                {t('home.maxLivesReached')}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {games.map((game) => {
              const character = game.character
              const phase = character
                ? getLifePhase(character.age)
                : undefined

              return (
                <Card
                  key={game.id}
                  className="cursor-pointer border-gray-700 bg-gray-800 transition-colors hover:bg-gray-750"
                  onClick={() => handleGameClick(game.id!, game.status)}
                >
                  <CardContent className="p-4">
                    {/* Top row: status dot + name + delete */}
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                            game.status === 'alive'
                              ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
                              : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                          }`}
                        />
                        <span className="truncate font-medium text-white">
                          {character?.name ?? `#${game.id}`}
                        </span>
                      </div>

                      <Credenza>
                        <CredenzaTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0 text-gray-400 hover:bg-red-900/30 hover:text-red-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('home.deleteGame')}
                          </Button>
                        </CredenzaTrigger>
                        <CredenzaContent>
                          <CredenzaHeader>
                            <CredenzaTitle>
                              {t('home.confirmDelete')}
                            </CredenzaTitle>
                            <CredenzaDescription>
                              {character?.name ?? `#${game.id}`}
                            </CredenzaDescription>
                          </CredenzaHeader>
                          <CredenzaFooter>
                            <CredenzaClose asChild>
                              <Button variant="outline">
                                {t('common.cancel')}
                              </Button>
                            </CredenzaClose>
                            <CredenzaClose asChild>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(game.id!)}
                              >
                                {t('common.delete')}
                              </Button>
                            </CredenzaClose>
                          </CredenzaFooter>
                        </CredenzaContent>
                      </Credenza>
                    </div>

                    {/* Life phase badge */}
                    {phase && character && (
                      <div className="mt-2">
                        <LifePhaseBadge
                          phase={phase}
                          age={character.age}
                        />
                      </div>
                    )}

                    {/* CTA hint */}
                    <p className="mt-1 text-xs text-gray-500">
                      {game.status === 'alive'
                        ? t('home.continueGame')
                        : t('home.viewSummary')}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
