'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Sprout, 
  ArrowLeft,
  Calculator,
  Scale,
  TrendingUp,
  Percent,
  Target,
  Activity,
  Heart,
  Leaf,
  DollarSign
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Tabs } from '@/components/tabs'

export default function CalculadoraPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Estados para diferentes calculadoras
  const [arrobaToKg, setArrobaToKg] = useState({ arroba: '', resultado: '' })
  const [kgToArroba, setKgToArroba] = useState({ kg: '', resultado: '' })
  const [taxaNascimento, setTaxaNascimento] = useState({ 
    femeasCobertas: '', 
    bezerrosNascidos: '', 
    resultado: '' 
  })
  const [conversaoAlimentar, setConversaoAlimentar] = useState({
    consumoAlimento: '',
    ganhoPeso: '',
    resultado: ''
  })
  const [ganhoPesoDiario, setGanhoPesoDiario] = useState({
    pesoInicial: '',
    pesoFinal: '',
    dias: '',
    resultado: ''
  })
  const [rendimentoCarcaca, setRendimentoCarcaca] = useState({
    pesoCarcaca: '',
    pesoVivo: '',
    resultado: ''
  })
  
  // Novos cálculos
  const [taxaDesmame, setTaxaDesmame] = useState({
    bezerrosDesmamados: '',
    femeasCobertas: '',
    resultado: ''
  })
  const [lotacaoAnimal, setLotacaoAnimal] = useState({
    numeroAnimais: '',
    pesoMedioKg: '',
    areaHectares: '',
    resultado: ''
  })
  const [consumoMateriaSeca, setConsumoMateriaSeca] = useState({
    pesoVivo: '',
    resultado: ''
  })
  const [intervaloPartos, setIntervaloPartos] = useState({
    diasGestacao: '',
    diasPosPartoCio: '',
    resultado: ''
  })
  const [pesoAjustado205, setPesoAjustado205] = useState({
    pesoAtual: '',
    idadeDias: '',
    resultado: ''
  })
  const [custoArroba, setCustoArroba] = useState({
    custoTotal: '',
    pesoArroba: '',
    resultado: ''
  })
  
  // Novas calculadoras econômicas
  const [analiseCustos, setAnaliseCustos] = useState({
    custosVariaveis: '',
    custosFixos: '',
    maoObraFamiliar: '',
    resultadoCOE: '',
    resultadoCOT: '',
    resultadoCTP: ''
  })
  const [margemLucro, setMargemLucro] = useState({
    receitaBruta: '',
    coe: '',
    cot: '',
    ctp: '',
    margemBruta: '',
    margemLiquida: '',
    lucro: ''
  })
  const [pontoEquilibrio, setPontoEquilibrio] = useState({
    custosFixos: '',
    precoVenda: '',
    custoVariavel: '',
    resultado: ''
  })
  const [roi, setRoi] = useState({
    investimentoTotal: '',
    lucroAnual: '',
    resultadoROI: '',
    resultadoPayback: ''
  })

  // Função para converter @ para kg
  const calcularArrobaParaKg = () => {
    const arroba = parseFloat(arrobaToKg.arroba)
    if (!isNaN(arroba)) {
      const kg = arroba * 15
      setArrobaToKg({ ...arrobaToKg, resultado: kg.toFixed(2) })
    }
  }

  // Função para converter kg para @
  const calcularKgParaArroba = () => {
    const kg = parseFloat(kgToArroba.kg)
    if (!isNaN(kg)) {
      const arroba = kg / 15
      setKgToArroba({ ...kgToArroba, resultado: arroba.toFixed(4) })
    }
  }

  // Função para calcular taxa de nascimento
  const calcularTaxaNascimento = () => {
    const femeas = parseFloat(taxaNascimento.femeasCobertas)
    const bezerros = parseFloat(taxaNascimento.bezerrosNascidos)
    if (!isNaN(femeas) && !isNaN(bezerros) && femeas > 0) {
      const taxa = (bezerros / femeas) * 100
      setTaxaNascimento({ ...taxaNascimento, resultado: taxa.toFixed(2) })
    }
  }

  // Função para calcular conversão alimentar
  const calcularConversaoAlimentar = () => {
    const consumo = parseFloat(conversaoAlimentar.consumoAlimento)
    const ganho = parseFloat(conversaoAlimentar.ganhoPeso)
    if (!isNaN(consumo) && !isNaN(ganho) && ganho > 0) {
      const conversao = consumo / ganho
      setConversaoAlimentar({ ...conversaoAlimentar, resultado: conversao.toFixed(2) })
    }
  }

  // Função para calcular ganho de peso diário
  const calcularGanhoPesoDiario = () => {
    const inicial = parseFloat(ganhoPesoDiario.pesoInicial)
    const final = parseFloat(ganhoPesoDiario.pesoFinal)
    const dias = parseFloat(ganhoPesoDiario.dias)
    if (!isNaN(inicial) && !isNaN(final) && !isNaN(dias) && dias > 0) {
      const gpd = (final - inicial) / dias
      setGanhoPesoDiario({ ...ganhoPesoDiario, resultado: gpd.toFixed(3) })
    }
  }

  // Função para calcular rendimento de carcaça
  const calcularRendimentoCarcaca = () => {
    const carcaca = parseFloat(rendimentoCarcaca.pesoCarcaca)
    const vivo = parseFloat(rendimentoCarcaca.pesoVivo)
    if (!isNaN(carcaca) && !isNaN(vivo) && vivo > 0) {
      const rendimento = (carcaca / vivo) * 100
      setRendimentoCarcaca({ ...rendimentoCarcaca, resultado: rendimento.toFixed(2) })
    }
  }
  
  // Novas funções de cálculo
  const calcularTaxaDesmame = () => {
    const desmamados = parseFloat(taxaDesmame.bezerrosDesmamados)
    const femeas = parseFloat(taxaDesmame.femeasCobertas)
    if (!isNaN(desmamados) && !isNaN(femeas) && femeas > 0) {
      const taxa = (desmamados / femeas) * 100
      setTaxaDesmame({ ...taxaDesmame, resultado: taxa.toFixed(2) })
    }
  }
  
  const calcularLotacaoAnimal = () => {
    const numAnimais = parseFloat(lotacaoAnimal.numeroAnimais)
    const pesoMedio = parseFloat(lotacaoAnimal.pesoMedioKg)
    const area = parseFloat(lotacaoAnimal.areaHectares)
    if (!isNaN(numAnimais) && !isNaN(pesoMedio) && !isNaN(area) && area > 0) {
      // 1 UA = 450 kg de peso vivo
      const pesoTotal = numAnimais * pesoMedio
      const ua = pesoTotal / 450
      const uaHa = ua / area
      setLotacaoAnimal({ ...lotacaoAnimal, resultado: uaHa.toFixed(2) })
    }
  }
  
  const calcularConsumoMateriaSeca = () => {
    const peso = parseFloat(consumoMateriaSeca.pesoVivo)
    if (!isNaN(peso) && peso > 0) {
      // Consumo MS estimado: 2.5% do peso vivo
      const consumo = peso * 0.025
      setConsumoMateriaSeca({ ...consumoMateriaSeca, resultado: consumo.toFixed(2) })
    }
  }
  
  const calcularIntervaloPartos = () => {
    const gestacao = parseFloat(intervaloPartos.diasGestacao) || 285 // Padrão bovinos
    const posParto = parseFloat(intervaloPartos.diasPosPartoCio)
    if (!isNaN(posParto) && posParto >= 0) {
      const intervalo = gestacao + posParto
      setIntervaloPartos({ ...intervaloPartos, resultado: intervalo.toFixed(0) })
    }
  }
  
  const calcularPesoAjustado205 = () => {
    const peso = parseFloat(pesoAjustado205.pesoAtual)
    const idade = parseFloat(pesoAjustado205.idadeDias)
    if (!isNaN(peso) && !isNaN(idade) && idade > 0) {
      // Fórmula: PA205 = (Peso / Idade) * 205
      const pesoAjust = (peso / idade) * 205
      setPesoAjustado205({ ...pesoAjustado205, resultado: pesoAjust.toFixed(2) })
    }
  }
  
  const calcularCustoArroba = () => {
    const custo = parseFloat(custoArroba.custoTotal)
    const peso = parseFloat(custoArroba.pesoArroba)
    if (!isNaN(custo) && !isNaN(peso) && peso > 0) {
      const custoArrobaCalc = custo / peso
      setCustoArroba({ ...custoArroba, resultado: custoArrobaCalc.toFixed(2) })
    }
  }
  
  // Novas funções econômicas
  const calcularAnaliseCustos = () => {
    const cv = parseFloat(analiseCustos.custosVariaveis)
    const cf = parseFloat(analiseCustos.custosFixos)
    const mof = parseFloat(analiseCustos.maoObraFamiliar) || 0
    
    if (!isNaN(cv) && !isNaN(cf)) {
      const coe = cv
      const cot = coe + cf + mof
      const ctp = cot * 1.06 // Adiciona 6% de custo de oportunidade
      
      setAnaliseCustos({
        ...analiseCustos,
        resultadoCOE: coe.toFixed(2),
        resultadoCOT: cot.toFixed(2),
        resultadoCTP: ctp.toFixed(2)
      })
    }
  }
  
  const calcularMargemLucro = () => {
    const rb = parseFloat(margemLucro.receitaBruta)
    const coe = parseFloat(margemLucro.coe)
    const cot = parseFloat(margemLucro.cot)
    const ctp = parseFloat(margemLucro.ctp)
    
    if (!isNaN(rb) && !isNaN(coe) && !isNaN(cot) && !isNaN(ctp)) {
      const mb = rb - coe
      const ml = rb - cot
      const lucro = rb - ctp
      
      const mbPercent = ((mb / rb) * 100).toFixed(1)
      const mlPercent = ((ml / rb) * 100).toFixed(1)
      const lucroPercent = ((lucro / rb) * 100).toFixed(1)
      
      setMargemLucro({
        ...margemLucro,
        margemBruta: `R$ ${mb.toFixed(2)} (${mbPercent}%)`,
        margemLiquida: `R$ ${ml.toFixed(2)} (${mlPercent}%)`,
        lucro: `R$ ${lucro.toFixed(2)} (${lucroPercent}%)`
      })
    }
  }
  
  const calcularPontoEquilibrio = () => {
    const cf = parseFloat(pontoEquilibrio.custosFixos)
    const pv = parseFloat(pontoEquilibrio.precoVenda)
    const cv = parseFloat(pontoEquilibrio.custoVariavel)
    
    if (!isNaN(cf) && !isNaN(pv) && !isNaN(cv) && (pv - cv) > 0) {
      const pe = cf / (pv - cv)
      setPontoEquilibrio({
        ...pontoEquilibrio,
        resultado: pe.toFixed(2)
      })
    }
  }
  
  const calcularROI = () => {
    const invest = parseFloat(roi.investimentoTotal)
    const lucro = parseFloat(roi.lucroAnual)
    
    if (!isNaN(invest) && !isNaN(lucro) && invest > 0) {
      const roiPercent = ((lucro / invest) * 100).toFixed(2)
      const payback = lucro > 0 ? (invest / lucro).toFixed(2) : 'N/A'
      
      setRoi({
        ...roi,
        resultadoROI: `${roiPercent}%`,
        resultadoPayback: payback !== 'N/A' ? `${payback} anos` : payback
      })
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <Sprout className="h-8 w-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-foreground">AgroInsight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground/80">Bem-vindo, {session.user.name}</span>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="text-muted-foreground hover:text-foreground/80"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-foreground mb-2">Calculadora de Índices Zootécnicos</h1>
          <p className="text-muted-foreground mb-8">
            Ferramentas para cálculos essenciais na pecuária e zootecnia
          </p>

          <Tabs
            defaultTab="conversoes"
            tabs={[
              {
                id: 'conversoes',
                label: 'Conversões',
                icon: <Scale className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversão @ para kg */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Arroba para Quilograma</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso em Arrobas (@)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={arrobaToKg.arroba}
                    onChange={(e) => setArrobaToKg({ ...arrobaToKg, arroba: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Ex: 20"
                  />
                </div>
                <button
                  onClick={calcularArrobaParaKg}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {arrobaToKg.resultado && (
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="text-green-800 font-medium">
                      Resultado: {arrobaToKg.resultado} kg
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Conversão kg para @ */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Quilograma para Arroba</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso em Quilogramas (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={kgToArroba.kg}
                    onChange={(e) => setKgToArroba({ ...kgToArroba, kg: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: 300"
                  />
                </div>
                <button
                  onClick={calcularKgParaArroba}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {kgToArroba.resultado && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-800 font-medium">
                      Resultado: {kgToArroba.resultado} @
                    </p>
                  </div>
                )}
              </div>
            </div>
                  </div>
                )
              },
              {
                id: 'reproducao',
                label: 'Reprodução',
                icon: <Heart className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Taxa de Nascimento */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Percent className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Taxa de Nascimento</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Fêmeas Cobertas
                  </label>
                  <input
                    type="number"
                    value={taxaNascimento.femeasCobertas}
                    onChange={(e) => setTaxaNascimento({ ...taxaNascimento, femeasCobertas: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Bezerros Nascidos
                  </label>
                  <input
                    type="number"
                    value={taxaNascimento.bezerrosNascidos}
                    onChange={(e) => setTaxaNascimento({ ...taxaNascimento, bezerrosNascidos: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: 85"
                  />
                </div>
                <button
                  onClick={calcularTaxaNascimento}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {taxaNascimento.resultado && (
                  <div className="p-3 bg-purple-50 rounded-md">
                    <p className="text-purple-800 font-medium">
                      Taxa de Nascimento: {taxaNascimento.resultado}%
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Conversão Alimentar */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-orange-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Conversão Alimentar</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Consumo de Alimento (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={conversaoAlimentar.consumoAlimento}
                    onChange={(e) => setConversaoAlimentar({ ...conversaoAlimentar, consumoAlimento: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ex: 8.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Ganho de Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={conversaoAlimentar.ganhoPeso}
                    onChange={(e) => setConversaoAlimentar({ ...conversaoAlimentar, ganhoPeso: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ex: 1.2"
                  />
                </div>
                <button
                  onClick={calcularConversaoAlimentar}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {conversaoAlimentar.resultado && (
                  <div className="p-3 bg-orange-50 rounded-md">
                    <p className="text-orange-800 font-medium">
                      Conversão Alimentar: {conversaoAlimentar.resultado}:1
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                      {parseFloat(conversaoAlimentar.resultado) < 6 ? 'Excelente' : 
                       parseFloat(conversaoAlimentar.resultado) < 8 ? 'Boa' : 'Pode melhorar'}
                    </p>
                  </div>
                )}
              </div>
            </div>
                  </div>
                )
              },
              {
                id: 'performance',
                label: 'Performance',
                icon: <TrendingUp className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ganho de Peso Diário */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Ganho de Peso Diário</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso Inicial (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ganhoPesoDiario.pesoInicial}
                    onChange={(e) => setGanhoPesoDiario({ ...ganhoPesoDiario, pesoInicial: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: 200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso Final (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={ganhoPesoDiario.pesoFinal}
                    onChange={(e) => setGanhoPesoDiario({ ...ganhoPesoDiario, pesoFinal: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: 280"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Período (dias)
                  </label>
                  <input
                    type="number"
                    value={ganhoPesoDiario.dias}
                    onChange={(e) => setGanhoPesoDiario({ ...ganhoPesoDiario, dias: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: 90"
                  />
                </div>
                <button
                  onClick={calcularGanhoPesoDiario}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {ganhoPesoDiario.resultado && (
                  <div className="p-3 bg-red-50 rounded-md">
                    <p className="text-red-800 font-medium">
                      GPD: {ganhoPesoDiario.resultado} kg/dia
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Rendimento de Carcaça */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Rendimento de Carcaça</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso da Carcaça (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rendimentoCarcaca.pesoCarcaca}
                    onChange={(e) => setRendimentoCarcaca({ ...rendimentoCarcaca, pesoCarcaca: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: 180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso Vivo (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rendimentoCarcaca.pesoVivo}
                    onChange={(e) => setRendimentoCarcaca({ ...rendimentoCarcaca, pesoVivo: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: 300"
                  />
                </div>
                <button
                  onClick={calcularRendimentoCarcaca}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {rendimentoCarcaca.resultado && (
                  <div className="p-3 bg-indigo-50 rounded-md">
                    <p className="text-indigo-800 font-medium">
                      Rendimento: {rendimentoCarcaca.resultado}%
                    </p>
                    <p className="text-sm text-indigo-600 mt-1">
                      {parseFloat(rendimentoCarcaca.resultado) > 55 ? 'Excelente' : 
                       parseFloat(rendimentoCarcaca.resultado) > 50 ? 'Bom' : 'Abaixo da média'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Taxa de Desmame */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Percent className="h-6 w-6 text-teal-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Taxa de Desmame</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Bezerros Desmamados
                  </label>
                  <input
                    type="number"
                    value={taxaDesmame.bezerrosDesmamados}
                    onChange={(e) => setTaxaDesmame({ ...taxaDesmame, bezerrosDesmamados: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Ex: 80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Fêmeas Cobertas
                  </label>
                  <input
                    type="number"
                    value={taxaDesmame.femeasCobertas}
                    onChange={(e) => setTaxaDesmame({ ...taxaDesmame, femeasCobertas: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Ex: 100"
                  />
                </div>
                <button
                  onClick={calcularTaxaDesmame}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {taxaDesmame.resultado && (
                  <div className="p-3 bg-teal-50 rounded-md">
                    <p className="text-teal-800 font-medium">
                      Taxa de Desmame: {taxaDesmame.resultado}%
                    </p>
                  </div>
                )}
              </div>
            </div>
                  </div>
                )
              },
              {
                id: 'manejo',
                label: 'Manejo',
                icon: <Leaf className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lotação Animal */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-pink-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Lotação Animal (UA/ha)</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Número de Animais
                  </label>
                  <input
                    type="number"
                    value={lotacaoAnimal.numeroAnimais}
                    onChange={(e) => setLotacaoAnimal({ ...lotacaoAnimal, numeroAnimais: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ex: 50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso Médio (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lotacaoAnimal.pesoMedioKg}
                    onChange={(e) => setLotacaoAnimal({ ...lotacaoAnimal, pesoMedioKg: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ex: 400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Área (hectares)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={lotacaoAnimal.areaHectares}
                    onChange={(e) => setLotacaoAnimal({ ...lotacaoAnimal, areaHectares: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ex: 20"
                  />
                </div>
                <button
                  onClick={calcularLotacaoAnimal}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {lotacaoAnimal.resultado && (
                  <div className="p-3 bg-pink-50 rounded-md">
                    <p className="text-pink-800 font-medium">
                      Lotação: {lotacaoAnimal.resultado} UA/ha
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Consumo de Matéria Seca */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calculator className="h-6 w-6 text-yellow-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Consumo de Matéria Seca</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso Vivo (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={consumoMateriaSeca.pesoVivo}
                    onChange={(e) => setConsumoMateriaSeca({ ...consumoMateriaSeca, pesoVivo: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Ex: 450"
                  />
                </div>
                <button
                  onClick={calcularConsumoMateriaSeca}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {consumoMateriaSeca.resultado && (
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <p className="text-yellow-800 font-medium">
                      Consumo MS: {consumoMateriaSeca.resultado} kg/dia
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">
                      Estimativa: 2.5% do peso vivo
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Intervalo de Partos */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-6 w-6 text-cyan-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Intervalo de Partos</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Dias de Gestação (padrão: 285)
                  </label>
                  <input
                    type="number"
                    value={intervaloPartos.diasGestacao}
                    onChange={(e) => setIntervaloPartos({ ...intervaloPartos, diasGestacao: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="285"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Dias Pós-Parto até Cio
                  </label>
                  <input
                    type="number"
                    value={intervaloPartos.diasPosPartoCio}
                    onChange={(e) => setIntervaloPartos({ ...intervaloPartos, diasPosPartoCio: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Ex: 60"
                  />
                </div>
                <button
                  onClick={calcularIntervaloPartos}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {intervaloPartos.resultado && (
                  <div className="p-3 bg-cyan-50 rounded-md">
                    <p className="text-cyan-800 font-medium">
                      Intervalo: {intervaloPartos.resultado} dias
                    </p>
                    <p className="text-sm text-cyan-600 mt-1">
                      {parseInt(intervaloPartos.resultado) <= 365 ? 'Ideal (≤12 meses)' : 'Acima do ideal'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Peso Ajustado 205 dias */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-lime-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Peso Ajustado 205 Dias</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pesoAjustado205.pesoAtual}
                    onChange={(e) => setPesoAjustado205({ ...pesoAjustado205, pesoAtual: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                    placeholder="Ex: 180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Idade Atual (dias)
                  </label>
                  <input
                    type="number"
                    value={pesoAjustado205.idadeDias}
                    onChange={(e) => setPesoAjustado205({ ...pesoAjustado205, idadeDias: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-lime-500 focus:border-lime-500"
                    placeholder="Ex: 210"
                  />
                </div>
                <button
                  onClick={calcularPesoAjustado205}
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {pesoAjustado205.resultado && (
                  <div className="p-3 bg-lime-50 rounded-md">
                    <p className="text-lime-800 font-medium">
                      PA 205: {pesoAjustado205.resultado} kg
                    </p>
                  </div>
                )}
              </div>
            </div>
                  </div>
                )
              },
              {
                id: 'economico',
                label: 'Econômico',
                icon: <DollarSign className="h-4 w-4" />,
                content: (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custo por Arroba */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calculator className="h-6 w-6 text-amber-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Custo por Arroba</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Custo Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoArroba.custoTotal}
                    onChange={(e) => setCustoArroba({ ...custoArroba, custoTotal: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Ex: 3000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Peso em Arrobas (@)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoArroba.pesoArroba}
                    onChange={(e) => setCustoArroba({ ...custoArroba, pesoArroba: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Ex: 20"
                  />
                </div>
                <button
                  onClick={calcularCustoArroba}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {custoArroba.resultado && (
                  <div className="p-3 bg-amber-50 rounded-md">
                    <p className="text-amber-800 font-medium">
                      Custo: R$ {custoArroba.resultado}/@
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Análise de Custos (COE, COT, CTP) */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Análise de Custos</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Calcule COE (Custo Operacional Efetivo), COT (Custo Operacional Total) e CTP (Custo Total de Produção)
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Custos Variáveis - COE (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={analiseCustos.custosVariaveis}
                    onChange={(e) => setAnaliseCustos({ ...analiseCustos, custosVariaveis: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Alimentação, sanidade, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Custos Fixos (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={analiseCustos.custosFixos}
                    onChange={(e) => setAnaliseCustos({ ...analiseCustos, custosFixos: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Arrendamento, depreciação, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Mão de Obra Familiar (R$) - Opcional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={analiseCustos.maoObraFamiliar}
                    onChange={(e) => setAnaliseCustos({ ...analiseCustos, maoObraFamiliar: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Custo de oportunidade"
                  />
                </div>
                <button
                  onClick={calcularAnaliseCustos}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular Custos
                </button>
                {analiseCustos.resultadoCOE && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">COE:</span>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">R$ {analiseCustos.resultadoCOE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">COT:</span>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">R$ {analiseCustos.resultadoCOT}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">CTP:</span>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">R$ {analiseCustos.resultadoCTP}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Margem e Lucratividade */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Margem e Lucratividade</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Calcule margens bruta, líquida e lucro do seu sistema
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Receita Bruta (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={margemLucro.receitaBruta}
                    onChange={(e) => setMargemLucro({ ...margemLucro, receitaBruta: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Vendas totais"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    COE (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={margemLucro.coe}
                    onChange={(e) => setMargemLucro({ ...margemLucro, coe: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Custo Operacional Efetivo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    COT (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={margemLucro.cot}
                    onChange={(e) => setMargemLucro({ ...margemLucro, cot: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Custo Operacional Total"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    CTP (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={margemLucro.ctp}
                    onChange={(e) => setMargemLucro({ ...margemLucro, ctp: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Custo Total de Produção"
                  />
                </div>
                <button
                  onClick={calcularMargemLucro}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular Margens
                </button>
                {margemLucro.margemBruta && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-md space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Margem Bruta</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">{margemLucro.margemBruta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margem Líquida</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">{margemLucro.margemLiquida}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lucro</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">{margemLucro.lucro}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ponto de Equilíbrio */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">Ponto de Equilíbrio</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Quantas arrobas você precisa vender para empatar?
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Custos Fixos Totais (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pontoEquilibrio.custosFixos}
                    onChange={(e) => setPontoEquilibrio({ ...pontoEquilibrio, custosFixos: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Preço de Venda por @ (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pontoEquilibrio.precoVenda}
                    onChange={(e) => setPontoEquilibrio({ ...pontoEquilibrio, precoVenda: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: 300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Custo Variável por @ (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pontoEquilibrio.custoVariavel}
                    onChange={(e) => setPontoEquilibrio({ ...pontoEquilibrio, custoVariavel: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Ex: 200"
                  />
                </div>
                <button
                  onClick={calcularPontoEquilibrio}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular
                </button>
                {pontoEquilibrio.resultado && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Ponto de Equilíbrio:</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{pontoEquilibrio.resultado} @</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Você precisa vender esta quantidade de arrobas para cobrir os custos fixos
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ROI e Payback */}
            <div className="bg-card shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold text-foreground">ROI e Payback</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Retorno sobre investimento e tempo de retorno
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Investimento Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={roi.investimentoTotal}
                    onChange={(e) => setRoi({ ...roi, investimentoTotal: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Lucro Anual (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={roi.lucroAnual}
                    onChange={(e) => setRoi({ ...roi, lucroAnual: e.target.value })}
                    className="w-full px-3 py-2 border border rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Ex: 80000"
                  />
                </div>
                <button
                  onClick={calcularROI}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Calcular ROI
                </button>
                {roi.resultadoROI && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-md space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Retorno sobre Investimento (ROI):</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{roi.resultadoROI}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo de Retorno (Payback):</p>
                      <p className="text-xl font-bold text-red-700 dark:text-red-300">{roi.resultadoPayback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
                  </div>
                )
              }
            ]}
          />

          {/* Informações Adicionais */}
          <div className="mt-8 bg-card shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Informações sobre os Índices</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Conversão Alimentar:</h4>
                <p>Indica quantos kg de alimento são necessários para produzir 1 kg de peso vivo. Valores menores são melhores (&lt;6:1 é excelente).</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Taxa de Nascimento:</h4>
                <p>Percentual de bezerros nascidos em relação ao número de fêmeas cobertas. Valores acima de 80% são considerados bons.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Ganho de Peso Diário (GPD):</h4>
                <p>Média de ganho de peso por dia durante um período. Valores acima de 1 kg/dia são considerados excelentes.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Rendimento de Carcaça:</h4>
                <p>Percentual do peso da carcaça em relação ao peso vivo. Valores acima de 55% são considerados excelentes.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Taxa de Desmame:</h4>
                <p>Percentual de bezerros desmamados. Taxa ideal acima de 75%, reflete eficiência reprodutiva e manejo sanitário.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Lotação Animal (UA/ha):</h4>
                <p>Unidade Animal por hectare. 1 UA = 450 kg. Indica capacidade de suporte da pastagem. Varia conforme qualidade do pasto.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Consumo de Matéria Seca:</h4>
                <p>Estimativa de 2.5% do peso vivo. Importante para planejamento nutricional e dimensionamento de cochos.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Intervalo de Partos:</h4>
                <p>Ideal: 12 meses (365 dias). Gestação + dias pós-parto até retorno ao cio. Afeta produtividade do rebanho.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Peso Ajustado 205 dias:</h4>
                <p>Padrão para comparação de animais. Ajusta peso à idade de 205 dias, permitindo seleção genética mais precisa.</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Custo por Arroba:</h4>
                <p>Indica custo de produção por arroba. Essencial para análise econômica e tomada de decisões de venda.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
