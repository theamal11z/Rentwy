const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vedgoplfibbwvmhsltms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZGdvcGxmaWJid3ZtaHNsdG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDY2NTYsImV4cCI6MjA2NzEyMjY1Nn0.WL_PS5nrGFTYSRmjIu8YHeWstMQMzbAepXtARaAWfME';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError && categoriesError.code === 'PGRST116') {
      console.log('❌ Schema not set up yet.');
      console.log('Next step: Run the schema.sql in your Supabase dashboard SQL Editor');
      return;
    } else if (categoriesError) {
      console.log('❌ Connection error:', categoriesError.message);
      return;
    }
    
    console.log('✅ Connection successful and schema exists!');
    console.log(`📦 Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.color})`);
    });
    
    // Test items table
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('count');
    
    if (!itemsError) {
      console.log('✅ Items table ready');
    }
    
    console.log('\n🎉 Supabase backend is ready to use!');
    console.log('You can now start your app with: npm run dev');
    
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
}

testConnection();
