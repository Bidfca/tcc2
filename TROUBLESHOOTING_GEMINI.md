# 🔧 Troubleshooting - Gemini API

## 🚨 Erro 500 no Diagnóstico IA

### Possíveis Causas:

1. **API Key Inválida/Expirada**
2. **Modelo Descontinuado**
3. **Limite de Taxa (Rate Limit)**
4. **Região Bloqueada**
5. **Servidor não recompilou**

---

## ✅ Solução Passo-a-Passo

### Passo 1: Reiniciar Servidor
```bash
# Parar servidor (Ctrl+C)
npm run dev
# Aguardar: "Ready in X.Xs"
```

### Passo 2: Testar API Key
Acesse no navegador:
```
http://localhost:3001/api/test-simple
```

**Deve mostrar:**
```json
{
  "success": true,
  "environment": {
    "hasGeminiKey": true,
    "apiKeyLength": 39
  }
}
```

### Passo 3: Testar Modelos Gemini
Acesse:
```
http://localhost:3001/api/analise/test-gemini
```

**Sucesso:** Mostra qual modelo funcionou
**Erro:** Mostra quais modelos foram tentados

---

## 🔑 Gerar Nova API Key

Se a key estiver inválida:

1. **Acesse:** https://aistudio.google.com/app/apikey
2. **Faça login** com conta Google
3. **Clique:** "Create API Key"
4. **Copie** a nova key
5. **Atualize** no `.env`:
   ```env
   GEMINI_API_KEY="sua-nova-key-aqui"
   ```
6. **Reinicie** o servidor

---

## 🌍 Problema de Região

Se a API do Gemini não estiver disponível na sua região:

### Solução Alternativa: Desabilitar Diagnóstico IA

**Arquivo:** `app/dashboard/resultados/page.tsx`

Comente o botão:
```tsx
{/* Botão Diagnóstico IA - Temporariamente desabilitado
{selectedAnalysis && (
  <button onClick={handleGerarDiagnostico}>
    Diagnóstico IA
  </button>
)}
*/}
```

**Ou** adicione fallback:
```tsx
const handleGerarDiagnostico = async () => {
  toast.info('Diagnóstico IA temporariamente indisponível')
}
```

---

## 📊 Modelos para Tentar (em ordem)

1. ✅ `gemini-1.5-flash-latest` (Recomendado)
2. ✅ `gemini-1.5-flash`
3. ✅ `gemini-1.5-pro-latest`
4. ✅ `gemini-1.5-pro`
5. ❌ `gemini-pro` (Descontinuado)

---

## 🔄 Atualizar Modelo Manualmente

**Arquivo:** `/app/api/analise/diagnostico/[analysisId]/route.ts`

**Linha 49**, tente cada modelo:

```typescript
// Opção 1 (Mais rápida - Recomendada)
model: 'gemini-1.5-flash-latest'

// Opção 2 (Sem "latest")
model: 'gemini-1.5-flash'

// Opção 3 (Mais poderosa, mais lenta)
model: 'gemini-1.5-pro-latest'
```

---

## 🐛 Debug Avançado

### Ver Logs Detalhados

**Terminal do servidor** mostrará:
```
🔍 Gerando diagnóstico para análise: ...
📊 Total de variáveis: ...
✅ Resposta do Gemini recebida
```

**Ou erro:**
```
❌ Resposta não contém JSON válido
```

### Testar via cURL

```bash
curl http://localhost:3001/api/analise/test-gemini
```

---

## 💡 Alternativas ao Gemini

Se o Gemini não funcionar na sua região:

### Opção 1: OpenAI GPT
```bash
npm install openai
```

### Opção 2: Desabilitar IA
- Remove botão de diagnóstico
- Mantém análise estatística
- Mantém visualizações

### Opção 3: Diagnóstico Local (Regras)
- Criar função que analisa estatísticas
- Sem IA, apenas if/else
- Limitado mas funciona

---

## 📞 Suporte

Se nenhuma solução funcionar:

1. Copie o erro completo do terminal
2. Copie a resposta de `/api/test-simple`
3. Copie a resposta de `/api/analise/test-gemini`
4. Me envie as 3 informações

---

## ✅ Checklist de Verificação

- [ ] Servidor reiniciado
- [ ] API key configurada (39 caracteres)
- [ ] `/api/test-simple` retorna success:true
- [ ] `/api/analise/test-gemini` testado
- [ ] Modelo atualizado para gemini-1.5-flash-latest
- [ ] Tentei gerar nova API key
- [ ] Limpei cache do navegador (Ctrl+Shift+R)

---

**Última atualização:** 30/10/2025 11:23 AM
