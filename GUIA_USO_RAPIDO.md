# 🚀 GUIA DE USO RÁPIDO - AgroInsight

**Como usar o sistema em 5 minutos**

---

## 📋 ÍNDICE RÁPIDO

1. [Primeiro Acesso](#primeiro-acesso)
2. [Upload de Dados](#upload-de-dados)
3. [Visualizar Resultados](#visualizar-resultados)
4. [Usar Calculadoras](#usar-calculadoras)
5. [Buscar Referências](#buscar-referências)

---

## 🔐 PRIMEIRO ACESSO

### 1. Acessar Sistema
```
http://localhost:3000
```

### 2. Fazer Login (Conta Demo)
```
Email: researcher@agroinsight.com
Senha: user123
```

### 3. Ou Criar Nova Conta
- Clique em "Criar conta"
- Preencha: Nome, Email, Senha
- Clique em "Cadastrar"

---

## 📊 UPLOAD DE DADOS

### Passo 1: Ir para Análise
```
Dashboard → Análise de Dados
```

### Passo 2: Preparar CSV
**Formato aceito:**
```csv
animal_id,peso_inicial,peso_final,idade,raca
1,250,380,180,Nelore
2,240,370,185,Angus
3,260,390,175,Nelore
```

**Requisitos:**
- ✅ Formato: CSV (separado por vírgula)
- ✅ Tamanho: Até 50MB
- ✅ Linhas: Até 100.000
- ✅ Primeira linha: Cabeçalhos

### Passo 3: Upload
1. **Arraste arquivo** para área tracejada
   OU
2. **Clique** em "Selecione o arquivo"
3. Aguarde processamento (5-30s)

### Passo 4: Sucesso!
- Mensagem verde: "Análise concluída!"
- Dados processados automaticamente
- Redirecionamento para resultados

---

## 📈 VISUALIZAR RESULTADOS

### Página de Resultados
```
Dashboard → Resultados das Análises
```

### O que você verá:

#### 1. **Resumo da Análise**
- Nome do arquivo
- Data de upload
- Total de linhas/colunas
- Tipo de cada variável

#### 2. **Estatísticas Descritivas**
Tabela com:
- Média, mediana, moda
- Desvio padrão
- Mínimo, máximo
- Quartis (Q1, Q3)
- Coeficiente de variação
- Outliers detectados

#### 3. **Gráficos Automáticos**

**Box Plot:**
- Mostra distribuição de dados
- Identifica outliers
- Exibe quartis

**Histograma:**
- Distribuição de frequências
- 4 primeiras variáveis numéricas

**Gráfico de Pizza:**
- Proporções de categorias
- Todas variáveis qualitativas

**Scatter Plot:**
- Correlações significativas
- Apenas correlações > 0.3

#### 4. **Classificação de Variáveis**
Sistema detecta automaticamente:
- ✅ **Quantitativa Contínua**: Pesos, medidas
- ✅ **Quantitativa Discreta**: Contagens
- ✅ **Qualitativa Nominal**: Raças, sexos
- ✅ **Qualitativa Ordinal**: Níveis, categorias
- ✅ **Temporal**: Datas
- ✅ **Identificador**: IDs

### Ações Disponíveis:

#### 🤖 Gerar Diagnóstico IA
1. Clique em "Diagnóstico IA"
2. Aguarde 10-30 segundos
3. Receba análise completa:
   - Resumo executivo
   - Análise de cada variável
   - Pontos fortes/atenção
   - Recomendações prioritárias
   - Comparação com literatura

#### 📥 Download CSV
- Clique em "CSV"
- Arquivo baixado instantaneamente
- Contém todos os dados originais

#### 🖨️ Imprimir/PDF
- Clique em "Imprimir"
- Escolha impressora ou "Salvar como PDF"
- Layout formatado automaticamente

#### 🗑️ Deletar Análise
1. Passe mouse sobre análise na lista
2. Clique no ícone de lixeira (vermelho)
3. Confirme a exclusão
4. ⚠️ Ação irreversível!

---

## 🧮 USAR CALCULADORAS

### Acessar
```
Dashboard → Calculadora de Índices
```

### 5 Categorias de Calculadoras

#### 1️⃣ **CONVERSÕES** (⚖️)
**Arroba ↔ Kg:**
- 1 arroba = 15 kg
- Conversão instantânea

#### 2️⃣ **REPRODUÇÃO** (❤️)

**Taxa de Nascimento:**
```
Fórmula: (Bezerros nascidos / Fêmeas cobertas) × 100
Ideal: > 80%
```

**Taxa de Desmame:**
```
Fórmula: (Bezerros desmamados / Bezerros nascidos) × 100
Ideal: > 75%
```

**Intervalo de Partos:**
```
Fórmula: Dias entre partos
Ideal: 365-395 dias
```

#### 3️⃣ **PERFORMANCE** (📈)

**Ganho de Peso Diário (GPD):**
```
Fórmula: (Peso Final - Peso Inicial) / Dias
Excelente: > 1 kg/dia
```

**Conversão Alimentar (CA):**
```
Fórmula: Alimento consumido / Ganho de peso
Excelente: < 6:1
```

**Rendimento de Carcaça:**
```
Fórmula: (Peso carcaça / Peso vivo) × 100
Bom: > 50%
```

#### 4️⃣ **MANEJO** (🌿)

**Lotação Animal:**
```
Fórmula: (Nº animais × Peso médio / 450) / Área (ha)
1 UA = 450 kg
```

**Consumo de Matéria Seca:**
```
Fórmula: Peso vivo × 2.5%
Padrão: 2.5% do peso vivo
```

**Peso Ajustado 205 dias:**
```
Fórmula: ((Peso atual - Peso nascimento) / Idade) × 205 + Peso nascimento
Padrão: Comparação genética
```

#### 5️⃣ **ECONÔMICO** (💰)

**Custo por Arroba:**
```
Fórmula: Custo Total / Arrobas produzidas
```

**Análise de Custos:**
- **COE** (Custo Operacional Efetivo) = Custos Variáveis
- **COT** (Custo Operacional Total) = COE + Fixos + MOF
- **CTP** (Custo Total de Produção) = COT × 1.06

**Margem e Lucratividade:**
- **Margem Bruta** = Receita - COE
- **Margem Líquida** = Receita - COT
- **Lucro** = Receita - CTP

**Ponto de Equilíbrio:**
```
Fórmula: Custos Fixos / (Preço Venda - Custo Variável)
Resultado: Arrobas necessárias para empatar
```

**ROI e Payback:**
```
ROI = (Lucro / Investimento) × 100%
Payback = Investimento / Lucro (anos)
```

### Como Usar:
1. **Selecione a aba** desejada (ex: Econômico)
2. **Escolha a calculadora** no card
3. **Preencha os campos** com seus dados
4. **Clique em "Calcular"**
5. **Resultado** aparece instantaneamente

---

## 📚 BUSCAR REFERÊNCIAS

### Acessar
```
Dashboard → Referências Científicas
```

### 2 Abas Principais

#### 📄 **PESQUISAR ARTIGOS**

**1. Fazer Busca:**
- Digite termo (ex: "nutrição bovinos")
- Selecione fonte:
  - **Todas** (SciELO + Crossref)
  - **SciELO** (artigos brasileiros)
  - **Crossref** (artigos internacionais)
- Clique em "Pesquisar"

**2. Resultados:**
Cada artigo mostra:
- ✅ Título
- ✅ Autores (até 3 + et al.)
- ✅ Ano de publicação
- ✅ Journal/Revista
- ✅ Resumo (preview)
- ✅ Badge da fonte (SciELO/Crossref)
- ✅ Link para artigo completo
- ✅ DOI (quando disponível)

**3. Ações:**
- 🔖 **Salvar**: Clique no ícone de bookmark
- 📄 **Ler**: Clique em "Acessar artigo"
- 🔗 **DOI**: Clique no DOI para acesso direto

**4. Ver Mais:**
- Clique em "Ver mais artigos"
- Carrega próxima página (10 artigos)
- Rolagem infinita

#### 💾 **ARTIGOS SALVOS**

**1. Adicionar por Link/DOI:**
```
Cole qualquer:
- https://doi.org/10.1234/exemplo
- Link de artigo com DOI
- DOI direto: 10.1234/exemplo
```
- Clique "Adicionar"
- Metadata extraída automaticamente
- Salvo na sua biblioteca

**2. Sua Biblioteca:**
- Lista todos artigos salvos
- Ordenados por data (mais recente)
- Mesmo layout da busca

**3. Remover Artigo:**
- Clique no bookmark vermelho
- Confirme exclusão
- Removido da biblioteca

---

## 💡 DICAS RÁPIDAS

### 🎨 Dark/Light Mode
- Clique no ícone **☀️/🌙** no canto superior direito
- Modo salvo automaticamente
- Funciona em todas as páginas

### 📊 Melhor Formato de CSV
```csv
# ✅ BOM:
animal_id,peso_kg,idade_dias,gmd_kg
1,380,180,1.2
2,370,185,1.1

# ❌ EVITE:
animal_id;peso(kg);idade;GMD
1;380;180;1,2  ← vírgula como decimal
```

### 🔍 Termos de Busca Eficazes
**Específicos:**
- ✅ "ganho de peso nelore confinamento"
- ✅ "conversão alimentar bovinos"
- ✅ "lotação animal pastagem"

**Genéricos (menos eficaz):**
- ❌ "bovinos"
- ❌ "pecuária"

### 💾 Organização
- Nomeie análises descritivamente
- Use data no nome (ex: "Lote_Jan2024")
- Delete análises antigas
- Mantenha biblioteca de artigos organizada

### ⚡ Atalhos
- **Enter**: Buscar (em campos de pesquisa)
- **Ctrl + P**: Imprimir resultados
- **Tab**: Navegar entre abas

---

## 🆘 PROBLEMAS COMUNS

### ❌ "Arquivo inválido"
**Soluções:**
- Verifique se é CSV (não XLS/XLSX)
- Abra no Excel e "Salvar Como" → CSV
- Verifique encoding (UTF-8)

### ❌ "Erro ao processar"
**Soluções:**
- Reduza tamanho do arquivo (< 50MB)
- Limite linhas (< 100.000)
- Remova caracteres especiais

### ❌ Gráficos não aparecem
**Soluções:**
- Atualize a página (F5)
- Limpe cache do navegador
- Verifique se tem dados numéricos

### ❌ Diagnóstico demora muito
**Situação normal:**
- 10-30 segundos para datasets pequenos
- 30-60 segundos para grandes
- Se > 2 minutos: recarregue página

### ❌ Artigos não carregam
**Soluções:**
- Verifique conexão com internet
- Tente fonte diferente (SciELO → Crossref)
- Use termos mais específicos

---

## 📞 SUPORTE

### Documentação Completa
📖 **Ver:** `DOCUMENTACAO_TECNICA.md`

### Reportar Problema
🐛 **GitHub Issues:** [Link do repo]

### Contato
📧 **Email:** pedrogabriieell@gmail.com

---

## 🎓 TUTORIAIS EM VÍDEO

### Básico
- [ ] Como fazer primeiro upload
- [ ] Como interpretar resultados
- [ ] Como usar calculadoras

### Avançado
- [ ] Análise completa de lote
- [ ] Comparação entre análises
- [ ] Uso do diagnóstico IA

### Econômico
- [ ] Análise de custos completa
- [ ] Cálculo de viabilidade
- [ ] ROI e Payback na prática

---

## ✅ CHECKLIST DE INÍCIO

- [ ] Fiz login/criei conta
- [ ] Fiz upload de teste
- [ ] Vi os resultados
- [ ] Testei uma calculadora
- [ ] Busquei uma referência
- [ ] Explorei o dark mode
- [ ] Li a documentação técnica
- [ ] Configurei meu perfil

---

**Pronto! Você já sabe o essencial! 🚀**

Para uso avançado, consulte a **DOCUMENTACAO_TECNICA.md**

_Última atualização: 30/10/2025_
