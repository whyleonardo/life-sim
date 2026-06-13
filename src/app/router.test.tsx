import { describe, it, expect } from 'vitest'
import { router } from './router'

describe('Router', () => {
  it('has all required routes', () => {
    const routes = router.routeTree.children
    expect(routes).toBeDefined()
    expect(routes?.length).toBe(3)
  })
})
