// Debug script to check the reference service
console.log('🔍 Checking Reference Service Configuration\n');

// Simulate the service
const providers = new Map();
providers.set('scielo', { name: 'scielo' });
providers.set('pubmed', { name: 'pubmed' });
providers.set('crossref', { name: 'crossref' });

const enabledProviders = ['scielo', 'pubmed', 'crossref'];

console.log('Registered providers:');
for (const [name, provider] of providers.entries()) {
  console.log(`  ✓ ${name}`);
}

console.log(`\nEnabled providers: ${enabledProviders.join(', ')}`);

console.log('\n📋 When searching with source="crossref":');
const testSource = 'crossref';
const providersToUse = testSource === 'all' ? enabledProviders : [testSource];
console.log(`  Providers to use: ${providersToUse.join(', ')}`);

for (const providerName of providersToUse) {
  const provider = providers.get(providerName);
  if (!provider) {
    console.log(`  ❌ Provider ${providerName} NOT FOUND`);
  } else {
    console.log(`  ✅ Provider ${providerName} found`);
  }
}

console.log('\n📋 When searching with source="all":');
const testSourceAll = 'all';
const providersToUseAll = testSourceAll === 'all' ? enabledProviders : [testSourceAll];
console.log(`  Providers to use: ${providersToUseAll.join(', ')}`);

for (const providerName of providersToUseAll) {
  const provider = providers.get(providerName);
  if (!provider) {
    console.log(`  ❌ Provider ${providerName} NOT FOUND`);
  } else {
    console.log(`  ✅ Provider ${providerName} found`);
  }
}
