import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Choice {
  label: string
  effects: Record<string, number>
}

interface EventCardProps {
  description: string
  choices?: Choice[]
  onChoice?: (index: number) => void
}

export function EventCard({ description, choices, onChoice }: EventCardProps) {
  const { t } = useTranslation()

  return (
    <Card className="bg-gray-900 border-gray-700 text-white rounded-none">
      <CardContent className="p-4">
        <p className="text-sm leading-relaxed">{t(description)}</p>
        {choices && choices.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start rounded-none border-gray-600 bg-gray-800 text-white hover:bg-gray-700 hover:text-white"
                onClick={() => onChoice?.(index)}
              >
                {t(choice.label)}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
