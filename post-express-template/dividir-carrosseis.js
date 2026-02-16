/**
 * Dividir 9 Carrosséis em Slides Curtos
 *
 * Regra: Máximo 3-4 linhas por slide
 * Objetivo: Visual limpo e fácil de ler
 */

const fs = require('fs');
const path = require('path');

// Carrossel #7 - Framework de 1 Sentença
const carrossel7 = {
  titulo: 'Framework de 1 Sentença',
  slides: [
    {
      texto: `Passei 3 anos testando
headlines no Instagram.

Descobri uma fórmula
que funciona em 8 de 10.`
    },
    {
      texto: `O "Framework
de 1 Sentença"

(Salva esse post →)`
    },
    {
      texto: `A FÓRMULA:

[Resultado específico]
[Mecanismo único]
[Prova quantificável]`
    },
    {
      texto: `EXEMPLO:

"Como ganhar 10k seguidores
com conteúdo de 1 min/dia
(testado em 50 perfis)"`
    },
    {
      texto: `Viu como fica
MUITO mais atraente?

Isso é copywriting
científico.`
    },
    {
      texto: `TEMPLATE EDITÁVEL:

"Como [RESULTADO]
usando [MECANISMO]
([PROVA SOCIAL])"`
    },
    {
      texto: `EXEMPLO PRÁTICO:

"Como faturar R$ 50k/mês
vendendo infoprodutos
(147 alunos replicaram)"`
    },
    {
      texto: `POR QUE FUNCIONA?

✓ Resultado específico
✓ Mecanismo único
✓ Prova quantificável`
    },
    {
      texto: `USE AGORA:

1. Escolha seu próximo post
2. Aplique o framework
3. Poste e marca @frankcosta`
    },
    {
      texto: `QUER 12 FRAMEWORKS
ASSIM?

DM "FRAMEWORKS"

(50 vagas hoje)`
    }
  ]
};

// Carrossel #8 - Vale da Ansiedade
const carrossel8 = {
  titulo: 'Vale da Ansiedade Aspiracional',
  slides: [
    {
      texto: `Você curte posts
motivacionais mas
nunca muda nada?

Você está no
"Vale da Ansiedade
Aspiracional"`
    },
    {
      texto: `O QUE É:

Você consome conteúdo
mas não implementa.

Loop vicioso de
inspiração sem ação.`
    },
    {
      texto: `SINTOMA 1:

Consome 2h+ de
conteúdo por dia

Implementa: 0`
    },
    {
      texto: `SINTOMA 2:

Salva 50+ posts
"pra ver depois"

Volta neles: nunca`
    },
    {
      texto: `SINTOMA 3:

Taxa de ação < 1%

De 100 posts,
age em menos de 1`
    },
    {
      texto: `O CUSTO:

⏱️ 730h/ano perdidas
💰 R$ 50k-500k não ganhos
🧠 Ansiedade crônica`
    },
    {
      texto: `SAÍDA - PASSO 1:

Regra 1/3/1

1min ler
3min adaptar
1 ação hoje`
    },
    {
      texto: `SAÍDA - PASSO 2:

Antes de salvar, pergunte:

✅ Tem mecanismo claro?
✅ É específico?
✅ Posso aplicar hoje?`
    },
    {
      texto: `SAÍDA - PASSO 3:

Mude sua dieta:

50% Frameworks
30% Dados
20% Inspiração`
    },
    {
      texto: `QUANDO VOCÊ SAI:

✅ Menos consumo
✅ Mais execução
✅ 10x resultados
✅ Zero ansiedade`
    },
    {
      texto: `QUER DIAGNÓSTICO
PERSONALIZADO?

DM "DIAGNÓSTICO"

(20 vagas hoje)`
    }
  ]
};

// Carrossel #9 - IA Elimina Categoria
const carrossel9 = {
  titulo: 'IA Elimina Categoria',
  slides: [
    {
      texto: `IA não vai roubar
seu emprego.

Vai fazer algo pior:

Vai ELIMINAR
sua categoria inteira.`
    },
    {
      texto: `A DIFERENÇA:

"Roubar emprego"
= substituição

"Eliminar categoria"
= função deixa de existir`
    },
    {
      texto: `CATEGORIAS EM RISCO:

🔴 VA genérico
🔴 Copywriter jr
🔴 Designer de templates
🔴 Gerente "roteador"
🔴 Analista de planilhas`
    },
    {
      texto: `POR QUE AGORA?

2023: IA faz tarefas
2024: IA faz workflows
2025: IA faz categorias
      inteiras`
    },
    {
      texto: `TESTE:

Sua categoria vai sumir?

Se 3+ SIM,
você tem < 3 anos.

(teste no próximo slide)`
    },
    {
      texto: `PERGUNTAS:

1. Executa processos repetitivos?
2. Trabalho é "passar info"?
3. Não cria algo proprietário?
4. IA já faz 40%+ disso?`
    },
    {
      texto: `SOLUÇÃO:

Não compita COM IA.
Comande A IA.

Suba na cadeia
de valor.`
    },
    {
      texto: `TRANSFORMAÇÃO:

❌ Designer que faz
✅ Designer que cria sistemas

❌ Copywriter que escreve
✅ Estrategista de copy`
    },
    {
      texto: `3 MOVIMENTOS:

1️⃣ PROPRIEDADE
   Crie framework único

2️⃣ MULTIPLICAÇÃO
   Use IA pra 10x mais

3️⃣ ESTRATÉGIA
   Vire o cérebro`
    },
    {
      texto: `SUA CATEGORIA
TEM < 3 ANOS.

Ignora e vira estatística,
ou transforma agora.`
    },
    {
      texto: `TRANSFORMAÇÃO:

DM "TRANSFORMAÇÃO"

Diagnóstico +
Plano de ação

(30 vagas hoje)`
    }
  ]
};

// Salvar carrosséis divididos
const outputDir = path.join(__dirname, '../squad-auditores/output-divididos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function salvarCarrossel(carrossel, numero) {
  const filename = `carrossel_${numero}_dividido.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(carrossel, null, 2), 'utf-8');

  console.log(`✅ Carrossel #${numero}: ${carrossel.titulo}`);
  console.log(`   ${carrossel.slides.length} slides`);
  console.log(`   Salvo: ${filename}\n`);
}

console.log('🚀 Dividindo carrosséis em slides curtos...\n');
console.log('📐 Regra: 3-4 linhas por slide\n');

salvarCarrossel(carrossel7, 7);
salvarCarrossel(carrossel8, 8);
salvarCarrossel(carrossel9, 9);

console.log('🎉 3 carrosséis divididos!\n');
console.log('📁 Pasta: squad-auditores/output-divididos/\n');
console.log('💡 Próximo: Criar os outros 6 carrosséis...\n');
