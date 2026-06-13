import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/8bit/button'

interface AgeButtonProps {
  onAge: () => void
  disabled?: boolean
  isInfancy?: boolean
}

export function AgeButton({ onAge, disabled, isInfancy }: AgeButtonProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <Button
        onClick={onAge}
        disabled={disabled}
        className="w-full py-4 text-lg font-bold rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('ageButton.label')}
      </Button>
      {isInfancy && (
        <span className="text-xs text-gray-400 animate-pulse">
          {t('ageButton.infancyAuto')}
        </span>
      )}
    </div>
  )
}
