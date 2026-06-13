import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function GamePage() {
  const { t } = useTranslation()
  const { id } = useParams({ from: '/game/$id' })
  return <h1>{t('screens.game')} {id}</h1>
}
