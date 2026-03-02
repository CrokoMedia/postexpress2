#!/usr/bin/env python3
"""
Apply Tags Script - Renames matched files with TAG prefix
"""

import os
import json
import sys

def apply_tags(execute=False):
    # Load matching results
    with open('.claude/mission-control/COMPLETE-TAG-MATCHING.json') as f:
        data = json.load(f)

    matches = data['matches']

    print("=" * 60)
    print("APLICAÇÃO DE TAGS - DE-PARA COMPLETO")
    print("=" * 60)
    print(f"\nTotal arquivos com match: {len(matches)}")
    print(f"Modo: {'EXECUTAR' if execute else 'PREVIEW (--execute para aplicar)'}")
    print("=" * 60)
    print()

    success = 0
    errors = 0
    skipped = 0

    for m in sorted(matches, key=lambda x: x['tag']):
        old_path = m['full_path']
        tag = m['tag']
        filename = m['filename']

        # Skip if file already has a tag
        if filename.startswith('[') and ']' in filename:
            print(f"⏭️  SKIP (já tem tag): {filename}")
            skipped += 1
            continue

        # Build new filename with tag
        new_filename = f"[{tag}] {filename}"
        new_path = os.path.join(os.path.dirname(old_path), new_filename)

        print(f"[{tag}] {m['rel_path']}")
        print(f"  → {new_filename}")

        if execute:
            try:
                if os.path.exists(old_path):
                    os.rename(old_path, new_path)
                    print(f"  ✓ RENOMEADO")
                    success += 1
                else:
                    print(f"  ✗ ERRO: Arquivo não encontrado")
                    errors += 1
            except Exception as e:
                print(f"  ✗ ERRO: {e}")
                errors += 1
        print()

    print("=" * 60)
    print("RESUMO")
    print("=" * 60)
    if execute:
        print(f"✓ Renomeados com sucesso: {success}")
        print(f"⏭️  Pulados (já tem tag): {skipped}")
        print(f"✗ Erros: {errors}")
    else:
        print(f"📋 Prontos para renomear: {len(matches) - skipped}")
        print(f"⏭️  Já com tag: {skipped}")
        print(f"\nExecute com: python3 apply-tags.py --execute")

    return success, skipped, errors

if __name__ == "__main__":
    execute = '--execute' in sys.argv
    apply_tags(execute)
