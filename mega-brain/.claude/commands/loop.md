# /loop - Acoes em Loops Especificos

Gerencia loops individuais ou em lote.

## SINTAXE

```
/loop [acao] [id]
```

## ACOES DISPONIVEIS

### /loop exec [ID]
Executa o comando sugerido do loop.

```
🔄 Executando loop {ID}...

{EXECUTAR SUGGESTED_COMMAND DO LOOP}

✅ Loop {ID} executado: "{DESCRIPTION}"
   Comando: {SUGGESTED_COMMAND}

📌 Loops restantes: {N}
```

**Acao:**
1. Ler o loop do OPEN-LOOPS.json
2. Executar o suggested_command
3. Marcar status como "CLOSED"
4. Mover para closed_this_session
5. Salvar OPEN-LOOPS.json

### /loop close [ID]
Fecha um loop sem executar (usuario resolveu manualmente).

```
✅ Loop {ID} fechado: "{DESCRIPTION}"
   Motivo: Resolvido pelo usuario

📌 Loops restantes: {N}
```

**Acao:**
1. Marcar status como "CLOSED"
2. Mover para closed_this_session
3. Salvar OPEN-LOOPS.json

### /loop close-all
Fecha todos os loops abertos.

```
✅ {N} loops fechados nesta sessao:
   • {ID}: {DESCRIPTION}
   • {ID}: {DESCRIPTION}

Deseja comecar do zero ou ha algo especifico para fazer?
```

**Acao:**
1. Marcar todos como "CLOSED"
2. Mover todos para closed_this_session
3. Salvar OPEN-LOOPS.json

### /loop dismiss [ID]
Dispensa um loop (nao vai mais aparecer).

```
⏭️ Loop {ID} dispensado: "{DESCRIPTION}"
   Motivo: Usuario optou por nao executar

📌 Loops restantes: {N}
```

**Acao:**
1. Marcar status como "DISMISSED"
2. Mover para dismissed_this_session
3. Salvar OPEN-LOOPS.json

### /loop dismiss-all
Dispensa todos os loops.

```
⏭️ {N} loops dispensados:
   • {ID}: {DESCRIPTION}
   • {ID}: {DESCRIPTION}

Tudo limpo. O que deseja fazer agora?
```

### /loop info [ID]
Mostra detalhes de um loop especifico.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  📋 LOOP {ID}                                                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Descricao: {DESCRIPTION}                                                    ║
║  Tipo: {TYPE}                                                                ║
║  Prioridade: {PRIORITY}                                                      ║
║  Status: {STATUS}                                                            ║
║  Criado em: {CREATED_AT}                                                     ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  Contexto: {CONTEXT}                                                         ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  Comando sugerido: {SUGGESTED_COMMAND}                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

Acoes: [Executar] [Fechar] [Dispensar]
```

## ATUALIZACAO DO JSON

Apos qualquer acao, atualizar `/system/OPEN-LOOPS.json`:
- Atualizar last_updated com timestamp atual
- Mover loop para array apropriado (closed/dismissed)
- Atualizar status do loop

## ERROS

Se ID nao existe:
```
❌ Loop {ID} nao encontrado.

Loops disponiveis:
• OL-001: {DESCRIPTION}
• OL-002: {DESCRIPTION}
```

Se nenhum loop aberto:
```
✅ Nenhum loop aberto para gerenciar.
```
