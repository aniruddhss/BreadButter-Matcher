// Simple API test without embedding
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAPI() {
  console.log('Testing API components...\n');
  
  // Test 1: Check database connection
  console.log('1. Testing database connection...');
  try {
    const { data, error } = await Promise.race([
      supabase.from('talents').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
    ]);
    
    if (error) {
      console.log('❌ Database error:', error.message);
    } else {
      console.log('✅ Database connected successfully');
    }
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
  
  // Test 2: Check HuggingFace API
  console.log('\n2. Testing HuggingFace API...');
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch("https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: "quick test",
        options: { wait_for_model: false, use_cache: true }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.log('❌ HuggingFace API error:', response.status, response.statusText);
    } else {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ HuggingFace API working - got', data.length, 'dimensional embedding');
      } else {
        console.log('⚠️ HuggingFace API unexpected response:', typeof data);
      }
    }
  } catch (error) {
    console.log('❌ HuggingFace API failed:', error.message);
  }
  
  console.log('\nTest completed');
}

testAPI();
