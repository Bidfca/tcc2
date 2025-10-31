const BASE_URL = 'http://localhost:3000'

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    return {
      endpoint,
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    return {
      endpoint,
      status: 'ERROR',
      ok: false,
      error: error.message
    }
  }
}

async function runTests() {
  console.log('🧪 Testando APIs...\n')

  const tests = [
    { endpoint: '/api/test', method: 'GET', name: 'Teste de DB' },
    { endpoint: '/api/test-db', method: 'GET', name: 'Teste de DB 2' },
    { endpoint: '/api/auth/session', method: 'GET', name: 'Sessão Auth' },
    { endpoint: '/api/analise/resultados', method: 'GET', name: 'Análise - Resultados' },
    { endpoint: '/api/referencias/saved', method: 'GET', name: 'Referências - Salvas' },
    { 
      endpoint: '/api/referencias/search', 
      method: 'POST', 
      body: { query: 'agricultura', source: 'all' },
      name: 'Referências - Busca'
    }
  ]

  for (const test of tests) {
    const result = await testAPI(test.endpoint, test.method, test.body)
    
    const statusIcon = result.ok ? '✅' : '❌'
    console.log(`${statusIcon} ${test.name}`)
    console.log(`   Endpoint: ${test.endpoint}`)
    console.log(`   Status: ${result.status}`)
    
    if (!result.ok && result.error) {
      console.log(`   Erro: ${result.error}`)
    }
    
    if (result.data) {
      console.log(`   Resposta: ${JSON.stringify(result.data).substring(0, 100)}...`)
    }
    console.log()
  }

  console.log('✅ Testes concluídos!')
}

runTests()
