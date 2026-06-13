import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function GameOverPage() {
  const { t } = useTranslation()
  const { id } = useParams({ from: '/gameover/$id' })
  return <h1>{t('screens.gameOver')} {id}</h1>
}
