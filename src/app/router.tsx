import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import { HomePage } from './pages/HomePage'
import { GamePage } from './pages/GamePage'
import { GameOverPage } from './pages/GameOverPage'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game/$id',
  component: GamePage,
})

const gameOverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gameover/$id',
  component: GameOverPage,
})

const routeTree = rootRoute.addChildren([homeRoute, gameRoute, gameOverRoute])

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <div>Página não encontrada</div>,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
