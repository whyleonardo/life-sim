import { useParams } from '@tanstack/react-router'

export function GamePage() {
  const { id } = useParams({ from: '/game/$id' })
  return <h1>Jogo {id}</h1>
}
