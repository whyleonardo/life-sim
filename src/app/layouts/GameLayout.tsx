import { Outlet } from '@tanstack/react-router'

export function GameLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-gray-900">
        <Outlet />
      </div>
    </div>
  )
}
