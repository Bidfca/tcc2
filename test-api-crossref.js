// Test the local API endpoint with Crossref
async function testLocalAPI() {
    try {
        console.log('🔍 Testing local API with Crossref...\n')
        
        const response = await fetch('http://localhost:3000/api/referencias/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'milk',
                source: 'crossref',
                page: 1,
                pageSize: 10
            })
        })
        
        console.log('Status:', response.status)
        
        const data = await response.json()
        console.log('\n📊 Response:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.success && data.articles) {
            console.log(`\n✅ Found ${data.articles.length} articles`)
            if (data.articles.length > 0) {
                console.log('\nFirst article:')
                console.log('- Title:', data.articles[0].title)
                console.log('- Source:', data.articles[0].source)
            }
        } else {
            console.log('\n❌ No articles found or error')
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
    }
}

testLocalAPI()
