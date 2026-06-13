import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/shared/lib/i18n'

export function renderWithI18n(ui: React.ReactElement) {
  return rtlRender(
    <I18nextProvider i18n={i18n}>
      {ui}
    </I18nextProvider>
  )
}
