#!/usr/bin/env python3
"""
CHRONICLER CORE - Sistema de Logs Narrativos para Mega Brain
=============================================================

Módulo principal que fornece funções para geração de:
- Briefings visuais de sessão
- Handoffs de continuidade
- Evolution logs append-only

Integra com session_start.py e session_end.py
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any

# ============================================================================
# CONFIGURAÇÃO
# ============================================================================

CHRONICLE_DIR = "logs/CHRONICLE"
SESSION_HISTORY_DIR = f"{CHRONICLE_DIR}/session-history"

# ============================================================================
# UTILITÁRIOS
# ============================================================================

def get_project_dir() -> str:
    """Obtém o diretório do projeto."""
    return os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())


def ensure_chronicle_dirs():
    """Garante que diretórios do Chronicle existem."""
    project_dir = get_project_dir()
    Path(project_dir, CHRONICLE_DIR).mkdir(parents=True, exist_ok=True)
    Path(project_dir, SESSION_HISTORY_DIR).mkdir(parents=True, exist_ok=True)


def read_json_safe(filepath: Path) -> Optional[Dict]:
    """Lê arquivo JSON com tratamento de erros."""
    try:
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
    except (json.JSONDecodeError, IOError):
        pass
    return None


def read_file_safe(filepath: Path) -> str:
    """Lê arquivo de texto com tratamento de erros."""
    try:
        if filepath.exists():
            return filepath.read_text(encoding='utf-8')
    except IOError:
        pass
    return ""


def count_files_in_dir(dirpath: Path, pattern: str = "*") -> int:
    """Conta arquivos em um diretório."""
    try:
        if dirpath.exists():
            return len(list(dirpath.glob(pattern)))
    except Exception:
        pass
    return 0


# ============================================================================
# COLETA DE DADOS
# ============================================================================

def collect_system_state() -> Dict[str, Any]:
    """Coleta estado atual do sistema para o briefing."""
    project_dir = Path(get_project_dir())

    state = {
        'session_number': get_next_session_number(),
        'date': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'loops': [],
        'metrics': {
            'knowledge_base': 0,
            'agents': 0,
            'phase': 'N/A',
            'inbox': 0
        },
        'recommended_action': 'Aguardando análise...'
    }

    # 1. Ler STATE.json
    state_path = project_dir / '.claude' / 'jarvis' / 'STATE.json'
    jarvis_state = read_json_safe(state_path)
    if jarvis_state:
        current = jarvis_state.get('current_state', {})
        state['metrics']['phase'] = f"{current.get('phase', '?')}"

    # 2. Ler MISSION-STATE.json
    mission_path = project_dir / '.claude' / 'mission-control' / 'MISSION-STATE.json'
    mission_state = read_json_safe(mission_path)
    if mission_state:
        current = mission_state.get('current_state', {})
        state['metrics']['phase'] = f"{current.get('phase', '?')} - {current.get('phase_name', 'IDLE')}"

    # 3. Ler PENDING.md para loops abertos
    pending_path = project_dir / '.claude' / 'jarvis' / 'PENDING.md'
    pending_content = read_file_safe(pending_path)
    state['loops'] = extract_loops_from_pending(pending_content)

    # 4. Contar arquivos
    state['metrics']['knowledge_base'] = count_files_in_dir(
        project_dir / 'knowledge', '**/*.md'
    )
    state['metrics']['agents'] = count_files_in_dir(
        project_dir / 'agents', '**/AGENT.md'
    )
    state['metrics']['inbox'] = count_files_in_dir(
        project_dir / 'inbox', '*'
    )

    # 5. Determinar ação recomendada
    state['recommended_action'] = determine_recommended_action(state)

    return state


def extract_loops_from_pending(content: str) -> List[Dict[str, str]]:
    """Extrai loops abertos do PENDING.md."""
    loops = []

    if not content:
        return loops

    # Parse por seções
    sections = {
        '## Alta Prioridade': 'critical',
        '## 🔴 Alta Prioridade': 'critical',
        '## Media Prioridade': 'pending',
        '## 🟡 Média Prioridade': 'pending',
        '## Baixa Prioridade': 'continuable',
        '## 🟢 Baixa Prioridade': 'continuable'
    }

    for marker, priority in sections.items():
        if marker in content:
            section = content.split(marker)[1].split('##')[0]
            import re
            items = re.findall(r'-\s*\[.\]\s*(.+)', section)
            for item in items[:2]:  # Max 2 por categoria
                loops.append({
                    'priority': priority,
                    'description': item.strip()[:60]
                })

    return loops


def determine_recommended_action(state: Dict) -> str:
    """Determina ação recomendada baseado no estado."""
    # Prioridade: loops críticos > inbox cheio > continuar trabalho

    critical_loops = [l for l in state['loops'] if l['priority'] == 'critical']
    if critical_loops:
        return f"RESOLVER: {critical_loops[0]['description']}"

    inbox_count = state['metrics'].get('inbox', 0)
    if inbox_count > 10:
        return f"ORGANIZAR: {inbox_count} itens no INBOX aguardando"

    pending_loops = [l for l in state['loops'] if l['priority'] == 'pending']
    if pending_loops:
        return f"CONTINUAR: {pending_loops[0]['description']}"

    return "Continuar trabalho na fase atual"


def get_next_session_number() -> int:
    """Obtém próximo número de sessão."""
    project_dir = Path(get_project_dir())
    history_dir = project_dir / CHRONICLE_DIR / 'session-history'

    if history_dir.exists():
        sessions = list(history_dir.glob('HANDOFF-*.md'))
        return len(sessions) + 1
    return 1


# ============================================================================
# GERAÇÃO DE BRIEFING
# ============================================================================

def generate_chronicle_briefing() -> str:
    """Gera briefing visual completo."""
    state = collect_system_state()

    # Header ASCII
    header = """
╔═══════════════════════════════════════════════════════════════════════════════╗
║   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗██╗ ██████╗██╗     ███████╗      ║
║  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██║██╔════╝██║     ██╔════╝      ║
║  ██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║██║     ██║     █████╗        ║
║  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║██║     ██║     ██╔══╝        ║
║  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║██║╚██████╗███████╗███████╗      ║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚═════╝╚══════╝╚══════╝      ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

    # Sessão info
    session_info = f"\n📅 Sessão #{state['session_number']} | {state['date']}\n"

    # Loops abertos
    loops_section = "\n┌─ LOOPS ABERTOS ─────────────────────────────────────────────────────────────┐\n"

    priority_icons = {
        'critical': '🔴',
        'pending': '🟡',
        'continuable': '🟢'
    }

    if state['loops']:
        for loop in state['loops'][:5]:
            icon = priority_icons.get(loop['priority'], '⚪')
            desc = loop['description'][:65].ljust(65)
            loops_section += f"│ {icon} {desc}│\n"
    else:
        loops_section += "│ ✅ Nenhum loop aberto                                                       │\n"

    loops_section += "└─────────────────────────────────────────────────────────────────────────────┘\n"

    # Estado do sistema
    m = state['metrics']
    system_section = f"""
┌─ ESTADO DO SISTEMA ─────────────────────────────────────────────────────────┐
│  Knowledge Base     │  Agents          │  Pipeline        │  Inbox         │
│  {str(m['knowledge_base']).ljust(10)} sources │  {str(m['agents']).ljust(8)} ativos │  Fase {str(m['phase']).ljust(8)} │  {str(m['inbox']).ljust(6)} items │
└─────────────────────────────────────────────────────────────────────────────┘
"""

    # Ação recomendada
    action = state['recommended_action'][:70].ljust(70)
    action_section = f"""
┌─ AÇÃO RECOMENDADA ──────────────────────────────────────────────────────────┐
│  {action}│
└─────────────────────────────────────────────────────────────────────────────┘
"""

    # Footer
    footer = "\n                         ─── Chronicler • Mega Brain ───\n"

    return header + session_info + loops_section + system_section + action_section + footer


# ============================================================================
# GERAÇÃO DE HANDOFF
# ============================================================================

def generate_chronicle_handoff(
    tasks_completed: List[str] = None,
    tasks_pending: List[str] = None,
    decisions: List[Dict[str, str]] = None,
    files_modified: List[Dict[str, str]] = None,
    next_steps: List[str] = None
) -> str:
    """Gera handoff de continuidade."""

    state = collect_system_state()

    content = f"""# HANDOFF - Sessão #{state['session_number']}

📅 {state['date']}

---

## ✅ TAREFAS COMPLETAS
"""

    if tasks_completed:
        for task in tasks_completed:
            content += f"- [x] {task}\n"
    else:
        content += "- [x] Sessão iniciada e contexto carregado\n"

    content += """
## ⏳ PENDENTE

**Alta Prioridade:**
"""

    high_priority = [l for l in state['loops'] if l['priority'] == 'critical']
    if high_priority:
        for item in high_priority[:3]:
            content += f"- [ ] {item['description']}\n"
    else:
        content += "- Nenhuma pendência crítica\n"

    content += "\n**Normal:**\n"

    normal_priority = [l for l in state['loops'] if l['priority'] in ['pending', 'continuable']]
    if normal_priority:
        for item in normal_priority[:3]:
            content += f"- [ ] {item['description']}\n"
    elif tasks_pending:
        for task in tasks_pending[:3]:
            content += f"- [ ] {task}\n"
    else:
        content += "- Nenhuma pendência registrada\n"

    content += "\n## 🎯 DECISÕES TOMADAS\n\n"
    content += "| Decisão | Razão |\n|---------|-------|\n"

    if decisions:
        for d in decisions:
            content += f"| {d.get('decision', 'N/A')} | {d.get('reason', 'N/A')} |\n"
    else:
        content += "| Nenhuma decisão significativa | Sessão de continuidade |\n"

    content += "\n## 📁 ARQUIVOS MODIFICADOS\n\n"
    content += "| Arquivo | Mudança |\n|---------|--------|\n"

    if files_modified:
        for f in files_modified:
            content += f"| {f.get('file', 'N/A')} | {f.get('change', 'N/A')} |\n"
    else:
        content += "| Nenhum arquivo modificado | Sessão consultiva |\n"

    content += "\n## ➡️ PRÓXIMOS PASSOS SUGERIDOS\n\n"

    if next_steps:
        for i, step in enumerate(next_steps[:5], 1):
            content += f"{i}. {step}\n"
    else:
        content += f"1. {state['recommended_action']}\n"
        content += "2. Verificar pendências no PENDING.md\n"
        content += "3. Continuar trabalho na fase atual\n"

    content += "\n---\n\n"
    content += "                         ─── Chronicler • Mega Brain ───\n"

    return content


# ============================================================================
# EVOLUTION LOG
# ============================================================================

def append_to_evolution_log(entry_type: str, description: str):
    """Adiciona entrada ao Evolution Log (append-only)."""
    ensure_chronicle_dirs()
    project_dir = Path(get_project_dir())
    log_path = project_dir / CHRONICLE_DIR / 'EVOLUTION-LOG.md'

    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Criar arquivo se não existe
    if not log_path.exists():
        header = """# EVOLUTION LOG - Mega Brain

> Histórico permanente do sistema. Append-only.

---

"""
        log_path.write_text(header, encoding='utf-8')

    # Append nova entrada
    entry = f"\n## [{timestamp}] {entry_type.upper()}\n\n{description}\n\n---\n"

    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(entry)


# ============================================================================
# SAVE/ARCHIVE
# ============================================================================

def save_chronicle_briefing():
    """Salva briefing em SESSION-STATE.md."""
    ensure_chronicle_dirs()
    project_dir = Path(get_project_dir())

    briefing = generate_chronicle_briefing()
    state_path = project_dir / CHRONICLE_DIR / 'SESSION-STATE.md'
    state_path.write_text(briefing, encoding='utf-8')

    return str(state_path)


def save_chronicle_handoff(**kwargs):
    """Salva handoff e arquiva o anterior."""
    ensure_chronicle_dirs()
    project_dir = Path(get_project_dir())

    handoff_path = project_dir / CHRONICLE_DIR / 'HANDOFF.md'
    history_dir = project_dir / SESSION_HISTORY_DIR

    # Arquivar handoff anterior se existe
    if handoff_path.exists():
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        archive_name = f"HANDOFF-{timestamp}.md"
        archive_path = history_dir / archive_name

        import shutil
        shutil.move(str(handoff_path), str(archive_path))

    # Gerar e salvar novo handoff
    handoff = generate_chronicle_handoff(**kwargs)
    handoff_path.write_text(handoff, encoding='utf-8')

    # Registrar no Evolution Log
    append_to_evolution_log('SESSION', f'Handoff criado. Sessão encerrada.')

    return str(handoff_path)


# ============================================================================
# INTERFACE PARA HOOKS
# ============================================================================

def on_session_start() -> str:
    """Chamado pelo session_start.py."""
    ensure_chronicle_dirs()

    # Gerar e salvar briefing
    save_chronicle_briefing()

    # Registrar no Evolution Log
    append_to_evolution_log('SESSION', 'Nova sessão iniciada.')

    # Retornar briefing para exibição
    return generate_chronicle_briefing()


def on_session_end(**kwargs) -> str:
    """Chamado pelo session_end.py."""
    ensure_chronicle_dirs()

    # Gerar e salvar handoff
    handoff_path = save_chronicle_handoff(**kwargs)

    return handoff_path


# ============================================================================
# MAIN (para testes)
# ============================================================================

if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == 'briefing':
            print(generate_chronicle_briefing())
        elif command == 'handoff':
            print(generate_chronicle_handoff())
        elif command == 'save-briefing':
            path = save_chronicle_briefing()
            print(f"Briefing salvo em: {path}")
        elif command == 'save-handoff':
            path = save_chronicle_handoff()
            print(f"Handoff salvo em: {path}")
    else:
        print("Uso: python chronicler_core.py [briefing|handoff|save-briefing|save-handoff]")
