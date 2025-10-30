# 🔄 Atualização do Google Gemini

## ⚠️ Problema Identificado

**Data:** 30/10/2025

O Google descontinuou o modelo `gemini-pro` na API v1beta, causando erro 404:

```
Error: models/gemini-pro is not found for API version v1beta
```

---

## ✅ Solução Aplicada

### Modelo Atualizado

| Antes | Depois | Status |
|-------|--------|--------|
| `gemini-pro` | `gemini-1.5-flash` | ✅ Funcionando |

### Arquivos Modificados

1. **`/app/api/analise/diagnostico/[analysisId]/route.ts`**
   - Linha 49: `model: 'gemini-1.5-flash'`
   - Geração de diagnóstico zootécnico

2. **`/app/api/analise/test-gemini/route.ts`**
   - Linha 16: `model: 'gemini-1.5-flash'`
   - Endpoint de teste

---

## 🆕 Modelos Disponíveis (Gemini 1.5)

### Gemini 1.5 Flash ⚡ (Recomendado)
- **Velocidade:** Muito rápida
- **Custo:** Gratuito até 15 requisições/minuto
- **Tokens:** 1M input / 8k output
- **Uso:** Tarefas gerais, respostas rápidas
- **Status:** ✅ **Usando atualmente**

### Gemini 1.5 Pro 🚀
- **Velocidade:** Moderada
- **Custo:** Gratuito até 2 requisições/minuto
- **Tokens:** 2M input / 8k output
- **Uso:** Tarefas complexas, análises profundas
- **Status:** Disponível como alternativa

---

## 📝 Configuração Atual

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
  }
})
```

### Parâmetros:
- **maxOutputTokens:** 2048 (suficiente para diagnósticos)
- **temperature:** 0.7 (equilíbrio entre criatividade e consistência)

---

## 🧪 Como Testar

### 1. Testar Conexão
```bash
# Acesse no navegador:
http://localhost:3001/api/analise/test-gemini
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Gemini API está funcionando!",
  "response": "OK",
  "apiKeyConfigured": true
}
```

### 2. Testar Diagnóstico
1. Faça upload de um CSV
2. Vá em "Resultados das Análises"
3. Clique em "Diagnóstico IA"
4. Aguarde 2-5 segundos

---

## 🔑 API Key

A API key do Gemini continua a mesma no `.env`:

```env
GEMINI_API_KEY="AIzaSyBz3m_GgkD9BtPZIePpIsCkVfOOePi1YlM"
```

### Como Gerar Nova Key (se necessário):

1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a key
4. Atualize no `.env`
5. Reinicie o servidor: `npm run dev`

---

## 📊 Limites de Uso (Free Tier)

| Modelo | Requisições/Minuto | Tokens/Dia |
|--------|-------------------|------------|
| Gemini 1.5 Flash | 15 RPM | 1.5M |
| Gemini 1.5 Pro | 2 RPM | 50k |

**RPM** = Requests Per Minute

---

## 🐛 Troubleshooting

### Erro: "Rate limit exceeded"
**Solução:** Aguarde 1 minuto e tente novamente

### Erro: "API key not valid"
**Solução:** Gere nova API key no Google AI Studio

### Erro: "Model not found"
**Solução:** Verifique se está usando `gemini-1.5-flash` ou `gemini-1.5-pro`

### Erro: "Timeout"
**Solução:** Reduza `maxOutputTokens` para 1024

---

## 🔄 Se Quiser Usar Gemini 1.5 Pro

Para análises mais complexas, substitua por:

```typescript
model: 'gemini-1.5-pro'
```

**Vantagens:**
- Respostas mais detalhadas
- Melhor raciocínio
- Contexto maior

**Desvantagens:**
- Mais lento (3-10 segundos)
- Limite menor (2 RPM)

---

## 📚 Referências

- [Gemini API Docs](https://ai.google.dev/docs)
- [Modelos Disponíveis](https://ai.google.dev/models/gemini)
- [Rate Limits](https://ai.google.dev/pricing)

---

## ✅ Checklist de Atualização

- [x] Atualizar modelo em diagnostico route
- [x] Atualizar modelo em test-gemini route
- [x] Testar API key
- [x] Testar geração de diagnóstico
- [x] Documentar mudança
- [ ] Testar com dados reais
- [ ] Verificar qualidade dos diagnósticos

---

**Status:** ✅ **Pronto para uso**  
**Última atualização:** 30/10/2025 11:19 AM
