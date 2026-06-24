// scripts/seedProducts.js - Update to preserve numeric IDs

async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, connectOptions);
    console.log('✅ Connected to MongoDB');

    const jsonPath = path.join(__dirname, '../products.json');
    console.log(`📂 Reading file: ${jsonPath}`);
    
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const products = jsonData.products;
    
    console.log(`📦 Found ${products.length} products to import`);

    // ✅ Preserve the numeric id when inserting
    const processedProducts = products.map(product => ({
      ...product,
      // Ensure id is preserved as a number
      id: product.id,
    }));

    // Clear existing
    console.log('🗑️ Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert with preserved IDs
    const result = await Product.insertMany(processedProducts, { ordered: false });
    console.log(`✅ Successfully imported ${result.length} products`);

    // Verify
    const sample = await Product.findOne().lean();
    if (sample) {
      console.log('📌 Sample product:', {
        id: sample.id,
        _id: sample._id,
        name: sample.name,
        category: sample.category,
      });
    }

    console.log('✨ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}