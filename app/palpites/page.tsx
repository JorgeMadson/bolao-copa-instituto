import Link from "next/link"
import { PredictionForm } from "@/components/prediction-form"
import { getMatches, getParticipants } from "@/lib/scoring"

export const dynamic = "force-dynamic"

export default async function PalpitesPage() {
  const matches = getMatches()
  const participants = await getParticipants()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 md:py-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Meus palpites
          </span>
          <Link
            href="/"
            className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Voltar ao bolão
          </Link>
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
          Enviar palpites
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Acerte o placar exato e marque 1 ponto. No mata-mata, ganhe +1 ponto
          acertando quem se classifica. Você pode editar seus palpites até o
          início de cada jogo.
        </p>
      </header>

      <PredictionForm
        matches={matches}
        participants={participants}
        nowMs={Date.now()}
      />
    </main>
  )
}
