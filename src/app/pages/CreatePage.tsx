import { useTranslation } from 'react-i18next'

export function CreatePage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">{t('screens.characterCreation')}</h1>
    </div>
  )
}
