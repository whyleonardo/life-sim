import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/8bit/button'

interface Action {
  label: string
  description: string
  statEffects: Record<string, number>
}

interface ActionSelectorProps {
  actions: Action[]
  onSelect: (index: number) => void
  selected?: number
}

export function ActionSelector({ actions, onSelect, selected }: ActionSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={selected === index ? 'default' : 'outline'}
            className={`whitespace-nowrap rounded-none px-4 py-2 text-sm ${
              selected === index ? 'ring-2 ring-white' : ''
            }`}
            onClick={() => onSelect(index)}
          >
            {t(action.label)}
          </Button>
        ))}
      </div>
    </div>
  )
}
