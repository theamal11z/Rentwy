const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vedgoplfibbwvmhsltms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGdvcGxmaWJid3ZtaHNsdG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDY2NTYsImV4cCI6MjA2NzEyMjY1Nn0.WL_PS5nrGFTYSRmjIu8YHeWstMQMzbAepXtARaAWfME';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample items data
const sampleItems = [
  {
    title: 'Elegant Black Evening Dress',
    description: 'Stunning black evening gown perfect for formal events. Features a flowing silhouette and elegant design.',
    price_per_day: 85,
    size: 'M',
    brand: 'Versace',
    condition: 'Excellent',
    location: 'Downtown Manhattan',
    images: []
  },
  {
    title: 'Designer Leather Jacket',
    description: 'Vintage-style leather jacket from a premium designer brand. Perfect for adding edge to any outfit.',
    price_per_day: 65,
    size: 'L',
    brand: 'Saint Laurent',
    condition: 'Very Good',
    location: 'Brooklyn Heights',
    images: []
  },
  {
    title: 'Cocktail Party Dress',
    description: 'Chic cocktail dress in deep blue. Ideal for parties and special occasions.',
    price_per_day: 55,
    size: 'S',
    brand: 'Diane von Furstenberg',
    condition: 'Excellent',
    location: 'Upper East Side',
    images: []
  },
  {
    title: 'Cashmere Winter Coat',
    description: 'Luxurious cashmere coat to keep you warm and stylish during winter months.',
    price_per_day: 95,
    size: 'M',
    brand: 'MaxMara',
    condition: 'Like New',
    location: 'Midtown',
    images: []
  },
  {
    title: 'Silk Blouse',
    description: 'Professional silk blouse perfect for business meetings or formal occasions.',
    price_per_day: 35,
    size: 'M',
    brand: 'Equipment',
    condition: 'Excellent',
    location: 'Chelsea',
    images: []
  },
  {
    title: 'High-waisted Trousers',
    description: 'Trendy high-waisted trousers that can be dressed up or down.',
    price_per_day: 45,
    size: 'S',
    brand: 'Theory',
    condition: 'Very Good',
    location: 'SoHo',
    images: []
  },
  {
    title: 'Statement Necklace',
    description: 'Bold statement necklace to elevate any outfit.',
    price_per_day: 25,
    size: 'One Size',
    brand: 'Tiffany & Co',
    condition: 'Excellent',
    location: 'Financial District',
    images: []
  },
  {
    title: 'Designer Handbag',
    description: 'Luxury designer handbag perfect for special occasions.',
    price_per_day: 75,
    size: 'Medium',
    brand: 'Chanel',
    condition: 'Excellent',
    location: 'Upper West Side',
    images: []
  }
];

async function seedData() {
  try {
    console.log('🌱 Starting data seeding...');

    // First, get categories to assign to items
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      throw categoriesError;
    }

    console.log(`✅ Found ${categories.length} categories`);

    // Create a dummy user for the items (in a real app, users would be created through auth)
    const dummyUserId = '00000000-0000-4000-8000-000000000001'; // Dummy UUID

    // Add items with categories
    const itemsToInsert = sampleItems.map((item, index) => {
      const categoryIndex = index % categories.length;
      const category = categories[categoryIndex];
      
      return {
        ...item,
        category_id: category.id,
        user_id: dummyUserId
      };
    });

    console.log(`📦 Preparing to insert ${itemsToInsert.length} items...`);

    // Insert items (this will fail because of user_id constraint, but we'll show the structure)
    console.log('⚠️  Note: Items cannot be inserted without valid authenticated users.');
    console.log('📋 Sample item structure:');
    console.log(JSON.stringify(itemsToInsert[0], null, 2));

    console.log('✅ Data structure prepared successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Set up authentication in your app');
    console.log('2. Create real user accounts');
    console.log('3. Use the app UI to add items');
    console.log('4. Or modify this script to work with authenticated users');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

seedData();
