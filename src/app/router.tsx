import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import { HomePage } from './pages/HomePage'
import { GamePage } from './pages/GamePage'
import { GameOverPage } from './pages/GameOverPage'
import { CreatePage } from './pages/CreatePage'
import { GameLayout } from './layouts/GameLayout'

const rootRoute = createRootRoute({
  component: GameLayout,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const newLifeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreatePage,
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  newLifeRoute,
  gameRoute,
  gameOverRoute,
])

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <div>Página não encontrada</div>,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
