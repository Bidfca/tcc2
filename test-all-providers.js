// Test all three providers directly
const axios = require('axios');

async function testSciELO() {
    try {
        console.log('🔵 Testing SciELO...')
        const response = await axios.get('https://search.scielo.org/api/v1/search', {
            params: {
                q: 'milk',
                count: 5,
                format: 'json',
                lang: 'en'
            },
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'AgroInsight/1.0'
            }
        });
        
        const docs = response.data?.documents || response.data?.response?.docs || [];
        console.log(`  ✅ SciELO returned ${docs.length} results`);
        if (docs.length > 0) {
            console.log(`  First title: ${docs[0].ti || docs[0].ti_en || 'N/A'}`);
        }
        return true;
    } catch (error) {
        console.log(`  ❌ SciELO error: ${error.message}`);
        return false;
    }
}

async function testPubMed() {
    try {
        console.log('🟣 Testing PubMed...')
        // Step 1: Search for article IDs
        const searchResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
            params: {
                db: 'pubmed',
                term: 'milk',
                retmax: 5,
                retmode: 'json'
            },
            timeout: 10000
        });
        
        const ids = searchResponse.data?.esearchresult?.idlist || [];
        console.log(`  ✅ PubMed returned ${ids.length} IDs`);
        
        if (ids.length > 0) {
            // Step 2: Fetch summary for first article
            const summaryResponse = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', {
                params: {
                    db: 'pubmed',
                    id: ids[0],
                    retmode: 'json'
                }
            });
            
            const result = summaryResponse.data?.result?.[ids[0]];
            if (result) {
                console.log(`  First title: ${result.title || 'N/A'}`);
            }
        }
        return true;
    } catch (error) {
        console.log(`  ❌ PubMed error: ${error.message}`);
        return false;
    }
}

async function testCrossref() {
    try {
        console.log('🟠 Testing Crossref...')
        const response = await axios.get('https://api.crossref.org/works', {
            params: {
                query: 'milk',
                rows: 5,
                sort: 'relevance',
                order: 'desc'
            },
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com)'
            }
        });
        
        const items = response.data?.message?.items || [];
        console.log(`  ✅ Crossref returned ${items.length} results`);
        if (items.length > 0) {
            console.log(`  First title: ${items[0].title?.[0] || 'N/A'}`);
        }
        return true;
    } catch (error) {
        console.log(`  ❌ Crossref error: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('\n🧪 Testing All Provider APIs\n' + '='.repeat(50) + '\n');
    
    const results = {
        scielo: await testSciELO(),
        pubmed: await testPubMed(),
        crossref: await testCrossref()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Results Summary:\n');
    console.log(`  SciELO:   ${results.scielo ? '✅ Working' : '❌ Failed'}`);
    console.log(`  PubMed:   ${results.pubmed ? '✅ Working' : '❌ Failed'}`);
    console.log(`  Crossref: ${results.crossref ? '✅ Working' : '❌ Failed'}`);
    console.log('\n' + '='.repeat(50) + '\n');
}

runAllTests();
