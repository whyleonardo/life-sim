import { useTranslation } from 'react-i18next'

interface StatBarProps {
  name: string
  value: number
  color?: string
}

const defaultColors: Record<string, string> = {
  'stats.health': 'bg-green-500',
  'stats.happiness': 'bg-yellow-500',
  'stats.smarts': 'bg-blue-500',
  'stats.looks': 'bg-pink-500',
  'stats.money': 'bg-amber-500',
}

export function StatBar({ name, value, color }: StatBarProps) {
  const { t } = useTranslation()
  const barColor = color ?? defaultColors[name] ?? 'bg-gray-500'
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-white">{t(name)}</span>
        <span className="text-sm font-medium text-white">{clampedValue}</span>
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-sm overflow-hidden">
        <div
          data-testid="stat-bar-progress"
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}
