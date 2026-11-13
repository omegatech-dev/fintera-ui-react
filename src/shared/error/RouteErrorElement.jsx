import React, { lazy, Suspense } from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { useRollbar } from '@rollbar/react'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/shared/ui'

const NotFound = lazy(() => import('./NotFound'))

export default function RouteErrorElement() {
  const { t } = useLocale()
  const error = useRouteError()
  const rollbar = useRollbar()

  React.useEffect(() => {
    try {
      if (rollbar) {
        rollbar.error(error)
      }
    } catch {
      // ignore
    }
  }, [error, rollbar])

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-canvas">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          </div>
        }
      >
        <NotFound />
      </Suspense>
    )
  }

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`.trim()
    : t('errors.unexpectedError')
  const description = isRouteErrorResponse(error)
    ? error.data?.message ?? t('errors.pageNotFound')
    : error?.message || t('errors.somethingWentWrong')

  return (
    <main
      role="alert"
      className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12"
    >
      <div className="w-full max-w-lg rounded-card border border-line bg-surface p-8 text-center shadow-pop">
        <p className="text-display font-bold leading-none text-brand">
          {isRouteErrorResponse(error) ? error.status : '!'}
        </p>
        <h1 className="mt-3 text-page font-bold text-ink">{title}</h1>
        <p className="mt-2 break-words text-body text-ink-3">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>
            {t('common.reload')}
          </Button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-control border border-line-strong bg-surface px-4 text-body-lg font-semibold text-ink-2 transition-colors hover:bg-surface-2"
          >
            {t('errors.backToHome')}
          </a>
        </div>
      </div>
    </main>
  )
}
