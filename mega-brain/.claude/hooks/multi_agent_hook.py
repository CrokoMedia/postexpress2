#!/usr/bin/env python3
"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                  JARVIS MULTI-AGENT HOOK                                       ║
║                                                                                ║
║  Hook para Claude Code que detecta automaticamente quando usar agentes.       ║
║  Integra com user_prompt_submit para análise em tempo real.                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

FUNCIONAMENTO:
1. Intercepta cada prompt do usuário
2. Analisa complexidade e necessidade de agentes
3. Se necessário, injeta instruções de orquestração
4. Mantém log de decisões para aprendizado

TRIGGERS AUTOMÁTICOS:
- Tarefas com múltiplos aspectos
- Pedidos de análise profunda
- Comparações e avaliações
- Debates e war rooms explícitos
- Keywords de domínio específico
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

# Adicionar path dos scripts
# .claude/hooks/ -> .claude/ -> raiz do projeto
PROJECT_ROOT = Path(os.environ.get('CLAUDE_PROJECT_DIR', str(Path(__file__).parent.parent.parent)))
SCRIPTS_PATH = PROJECT_ROOT / "scripts"
sys.path.insert(0, str(SCRIPTS_PATH))

try:
    from jarvis_orchestrator import JarvisOrchestrator, TaskComplexity, ExecutionStrategy
except ImportError:
    # Fallback se módulo não disponível
    JarvisOrchestrator = None


# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

SYSTEM_PATH = PROJECT_ROOT / "system"
LOGS_PATH = PROJECT_ROOT / "logs"
CONFIG_FILE = SYSTEM_PATH / "multi_agent_config.json"

DEFAULT_CONFIG = {
    "enabled": True,
    "min_complexity_for_notification": 2,  # SIMPLE ou acima
    "auto_inject_orchestration": True,
    "log_all_analyses": True,
    "war_room_keywords": [
        "war room", "debate", "confrontar", "perspectivas diferentes",
        "prós e contras", "avaliar opções", "conselho", "board"
    ],
    "force_agents_keywords": [
        "use os agentes", "consulte especialistas", "análise profunda",
        "múltiplas perspectivas", "investigação completa"
    ],
    "skip_analysis_patterns": [
        r'^(oi|olá|bom dia|boa tarde|boa noite|hey|hi)[\s!.]*$',
        r'^(obrigado|valeu|thanks|ok|entendi|certo)[\s!.]*$',
        r'^(sim|não|yes|no)[\s!.]*$',
    ]
}


# ============================================================================
# HOOK PRINCIPAL
# ============================================================================

def load_config() -> Dict:
    """Carrega configuração do hook."""
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, 'r') as f:
                user_config = json.load(f)
                config = DEFAULT_CONFIG.copy()
                config.update(user_config)
                return config
        except Exception:
            pass
    return DEFAULT_CONFIG


def should_skip_analysis(prompt: str, config: Dict) -> bool:
    """Verifica se deve pular análise para este prompt."""
    import re
    
    prompt_lower = prompt.lower().strip()
    
    for pattern in config.get("skip_analysis_patterns", []):
        if re.match(pattern, prompt_lower, re.IGNORECASE):
            return True
    
    # Muito curto
    if len(prompt) < 10:
        return True
    
    return False


def detect_war_room_request(prompt: str, config: Dict) -> bool:
    """Detecta se usuário quer War Room explicitamente."""
    prompt_lower = prompt.lower()
    
    for keyword in config.get("war_room_keywords", []):
        if keyword in prompt_lower:
            return True
    
    return False


def detect_force_agents(prompt: str, config: Dict) -> bool:
    """Detecta se usuário quer forçar uso de agentes."""
    prompt_lower = prompt.lower()
    
    for keyword in config.get("force_agents_keywords", []):
        if keyword in prompt_lower:
            return True
    
    return False


def analyze_prompt(prompt: str) -> Dict[str, Any]:
    """
    Analisa o prompt e retorna recomendação de orquestração.
    
    Returns:
        Dict com análise e recomendações
    """
    if JarvisOrchestrator is None:
        return {
            "available": False,
            "reason": "Orchestrator não disponível"
        }
    
    try:
        orchestrator = JarvisOrchestrator()
        analysis = orchestrator.analyze_task(prompt)
        plan = orchestrator.create_orchestration_plan(analysis)
        
        return {
            "available": True,
            "complexity": analysis.complexity.name,
            "complexity_value": analysis.complexity.value,
            "requires_agents": analysis.requires_agents,
            "recommended_agents": [a.value for a in analysis.recommended_agents],
            "strategy": analysis.strategy.value,
            "reasoning": analysis.reasoning,
            "confidence": analysis.confidence,
            "domain": analysis.domain,
            "keywords": analysis.keywords[:10],
            "plan_summary": {
                "task_id": plan.task_id,
                "agents_count": len(plan.agents_to_activate),
                "synthesis_strategy": plan.synthesis_strategy
            },
            "orchestration_prompt": orchestrator.get_orchestration_prompt(plan)
        }
    
    except Exception as e:
        return {
            "available": False,
            "reason": str(e)
        }


def generate_agent_context(analysis: Dict, config: Dict) -> str:
    """
    Gera contexto de agentes para injetar no prompt.
    
    Este contexto instrui o JARVIS sobre como proceder com agentes.
    """
    if not analysis.get("available") or not analysis.get("requires_agents"):
        return ""
    
    agents_list = ", ".join(analysis.get("recommended_agents", []))
    strategy = analysis.get("strategy", "direct")
    reasoning = analysis.get("reasoning", "")
    
    context = f"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🤖 JARVIS MULTI-AGENT ANALYSIS
╚═══════════════════════════════════════════════════════════════════════════════╝

ANÁLISE AUTOMÁTICA DA TAREFA:
• Complexidade: {analysis.get('complexity', 'N/A')}
• Domínio: {analysis.get('domain', 'Geral')}
• Confiança: {analysis.get('confidence', 0):.0%}

ESTRATÉGIA RECOMENDADA: {strategy.upper()}

AGENTES RECOMENDADOS: {agents_list or 'Nenhum'}

RACIOCÍNIO: {reasoning}

═══════════════════════════════════════════════════════════════════════════════

INSTRUÇÕES PARA JARVIS:

1. ATIVE OS AGENTES RECOMENDADOS mentalmente
2. Para cada agente, PROCESSE A TAREFA sob sua perspectiva
3. SINTETIZE os resultados em uma resposta coesa
4. APRESENTE a resposta final consolidada ao senhor

FORMATO DE RESPOSTA:

"Senhor, [contexto da análise].

[Se múltiplos agentes]: Consultei [agentes] para esta tarefa.

[Resposta principal consolidada]

[Se relevante]: Pontos adicionais dos especialistas: [insights]"

═══════════════════════════════════════════════════════════════════════════════
"""
    
    return context


def generate_war_room_context(prompt: str) -> str:
    """Gera contexto específico para War Room."""
    return f"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🎭 JARVIS WAR ROOM ACTIVATED
╚═══════════════════════════════════════════════════════════════════════════════╝

O senhor solicitou um debate estruturado.

TÓPICO: {prompt}

PARTICIPANTES A ATIVAR:
• ANALYST - Visão analítica e dados
• CRITIC - Identificar falhas e riscos  
• DEVILS_ADVOCATE - Argumentos contrários
• SYNTHESIZER - Integrar perspectivas

ESTRUTURA DO DEBATE:

1. OPENING STATEMENTS
   Cada participante apresenta posição inicial (2-3 parágrafos)

2. DEBATE ROUNDS (2 rodadas)
   Participantes respondem uns aos outros

3. SÍNTESE FINAL
   Consolidação de consensos, divergências e recomendação

FORMATO DE OUTPUT:

## Síntese Executiva
[Resumo em 2-3 frases]

## Consensos
[Pontos de concordância]

## Divergências
[Onde houve discordância]

## Recomendação Final
[Ação recomendada considerando todas as perspectivas]

═══════════════════════════════════════════════════════════════════════════════
"""


def log_analysis(prompt: str, analysis: Dict, decision: str):
    """Registra análise para aprendizado."""
    log_file = LOGS_PATH / "agent_hook_analyses.jsonl"
    LOGS_PATH.mkdir(parents=True, exist_ok=True)
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "prompt_preview": prompt[:100] + "..." if len(prompt) > 100 else prompt,
        "prompt_length": len(prompt),
        "analysis": {
            "complexity": analysis.get("complexity"),
            "requires_agents": analysis.get("requires_agents"),
            "agents_recommended": analysis.get("recommended_agents"),
            "strategy": analysis.get("strategy"),
            "confidence": analysis.get("confidence")
        },
        "decision": decision
    }
    
    try:
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    except Exception:
        pass  # Silently fail logging


def process_user_prompt(prompt: str) -> Tuple[str, Dict[str, Any]]:
    """
    Processa prompt do usuário e decide sobre uso de agentes.
    
    Esta é a função principal chamada pelo hook.
    
    Args:
        prompt: Texto do usuário
        
    Returns:
        Tupla (contexto_adicional, metadata)
    """
    config = load_config()
    
    # Verificar se hook está habilitado
    if not config.get("enabled", True):
        return "", {"decision": "hook_disabled"}
    
    # Verificar se deve pular
    if should_skip_analysis(prompt, config):
        return "", {"decision": "skipped_trivial"}
    
    # Verificar War Room explícito
    if detect_war_room_request(prompt, config):
        context = generate_war_room_context(prompt)
        log_analysis(prompt, {"war_room": True}, "war_room_explicit")
        return context, {"decision": "war_room", "explicit": True}
    
    # Analisar prompt
    analysis = analyze_prompt(prompt)
    
    if not analysis.get("available"):
        return "", {"decision": "analysis_unavailable", "reason": analysis.get("reason")}
    
    # Verificar se força agentes
    force_agents = detect_force_agents(prompt, config)
    
    # Decidir se deve injetar contexto
    should_inject = False
    decision = "no_agents_needed"
    
    complexity_value = analysis.get("complexity_value", 0)
    min_complexity = config.get("min_complexity_for_notification", 2)
    
    if force_agents:
        should_inject = True
        decision = "forced_by_user"
    elif analysis.get("requires_agents") and complexity_value >= min_complexity:
        should_inject = True
        decision = "complexity_threshold_met"
    elif complexity_value >= 4:  # COMPLEX ou CRITICAL
        should_inject = True
        decision = "high_complexity"
    
    # Gerar contexto se necessário
    if should_inject and config.get("auto_inject_orchestration", True):
        context = generate_agent_context(analysis, config)
        log_analysis(prompt, analysis, decision)
        return context, {"decision": decision, "analysis": analysis}
    
    # Log mesmo sem injeção
    if config.get("log_all_analyses", True):
        log_analysis(prompt, analysis, decision)
    
    return "", {"decision": decision, "analysis": analysis}


# ============================================================================
# INTERFACE PARA HOOK DO CLAUDE CODE
# ============================================================================

def hook_handler(event: Dict) -> Dict:
    """
    Handler principal para integração com sistema de hooks.
    
    Args:
        event: Evento do hook contendo prompt e contexto
        
    Returns:
        Dict com contexto adicional e metadata
    """
    prompt = event.get("prompt", "")
    
    if not prompt:
        return {"context": "", "metadata": {"decision": "empty_prompt"}}
    
    context, metadata = process_user_prompt(prompt)
    
    return {
        "context": context,
        "metadata": metadata
    }


# ============================================================================
# CLI PARA TESTES
# ============================================================================

def main():
    """CLI para testar o hook."""
    import argparse
    
    parser = argparse.ArgumentParser(description='JARVIS Multi-Agent Hook')
    parser.add_argument('prompt', nargs='?', help='Prompt para testar')
    parser.add_argument('--verbose', '-v', action='store_true', help='Saída detalhada')
    
    args = parser.parse_args()
    
    if args.prompt:
        context, metadata = process_user_prompt(args.prompt)
        
        print(f"\n📊 ANÁLISE DO HOOK")
        print(f"{'='*60}")
        print(f"Prompt: {args.prompt[:80]}...")
        print(f"Decisão: {metadata.get('decision')}")
        
        if args.verbose and metadata.get('analysis'):
            analysis = metadata['analysis']
            print(f"\nAnálise Detalhada:")
            print(f"  Complexidade: {analysis.get('complexity')}")
            print(f"  Requer Agentes: {analysis.get('requires_agents')}")
            print(f"  Agentes: {analysis.get('recommended_agents')}")
            print(f"  Estratégia: {analysis.get('strategy')}")
            print(f"  Confiança: {analysis.get('confidence', 0):.0%}")
        
        if context:
            print(f"\n📋 CONTEXTO GERADO:")
            print(f"{'='*60}")
            print(context)
    else:
        # Modo interativo
        print("🧪 JARVIS Multi-Agent Hook - Modo Teste")
        print("Digite prompts para ver a análise. 'sair' para encerrar.\n")
        
        while True:
            try:
                prompt = input("Teste: ").strip()
                if prompt.lower() in ['sair', 'exit', 'quit']:
                    break
                if not prompt:
                    continue
                
                context, metadata = process_user_prompt(prompt)
                
                print(f"\n  Decisão: {metadata.get('decision')}")
                
                if metadata.get('analysis'):
                    a = metadata['analysis']
                    print(f"  Complexidade: {a.get('complexity')} | Agentes: {a.get('requires_agents')}")
                
                if context:
                    print(f"  ✅ Contexto de agentes seria injetado")
                else:
                    print(f"  ⏭️ Sem injeção de contexto")
                
                print()
                
            except KeyboardInterrupt:
                break
        
        print("\nAté logo!")


if __name__ == '__main__':
    main()
