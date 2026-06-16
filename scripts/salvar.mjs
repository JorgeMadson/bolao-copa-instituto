#!/usr/bin/env node
// Salva as alterações dos dados do bolão no Git.
// Uso: npm run salvar  (ou: npm run salvar -- "mensagem do commit")
//
// O que faz:
//   1. git add nos arquivos de dados (placares, palpites, jogos)
//   2. git commit com uma mensagem (padrão: data/hora atual)
//   3. git push para o repositório remoto
//
// Assim os dados ficam versionados e atualizados para todos os colegas.

import { execSync } from "node:child_process"

const args = process.argv.slice(2)
const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
const message = args.join(" ").trim() || `Atualiza placares do bolão - ${now}`

function run(cmd) {
  console.log(`\n$ ${cmd}`)
  execSync(cmd, { stdio: "inherit" })
}

try {
  // Adiciona apenas os arquivos de dados do bolão.
  run("git add data/predictions.json data/matches.json")

  // Verifica se há algo para commitar.
  const status = execSync("git status --porcelain data", { encoding: "utf8" }).trim()
  if (!status) {
    console.log("\nNada para salvar: os dados já estão atualizados.")
    process.exit(0)
  }

  run(`git commit -m "${message.replace(/"/g, '\\"')}"`)
  run("git push")

  console.log("\n✓ Dados do bolão salvos e enviados para o Git com sucesso!")
} catch (err) {
  console.error("\n✗ Não foi possível salvar no Git.")
  console.error("  Verifique se você está em um repositório Git com remote configurado.")
  process.exit(1)
}
