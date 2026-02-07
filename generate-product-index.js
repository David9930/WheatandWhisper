// =============================================================================
// FILE: generate-product-index.js
// PURPOSE: Scans content/products/ and generates products-index.json
// RUNS: During Netlify build (via netlify.toml)
// =============================================================================

const fs = require('fs');
const path = require('path');

try {
    // Read all files in content/products/
    const productsDir = path.join(__dirname, 'content', 'products');
    
    if (!fs.existsSync(productsDir)) {
        console.error('❌ content/products/ directory not found');
        process.exit(1);
    }
    
    const files = fs.readdirSync(productsDir);
    
    // Filter for .md files and extract slugs
    const productSlugs = files
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));
    
    // Write to products-index.json
    const outputPath = path.join(__dirname, 'products-index.json');
    fs.writeFileSync(outputPath, JSON.stringify(productSlugs, null, 2));
    
    console.log('✅ Generated products-index.json');
    console.log(`📦 Found ${productSlugs.length} products:`, productSlugs);
    
} catch (error) {
    console.error('❌ Error generating product index:', error);
    process.exit(1);
}
