/**
 * Criar 9 Carrosséis com Texto FLUIDO
 * Máximo 5 slides cada
 * Cada frase com ponto = novo parágrafo
 */

const fs = require('fs');
const path = require('path');

// CARROSSEL #1 - 5 Erros de Engajamento
const carrossel1 = {
  numero: 1,
  titulo: '5 Erros Que Matam Seu Engajamento',
  slides: [
    {
      texto: `Auditoriei minha conta.

70% do conteúdo era INÚTIL.

(você comete os mesmos erros)`
    },
    {
      texto: `ERRO #1:

Posts sem mecanismo único.

Genérico = zero engajamento`
    },
    {
      texto: `ERRO #2:

95% emoção, 0% framework.

Gera ansiedade, não oferece solução.`
    },
    {
      texto: `ERRO #3:

CTAs misteriosos.

"Link na bio pro PAIN"

(70% desistem sem clicar)`
    },
    {
      texto: `QUER AUDITORIA DA SUA CONTA?

DM "AUDITORIA"

(15 vagas grátis hoje)`
    }
  ]
};

// CARROSSEL #2 - 70% Inútil
const carrossel2 = {
  numero: 2,
  titulo: 'Por Que 70% Do Meu Conteúdo Era Inútil',
  slides: [
    {
      texto: `Paguei R$ 15k numa auditoria.

Descobri que 70% do meu conteúdo era inútil.

Aqui está o diagnóstico:`
    },
    {
      texto: `PROBLEMA #1:

Sem mecanismo único.

Igual a 1.000 outros criadores de conteúdo.`
    },
    {
      texto: `PROBLEMA #2:

PAIN era um mistério.

Ninguém sabia o que eu vendia.`
    },
    {
      texto: `PROBLEMA #3:

Vale da Ansiedade Aspiracional.

Inspirava mas não transformava.`
    },
    {
      texto: `QUER DIAGNÓSTICO DA SUA CONTA?

DM "DIAGNÓSTICO"

(10 vagas grátis)`
    }
  ]
};

// CARROSSEL #3 - 3 Frameworks
const carrossel3 = {
  numero: 3,
  titulo: '3 Frameworks De Copywriting',
  slides: [
    {
      texto: `3 frameworks que aprendi auditando minha conta.

Use hoje mesmo.`
    },
    {
      texto: `FRAMEWORK #1:

Mecanismo Único

[Resultado] via [Como único]

ex: "10k seguidores com posts de 1min/dia"`
    },
    {
      texto: `FRAMEWORK #2:

Grand Slam Offer

Sonho × Certeza ÷ Tempo × Esforço`
    },
    {
      texto: `FRAMEWORK #3:

Framework de 1 Sentença

[Resultado] + [Mecanismo] + [Prova Social]`
    },
    {
      texto: `QUER PDF COM 12 FRAMEWORKS?

DM "FRAMEWORKS"

(20 vagas)`
    }
  ]
};

// CARROSSEL #4 - PAIN Revelado
const carrossel4 = {
  numero: 4,
  titulo: 'PAIN Revelado',
  slides: [
    {
      texto: `Nunca revelei o que é PAIN.

Hoje vou mostrar tudo.

(sistema completo de IA)`
    },
    {
      texto: `O QUE É PAIN:

Sistema de IA que faz empresas faturarem +30% em 90 dias.

147 clientes testaram.`
    },
    {
      texto: `COMO FUNCIONA:

4 pilares de automação:
• Prospecção IA
• Atendimento IA
• Inside Sales IA
• Negociação IA`
    },
    {
      texto: `RESULTADOS:

• 89% faturaram +30%
• Média R$ 47k em 60 dias
• 12 de 15 dobraram vendas`
    },
    {
      texto: `QUER PAIN NA SUA EMPRESA?

DM "PAIN"

Investimento: R$ 19.970
(7 vagas)`
    }
  ]
};

// CARROSSEL #5 - 8 Empresas 1BI
const carrossel5 = {
  numero: 5,
  titulo: '8 Empresas De 1 Bilhão',
  slides: [
    {
      texto: `Nunca contei como faturei 8 empresas de 1 bilhão.

Até agora.`
    },
    {
      texto: `O SISTEMA:

1. Identifiquei o gargalo
2. Criei método proprietário
3. Multipliquei com IA`
    },
    {
      texto: `CASOS REAIS:

• SaaS B2B: R$ 2M → R$ 50M
• E-commerce: R$ 800k → R$ 15M
• Infoproduto: R$ 200k → R$ 8M`
    },
    {
      texto: `O SEGREDO:

Não é trabalhar mais.

É ter um SISTEMA que multiplica seu resultado.`
    },
    {
      texto: `QUER O SISTEMA TURBINADO POR IA?

DM "SISTEMA"

PAIN: R$ 19.970
(7 vagas)`
    }
  ]
};

// CARROSSEL #6 - Imersão IA
const carrossel6 = {
  numero: 6,
  titulo: 'Imersão IA Alphaville',
  slides: [
    {
      texto: `IMERSÃO IA PRESENCIAL

6-7 Março | Alphaville-SP

Transforme sua empresa em 2 dias intensivos.`
    },
    {
      texto: `O QUE VOCÊ VAI APRENDER:

• 4 pilares PAIN
• Automação vendas com IA
• Sistema completo funcionando`
    },
    {
      texto: `BÔNUS INCLUSOS:

✓ Acesso vitalício PAIN
✓ Suporte 90 dias
✓ Templates prontos
✓ Hospedagem inclusa`
    },
    {
      texto: `GARANTIA:

Se não faturar +30% em 90 dias, devolvemos 100% + R$ 5k.

Zero risco.`
    },
    {
      texto: `IMERSÃO IA ALPHAVILLE

Investimento: R$ 12.970
(8 vagas)

DM "IMERSÃO"`
    }
  ]
};

// CARROSSEL #7 - Framework 1 Sentença
const carrossel7 = {
  numero: 7,
  titulo: 'Framework de 1 Sentença',
  slides: [
    {
      texto: `Passei 3 anos testando headlines no Instagram.

Descobri uma fórmula que funciona em 8 de 10.`
    },
    {
      texto: `O FRAMEWORK:

[Resultado específico] + [Mecanismo único] + [Prova quantificável]`
    },
    {
      texto: `EXEMPLO:

"Como ganhar 10k seguidores com conteúdo de 1 min/dia (testado em 50 perfis)"`
    },
    {
      texto: `POR QUE FUNCIONA:

✓ Resultado claro
✓ Diferenciação
✓ Credibilidade`
    },
    {
      texto: `QUER 12 FRAMEWORKS DE COPY?

DM "FRAMEWORKS"

(50 vagas)`
    }
  ]
};

// CARROSSEL #8 - Vale da Ansiedade
const carrossel8 = {
  numero: 8,
  titulo: 'Vale da Ansiedade Aspiracional',
  slides: [
    {
      texto: `Você curte posts motivacionais mas nunca muda nada?

Está no "Vale da Ansiedade Aspiracional".`
    },
    {
      texto: `O QUE É:

Loop vicioso de consumo sem ação.

2h/dia de conteúdo.

0% implementação.`
    },
    {
      texto: `O CUSTO:

⏱️ 730h/ano perdidas
💰 R$ 50k-500k não ganhos
🧠 Ansiedade crônica`
    },
    {
      texto: `COMO SAIR:

Regra 1/3/1

1min ler
3min adaptar
1 ação HOJE`
    },
    {
      texto: `QUER DIAGNÓSTICO PERSONALIZADO?

DM "VALE"

(20 vagas hoje)`
    }
  ]
};

// CARROSSEL #9 - IA Elimina Categoria
const carrossel9 = {
  numero: 9,
  titulo: 'IA Elimina Categoria',
  slides: [
    {
      texto: `IA não vai roubar emprego.

Vai ELIMINAR sua categoria inteira.

Você tem < 3 anos.`
    },
    {
      texto: `CATEGORIAS EM RISCO:

🔴 VA genérico
🔴 Copywriter jr
🔴 Designer de templates
🔴 Analista de planilhas`
    },
    {
      texto: `TESTE:

Sua categoria vai sumir?

4 perguntas no próximo slide`
    },
    {
      texto: `PERGUNTAS:

1. Processos repetitivos?
2. Só "passa informação"?
3. Não cria proprietário?
4. IA já faz 40%+ disso?

3+ SIM = < 3 anos`
    },
    {
      texto: `TRANSFORMAÇÃO:

DM "TRANSFORMAÇÃO"

Diagnóstico + Plano
(30 vagas)`
    }
  ]
};

// Salvar todos
const outputDir = path.join(__dirname, '../squad-auditores/output-fluidos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const carrosseis = [
  carrossel1, carrossel2, carrossel3,
  carrossel4, carrossel5, carrossel6,
  carrossel7, carrossel8, carrossel9
];

console.log('🚀 Criando 9 carrosséis FLUIDOS\n');
console.log('📐 Regra: Cada frase com ponto = novo parágrafo\n');

let totalSlides = 0;

carrosseis.forEach(carrossel => {
  const filename = `carrossel_${carrossel.numero}_fluido.json`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(carrossel, null, 2), 'utf-8');

  console.log(`✅ Carrossel #${carrossel.numero}: ${carrossel.titulo}`);
  console.log(`   ${carrossel.slides.length} slides`);
  console.log(`   Arquivo: ${filename}\n`);

  totalSlides += carrossel.slides.length;
});

console.log('═══════════════════════════════════════\n');
console.log('🎉 9 CARROSSÉIS FLUIDOS CRIADOS!\n');
console.log(`📊 Total de slides: ${totalSlides}`);
console.log(`📁 Pasta: squad-auditores/output-fluidos/\n`);
console.log('💡 Texto fluido: uma frase, um parágrafo!\n');
