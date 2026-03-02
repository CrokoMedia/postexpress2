#!/usr/bin/env python3
"""
SOURCE SYNC - Detecção de Delta e Sincronização com Planilha
=============================================================

Este script:
1. Carrega o snapshot local (PLANILHA-INDEX.json)
2. Compara com o estado atual da planilha (via MCP)
3. Detecta arquivos NOVOS (delta)
4. Gera relatório visual
5. Opcionalmente executa tagueamento + download

Uso:
    python source-sync.py --check          # Apenas verificar
    python source-sync.py --execute        # Verificar + baixar
    python source-sync.py --source=JM      # Filtrar por fonte

Autor: JARVIS
Versão: 1.0.0
Data: 2026-01-13
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# =============================================================================
# CONFIGURAÇÃO
# =============================================================================

MEGA_BRAIN_ROOT = Path(".")
MISSION_CONTROL = MEGA_BRAIN_ROOT / ".claude" / "mission-control"
INBOX_ROOT = MEGA_BRAIN_ROOT / "inbox"

# Arquivos de estado
PLANILHA_INDEX_FILE = MISSION_CONTROL / "PLANILHA-INDEX.json"
SYNC_STATE_FILE = MISSION_CONTROL / "SOURCE-SYNC-STATE.json"
DELTA_PENDING_FILE = MISSION_CONTROL / "DELTA-PENDING.json"

# ID da planilha principal
PLANILHA_ID = "1lVj2t1Ej97q1MTmFXR9NZUvGWxgv-RYXQ0SjZEGl7N4"

# =============================================================================
# MAPEAMENTO ABA → PREFIXO
# =============================================================================

SHEET_TO_PREFIX: Dict[str, str] = {
    "Jeremy Miner": "JM",
    "Jeremy Haynes Sales Training": "JH-ST",
    "Jeremy Haynes Inner Circle": "JH-IC",
    "Inner Circle Weekly Group Call Recordings": "JH-WK",
    "Agency Blueprint": "AOBA",
    "Cold Video Pitch": "PCVP",
    "Land Your First Agency Client": "LYFC",
    "Marketer Mindset Masterclass": "MMM",
    "30 Days Challenge": "30DC",
    "Scale The Agency": "STA",
    "Ultra High Ticket Closer": "UHTC",
    "The Scalable Company": "TSC",
    "Cole Gordon": "CG",
    "Sales Training BR": "EDC",
    "Alex Hormozi": "AH",
    "Jeremy Haynes Program": "CA",
}

# Mapeamento reverso para agrupamento
PREFIX_TO_SOURCE: Dict[str, str] = {
    "JM": "JEREMY MINER",
    "JH-ST": "JEREMY HAYNES (SALES TRAINING)",
    "JH-IC": "JEREMY HAYNES (INNER CIRCLE)",
    "JH-WK": "JEREMY HAYNES (WEEKLY CALLS)",
    "AOBA": "AGENCY OWNERS BLUEPRINT",
    "PCVP": "PERFECT COLD VIDEO PITCH",
    "LYFC": "LAND YOUR FIRST CLIENT",
    "MMM": "MARKETER MINDSET",
    "30DC": "30 DAYS CHALLENGE",
    "STA": "SCALE THE AGENCY",
    "UHTC": "ULTRA HIGH TICKET CLOSER",
    "TSC": "THE SCALABLE COMPANY",
    "CG": "COLE GORDON",
    "EDC": "SALES TRAINING BR",
    "AH": "ALEX HORMOZI",
    "CA": "JEREMY HAYNES PROGRAM",
}

# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def load_json(path: Path) -> dict:
    """Carrega arquivo JSON com tratamento de erro."""
    if not path.exists():
        return {}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"⚠️ Erro ao ler {path}")
        return {}

def save_json(data: dict, path: Path) -> None:
    """Salva dados em arquivo JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def generate_next_tag(prefix: str, existing_tags: List[str]) -> str:
    """Gera próxima TAG sequencial para um prefixo."""
    # Extrair números existentes para este prefixo
    existing_nums = []
    for tag in existing_tags:
        if tag.startswith(prefix + "-"):
            try:
                num = int(tag.split("-")[-1])
                existing_nums.append(num)
            except ValueError:
                continue

    # Próximo número
    next_num = max(existing_nums, default=0) + 1
    return f"{prefix}-{next_num:04d}"

# =============================================================================
# FUNÇÕES PRINCIPAIS
# =============================================================================

def load_snapshot() -> dict:
    """Carrega snapshot local da planilha."""
    snapshot = load_json(PLANILHA_INDEX_FILE)
    if not snapshot:
        snapshot = {
            "entries": [],
            "timestamp": None,
            "total_count": 0
        }
    return snapshot

def get_snapshot_tags(snapshot: dict) -> set:
    """Extrai conjunto de TAGs do snapshot."""
    return {entry.get("tag") for entry in snapshot.get("entries", []) if entry.get("tag")}

def detect_delta(current_entries: List[dict], snapshot_tags: set) -> Tuple[List[dict], List[dict]]:
    """
    Detecta delta entre estado atual e snapshot.

    Retorna:
        - novos_com_tag: Arquivos novos que JÁ têm TAG na planilha
        - novos_sem_tag: Arquivos novos que PRECISAM de TAG
    """
    novos_com_tag = []
    novos_sem_tag = []

    for entry in current_entries:
        tag = entry.get("tag")

        # Se não está no snapshot, é novo
        if tag and tag not in snapshot_tags:
            novos_com_tag.append(entry)
        elif not tag:
            novos_sem_tag.append(entry)

    return novos_com_tag, novos_sem_tag

def group_by_source(entries: List[dict]) -> Dict[str, List[dict]]:
    """Agrupa entries por fonte/aba."""
    grouped = {}
    for entry in entries:
        sheet = entry.get("sheet", "UNKNOWN")
        if sheet not in grouped:
            grouped[sheet] = []
        grouped[sheet].append(entry)
    return grouped

def print_report(novos_com_tag: List[dict], novos_sem_tag: List[dict]) -> None:
    """Exibe relatório visual do delta detectado."""
    total_novos = len(novos_com_tag) + len(novos_sem_tag)

    print()
    print("╔" + "═" * 78 + "╗")
    print("║" + "SOURCE SYNC - RELATÓRIO DE DELTA".center(78) + "║")
    print("╠" + "═" * 78 + "╣")
    print(f"║  NOVOS ARQUIVOS DETECTADOS: {total_novos:<48}║")
    print("║" + " " * 78 + "║")

    # Agrupar por fonte
    all_novos = novos_com_tag + novos_sem_tag
    grouped = group_by_source(all_novos)

    print("║  POR FONTE:" + " " * 66 + "║")
    for sheet, entries in sorted(grouped.items()):
        prefix = SHEET_TO_PREFIX.get(sheet, "??")
        line = f"  ├── {sheet[:30]:<30} ({prefix}): {len(entries):>3} novos"
        print(f"║{line:<78}║")

    print("║" + " " * 78 + "║")
    print("║  AÇÕES NECESSÁRIAS:" + " " * 58 + "║")
    print(f"║  ├── TAGs a gerar:       {len(novos_sem_tag):<3} (arquivos sem TAG)" + " " * 27 + "║")
    print(f"║  ├── Downloads:          {total_novos:<3} arquivos" + " " * 34 + "║")
    print("║  └── Destino: inbox/[FONTE]/[TIPO]/" + " " * 38 + "║")
    print("╚" + "═" * 78 + "╝")
    print()

def update_sync_state(novos_count: int, status: str = "CHECKED") -> None:
    """Atualiza estado da sincronização."""
    state = {
        "last_sync": datetime.now().isoformat(),
        "last_status": status,
        "last_delta_count": novos_count,
        "planilha_id": PLANILHA_ID
    }
    save_json(state, SYNC_STATE_FILE)

def save_delta_pending(novos_com_tag: List[dict], novos_sem_tag: List[dict]) -> None:
    """Salva delta pendente para processamento posterior."""
    delta = {
        "timestamp": datetime.now().isoformat(),
        "com_tag": novos_com_tag,
        "sem_tag": novos_sem_tag,
        "total": len(novos_com_tag) + len(novos_sem_tag)
    }
    save_json(delta, DELTA_PENDING_FILE)

# =============================================================================
# MAIN
# =============================================================================

def main():
    """Função principal - executa detecção de delta."""
    print("\n" + "=" * 80)
    print("SOURCE SYNC - Detecção de Delta")
    print("=" * 80)

    # 1. Carregar snapshot
    print("\n📁 Carregando snapshot local...")
    snapshot = load_snapshot()
    snapshot_tags = get_snapshot_tags(snapshot)
    print(f"   → {len(snapshot_tags)} TAGs no snapshot")

    # 2. NOTA: A leitura real da planilha deve ser feita via MCP no Claude
    print("\n⚠️  Este script prepara a estrutura de dados.")
    print("   A leitura real da planilha deve ser feita via MCP gdrive.")
    print("   Use o comando /source-sync no Claude para execução completa.")

    # 3. Exibir estado atual
    print("\n📊 Estado atual:")
    print(f"   → Snapshot: {PLANILHA_INDEX_FILE}")
    print(f"   → State: {SYNC_STATE_FILE}")
    print(f"   → Delta: {DELTA_PENDING_FILE}")

    # 4. Verificar se há delta pendente
    if DELTA_PENDING_FILE.exists():
        delta = load_json(DELTA_PENDING_FILE)
        if delta.get("total", 0) > 0:
            print(f"\n⚠️  DELTA PENDENTE: {delta['total']} arquivos aguardando")
            print(f"   → Timestamp: {delta.get('timestamp', 'N/A')}")

    print("\n" + "=" * 80)
    print("Use /source-sync no Claude para sincronização completa via MCP")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()
