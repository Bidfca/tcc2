// Test providers as they're used in the app
import axios from 'axios';

// Recreate CrossrefProvider class
class CrossrefProvider {
  constructor() {
    this.name = 'crossref';
    this.baseUrl = 'https://api.crossref.org';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgroInsight/1.0 (mailto:contact@agroinsight.com; Agricultural Research Platform)'
      }
    });
  }
  
  async search(query, options = {}) {
    try {
      const { 
        limit = 10, 
        offset = 0,
        yearFrom,
        yearTo,
        publicationType
      } = options;
      
      const params = {
        query: query,
        rows: limit,
        offset: offset,
        sort: 'relevance',
        order: 'desc'
      };
      
      if (yearFrom || yearTo) {
        const fromYear = yearFrom || 1900;
        const toYear = yearTo || new Date().getFullYear();
        params.filter = `from-pub-date:${fromYear},until-pub-date:${toYear}`;
      }
      
      console.log(`🔍 Crossref searching: "${query}" with params:`, params);
      
      const response = await this.client.get('/works', {
        params,
        timeout: 10000
      });
      
      const items = response.data?.message?.items || [];
      console.log(`✅ Crossref returned ${items.length} results`);
      
      return items.map(item => this.transformToArticle(item));
      
    } catch (error) {
      console.error('❌ Crossref search error:', error.message);
      console.error('Error details:', error.response?.data);
      return [];
    }
  }
  
  transformToArticle(item) {
    const doi = item.DOI || undefined;
    const title = Array.isArray(item.title) && item.title.length > 0
      ? item.title[0]
      : item.title || 'Título não disponível';
    
    return {
      id: `crossref-${doi || Date.now()}`,
      title: title,
      source: 'crossref',
      doi: doi
    };
  }
}

async function testCrossrefProvider() {
  console.log('🧪 Testing Crossref Provider Class\n');
  
  const provider = new CrossrefProvider();
  
  // Test 1: Simple search
  console.log('Test 1: Simple search for "milk"\n');
  const results1 = await provider.search('milk', { limit: 5 });
  console.log(`Results: ${results1.length} articles\n`);
  
  if (results1.length > 0) {
    console.log('First article:');
    console.log(`  ID: ${results1[0].id}`);
    console.log(`  Title: ${results1[0].title}`);
    console.log(`  Source: ${results1[0].source}`);
    console.log(`  DOI: ${results1[0].doi || 'N/A'}\n`);
  }
  
  // Test 2: Search with year filter
  console.log('Test 2: Search with year filter (2020-2024)\n');
  const results2 = await provider.search('agriculture', {
    limit: 3,
    yearFrom: 2020,
    yearTo: 2024
  });
  console.log(`Results: ${results2.length} articles\n`);
}

testCrossrefProvider();
