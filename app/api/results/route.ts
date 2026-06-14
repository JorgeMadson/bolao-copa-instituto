import { NextResponse } from "next/server"
import { fetchExternalResults } from "@/lib/openfootball"

export const revalidate = 300 // 5 minutos

export async function GET() {
  try {
    const results = await fetchExternalResults()
    return NextResponse.json({ results })
  } catch (err) {
    console.error("[api/results]", err)
    return NextResponse.json(
      { error: "Não foi possível buscar os resultados." },
      { status: 500 },
    )
  }
}
