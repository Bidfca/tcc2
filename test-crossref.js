// Test Crossref API directly
async function testCrossref() {
    try {
        console.log('🔍 Testing Crossref API...\n')
        
        const url = 'https://api.crossref.org/works'
        const params = new URLSearchParams({
            query: 'milk',
            rows: 5,
            sort: 'relevance',
            order: 'desc'
        })
        
        const fullUrl = `${url}?${params}`
        console.log('URL:', fullUrl)
        
        const response = await fetch(fullUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'AgroInsight/1.0 (mailto:test@test.com)'
            }
        })
        
        console.log('Status:', response.status)
        console.log('Headers:', response.headers.get('content-type'))
        
        const data = await response.json()
        console.log('\n✅ Response received!')
        console.log('Total results:', data.message['total-results'])
        console.log('Items returned:', data.message.items.length)
        
        if (data.message.items.length > 0) {
            console.log('\n📄 First article:')
            const first = data.message.items[0]
            console.log('Title:', first.title?.[0])
            console.log('DOI:', first.DOI)
            console.log('Year:', first['published-print']?.['date-parts']?.[0]?.[0] || 'N/A')
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error('Full error:', error)
    }
}

testCrossref()
