import { useTranslation } from 'react-i18next'
import { LifePhase, LIFE_PHASES } from '@/shared/config/gameBalance'

interface LifePhaseBadgeProps {
  phase: LifePhase
  age: number
}

const phaseColors: Record<LifePhase, string> = {
  infancy: 'bg-pink-900 text-pink-200 border-pink-700',
  school: 'bg-blue-900 text-blue-200 border-blue-700',
  youngAdult: 'bg-green-900 text-green-200 border-green-700',
  adult: 'bg-amber-900 text-amber-200 border-amber-700',
  senior: 'bg-purple-900 text-purple-200 border-purple-700',
}

export function LifePhaseBadge({ phase, age }: LifePhaseBadgeProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-none border px-3 py-1 text-xs font-medium ${phaseColors[phase]}`}
      >
        {t(LIFE_PHASES[phase])}
      </span>
      <span className="text-xs text-gray-400">
        {t('lifePhase.ageDisplay', { age })}
      </span>
    </div>
  )
}
