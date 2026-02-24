/**
 * Script de teste para Advanced Prompt Engineering
 * Testa os templates e mostra os prompts gerados para diferentes tipos de entidades
 */

// Para rodar: node scripts/test-advanced-prompts.mjs

import { createContextualImagePrompt } from '../lib/contextual-image-prompt.ts'
import {
  createBrandLogoPrompt,
  createDashboardInterfacePrompt,
  createPersonPortraitPrompt,
  createMarketingConceptPrompt,
} from '../lib/advanced-prompt-templates.ts'

console.log('🧪 ========================================')
console.log('🧪 ADVANCED PROMPT ENGINEERING - TESTES')
console.log('🧪 ========================================\n')

// ===== TESTE 1: Brand Logo =====
console.log('\n📌 TESTE 1: Brand Logo (Nike)')
console.log('─'.repeat(80))
const slideNike = {
  titulo: 'Nike: Branding Icônico',
  corpo: 'Como a Nike construiu uma marca bilionária com o swoosh',
}
const promptNike = createContextualImagePrompt(
  slideNike,
  { titulo: 'Marketing de Marcas', tipo: 'educacional' },
  { nicho: 'Marketing Digital' }
)
console.log('📝 Prompt gerado:\n')
console.log(promptNike)
console.log('\n✅ Elementos esperados:')
console.log('   - Logo Nike proeminente e centralizado')
console.log('   - Cores oficiais da Nike')
console.log('   - Fundo limpo (branco ou gradiente)')
console.log('   - Fotografia profissional de produto')
console.log('\n❌ EVITAR:')
console.log('   - Foto genérica de tênis')
console.log('   - Pessoa correndo')
console.log('   - Logo modificado ou similar')

// ===== TESTE 2: Dashboard Interface =====
console.log('\n\n📌 TESTE 2: Dashboard Interface (Google Analytics)')
console.log('─'.repeat(80))
const slideGA = {
  titulo: 'Como usar o Google Analytics',
  corpo: 'Análise de métricas e KPIs no dashboard do GA',
}
const promptGA = createContextualImagePrompt(
  slideGA,
  { titulo: 'Ferramentas de Marketing', tipo: 'educacional' },
  { nicho: 'Marketing Digital' }
)
console.log('📝 Prompt gerado:\n')
console.log(promptGA)
console.log('\n✅ Elementos esperados:')
console.log('   - Interface do Google Analytics reconhecível')
console.log('   - Gráficos, métricas, charts visíveis')
console.log('   - Layout do GA (sidebar, top bar)')
console.log('   - Cores do Google (azul, branco)')
console.log('\n❌ EVITAR:')
console.log('   - Dashboard genérico sem identidade do GA')
console.log('   - Interface de outra ferramenta')
console.log('   - Foto de pessoa olhando para tela')

// ===== TESTE 3: Person Portrait =====
console.log('\n\n📌 TESTE 3: Person Portrait (Gary Vaynerchuk)')
console.log('─'.repeat(80))
const slideGary = {
  titulo: 'Lições de Gary Vaynerchuk',
  corpo: 'Estratégias de marketing digital do Gary Vee para empreendedores',
}
const promptGary = createContextualImagePrompt(
  slideGary,
  { titulo: 'Marketing Estratégico', tipo: 'autoridade' },
  { nicho: 'Empreendedorismo' }
)
console.log('📝 Prompt gerado:\n')
console.log(promptGary)
console.log('\n✅ Elementos esperados:')
console.log('   - Foto profissional de Gary Vaynerchuk reconhecível')
console.log('   - Estilo keynote/conference (terno, palco, ou headshot)')
console.log('   - Expressão confiante e engajada')
console.log('   - Background limpo ou palco')
console.log('\n❌ EVITAR:')
console.log('   - Pessoa genérica/random businessman')
console.log('   - Foto casual/snapshot')
console.log('   - Pessoa errada')

// ===== TESTE 4: Marketing Concept =====
console.log('\n\n📌 TESTE 4: Marketing Concept (Funil de Vendas)')
console.log('─'.repeat(80))
const slideFunil = {
  titulo: 'Funil de Vendas Otimizado',
  corpo: 'Como melhorar cada etapa do funil para maximizar conversões',
}
const promptFunil = createContextualImagePrompt(
  slideFunil,
  { titulo: 'Estratégias de Conversão', tipo: 'vendas' },
  { nicho: 'Marketing Digital' }
)
console.log('📝 Prompt gerado:\n')
console.log(promptFunil)
console.log('\n✅ Elementos esperados:')
console.log('   - Representação visual de funil (diagrama, infográfico)')
console.log('   - Contexto de marketing/negócios')
console.log('   - Fotografia profissional e moderna')
console.log('   - Etapas do funil visíveis')
console.log('\n❌ EVITAR:')
console.log('   - Foto genérica de escritório')
console.log('   - Pessoas em reunião sem contexto de funil')
console.log('   - Imagens abstratas sem relação')

// ===== TESTE 5: Generic Fallback =====
console.log('\n\n📌 TESTE 5: Generic Fallback (sem entidade detectada)')
console.log('─'.repeat(80))
const slideGeneric = {
  titulo: 'Produtividade no Home Office',
  corpo: 'Dicas para trabalhar de casa com eficiência máxima',
}
const promptGeneric = createContextualImagePrompt(
  slideGeneric,
  { titulo: 'Produtividade', tipo: 'educacional' },
  { nicho: 'Desenvolvimento Pessoal' }
)
console.log('📝 Prompt gerado:\n')
console.log(promptGeneric)
console.log('\n✅ Elementos esperados:')
console.log('   - Setup de home office limpo e moderno')
console.log('   - Laptop, mesa organizada')
console.log('   - Iluminação natural')
console.log('   - Contexto profissional')
console.log('\n❌ EVITAR:')
console.log('   - Foto genérica de escritório corporativo')
console.log('   - Ambiente bagunçado')
console.log('   - Setup desatualizado')

// ===== COMPARAÇÃO: Antes vs Depois =====
console.log('\n\n📊 COMPARAÇÃO: Prompts Simples vs Advanced')
console.log('='.repeat(80))

console.log('\n🔴 ANTES (prompt simples):')
const promptSimples = 'Google Analytics, professional photography, high quality, modern aesthetic'
console.log(`   "${promptSimples}"`)
console.log(`   Tamanho: ${promptSimples.length} chars`)
console.log('   Resultado: ❌ Foto genérica de pessoa olhando para tela')

console.log('\n🟢 DEPOIS (advanced prompt engineering):')
const promptAvancado = createDashboardInterfacePrompt('Google Analytics')
console.log(`   "${promptAvancado.substring(0, 200)}..."`)
console.log(`   Tamanho: ${promptAvancado.length} chars (${Math.round(promptAvancado.length / promptSimples.length)}x maior)`)
console.log('   Resultado esperado: ✅ Interface do GA reconhecível com métricas visíveis')

console.log('\n\n✨ ========================================')
console.log('✨ TESTES CONCLUÍDOS')
console.log('✨ ========================================')
console.log('\n📖 Para mais informações, veja: ADVANCED-PROMPT-ENGINEERING.md\n')
