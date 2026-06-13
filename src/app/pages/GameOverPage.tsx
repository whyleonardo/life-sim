import { useParams } from '@tanstack/react-router'

export function GameOverPage() {
  const { id } = useParams({ from: '/gameover/$id' })
  return <h1>Fim de Jogo {id}</h1>
}
