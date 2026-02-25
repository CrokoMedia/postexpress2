#!/usr/bin/env python3
"""Insere o carrossel de venda do Croko Labs no banco de dados."""

import json, urllib.request, urllib.parse

SUPA_URL = "https://kxhtoxxprobdjzzxtywb.supabase.co"
SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aHRveHhwcm9iZGp6enh0eXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE5MDM5MywiZXhwIjoyMDg2NzY2MzkzfQ.vokF_Yx26o-HMylMRdKqPh9O_UwbrRlKaWPk08OE6-Y"
AUDIT_ID = "6aa7df55-fc33-4958-9cd9-d00c314996e9"
SUGGESTION_ID = "54078305-6770-4f3d-9f11-978ac5206687"

HEADERS = {
    "apikey": SUPA_KEY,
    "Authorization": f"Bearer {SUPA_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# ─────────────────────────────────────────
# Carrossel de Venda — Croko Labs Pitch
# ─────────────────────────────────────────
NOVO_CARROSSEL = {
    "tipo": "venda",
    "cta": "Link na bio → Agendar diagnóstico gratuito",
    "titulo": "Você fatura alto. Mas seu conteúdo ainda depende da sua cabeça.",
    "legenda": "Você não tem problema de dinheiro. Tem problema de infraestrutura.\n\nEnquanto você ainda pensa no que postar, negócios estruturados já têm carrosséis aprovados esperando publicação.\n\nCroko Labs instala a máquina. Você só aparece para aprovar.\n\nDiagnóstico gratuito → link na bio.\n\n#CrokoLabs #ContentMarketing #MarketingDigital #Mentoria #Infoprodutor #InstagramMarketing #AutomaçãoDeConteúdo",
    "slides": [
        {
            "numero": 1,
            "tipo": "hook",
            "titulo": "VOCÊ FATURA ALTO. MAS SEU CONTEÚDO AINDA DEPENDE DA SUA CABEÇA.",
            "corpo": "A máquina que coloca seu Instagram no automático — sem perder sua voz, sua essência, sua autoridade.",
            "notas_design": "Fundo escuro roxo/navy (#1E1541), headline bold branco, destaque em rosa (#ef2b70). Alto impacto.",
            "imagem_prompt": "confident entrepreneur at minimalist desk, dual monitors showing analytics dashboard with consistent growth metrics, sophisticated home office with warm lighting, focused expression, business casual attire, depth of field photography"
        },
        {
            "numero": 2,
            "tipo": "conteudo",
            "titulo": "VOCÊ NÃO TEM PROBLEMA DE DINHEIRO.",
            "corpo": "Você tem problema de INFRAESTRUTURA.\n\n✗ Frequência cai quando você está ocupado\n✗ Todo briefing ainda passa por você\n✗ Se você parar de produzir, a autoridade some\n\n\"Eu deveria estar mais estruturado.\" Essa frase que você repete há meses? Ela tem solução.",
            "notas_design": "Fundo branco, headline negro, destaque 'INFRAESTRUTURA' em rosa. Bullets com X vermelho. Card de citação em blush.",
            "imagem_prompt": "overhead flat lay of scattered sticky notes, notebooks, content calendars and coffee cups on white desk, overwhelmed content creator workspace, natural lighting, organized chaos aesthetic"
        },
        {
            "numero": 3,
            "tipo": "conteudo",
            "titulo": "SEU MARKETING DEPENDE DE ENERGIA, NÃO DE SISTEMA.",
            "corpo": "→ Quando você está bem: conteúdo sai\n→ Quando está ocupado: trava\n→ Designer atrasa: tudo para\n\nVocê não tem empresa.\nVocê tem um castelo de cartas.\nE você sabe disso.",
            "notas_design": "Fundo branco. Setas visuais. Destaque 'castelo de cartas' em negrito rosa. Contraste entre causa e efeito.",
            "imagem_prompt": "house of cards built from business documents and content posts, about to fall, dramatic side lighting, metaphorical product shot, shallow depth of field, editorial photography style"
        },
        {
            "numero": 4,
            "tipo": "solucao",
            "titulo": "CROKO LABS INSTALA A MÁQUINA.",
            "corpo": "Não é ferramenta. Não é curso.\nÉ infraestrutura implantada na sua operação.\n\n✓ 5 mentes de IA calibradas no seu estilo\n✓ Carrosséis prontos semanalmente para aprovar\n✓ Frequência garantida sem depender do seu humor\n✓ Você só aparece para aprovar",
            "notas_design": "Fundo branco. Checks verdes/rosa. Destaque 'máquina' em rosa. Visual limpo e confiante.",
            "imagem_prompt": "sleek modern automation dashboard on large monitor, clean UI with content calendar fully populated, satisfied entrepreneur reviewing content on tablet, minimalist office environment, brand colors"
        },
        {
            "numero": 5,
            "tipo": "cta",
            "titulo": "SEUS CONCORRENTES AINDA ESTÃO PENSANDO EM POSTAR.",
            "corpo": "Implantação Boutique — vagas limitadas.\n\n1. Diagnóstico gratuito (30 min)\n2. Mapeamos seu gargalo de conteúdo\n3. Você decide com clareza\n\n→ Link na bio para agendar",
            "notas_design": "Retorno ao fundo escuro roxo. Botão CTA rosa vibrante. Urgência + exclusividade. Fecha o ciclo visual da capa.",
            "imagem_prompt": "successful entrepreneur in premium office looking at phone with satisfied smile, content metrics showing growth on background screens, premium lifestyle aesthetic, cinematic lighting, aspirational business photography"
        }
    ]
}

def api_call(method, path, body=None):
    url = f"{SUPA_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    with urllib.request.urlopen(req) as r:
        resp = r.read()
        return json.loads(resp) if resp else {}

# 1. Buscar content_json atual
print("📥 Buscando conteúdo atual...")
req = urllib.request.Request(
    f"{SUPA_URL}/rest/v1/content_suggestions?id=eq.{SUGGESTION_ID}&select=content_json",
    headers={"apikey": SUPA_KEY, "Authorization": f"Bearer {SUPA_KEY}"},
    method="GET"
)
with urllib.request.urlopen(req) as r:
    existing = json.loads(r.read())

current_json = existing[0].get("content_json") or {"carousels": []}
carousels = current_json.get("carousels", [])
print(f"   Carrosséis existentes: {len(carousels)}")

# 2. Adicionar novo carrossel
carousels.append(NOVO_CARROSSEL)
current_json["carousels"] = carousels
print(f"   Adicionando carrossel de venda... total: {len(carousels)}")

# 3. Atualizar no banco
update_body = {"content_json": current_json}
patch_headers = {**HEADERS, "Prefer": "return=minimal"}
req = urllib.request.Request(
    f"{SUPA_URL}/rest/v1/content_suggestions?id=eq.{SUGGESTION_ID}",
    data=json.dumps(update_body).encode(),
    headers=patch_headers,
    method="PATCH"
)
with urllib.request.urlopen(req) as r:
    r.read()

print(f"\n✅ Carrossel de venda inserido com sucesso!")
print(f"   Audit ID: {AUDIT_ID}")
print(f"   URL para revisar: http://localhost:3001/dashboard/audits/{AUDIT_ID}/create-content")
