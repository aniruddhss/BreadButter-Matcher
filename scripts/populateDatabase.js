// Script to populate the database with sample talent data
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Sample talent data
const sampleTalents = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    style_tags: ["portrait", "wedding", "candid"],
    budget_min: 15000,
    budget_max: 50000,
    // We'll generate embedding for this profile description
    profile_text: "Professional wedding photographer in Mumbai specializing in candid portraits and traditional ceremonies"
  },
  {
    name: "Arjun Patel",
    city: "Delhi",
    style_tags: ["commercial", "product", "studio"],
    budget_min: 20000,
    budget_max: 75000,
    profile_text: "Commercial photographer in Delhi expert in product photography and studio setups for brands"
  },
  {
    name: "Sneha Reddy",
    city: "Bangalore",
    style_tags: ["lifestyle", "travel", "outdoor"],
    budget_min: 10000,
    budget_max: 40000,
    profile_text: "Lifestyle and travel photographer in Bangalore capturing outdoor adventures and urban stories"
  },
  {
    name: "Rahul Gupta",
    city: "Goa",
    style_tags: ["beach", "destination", "pastel"],
    budget_min: 25000,
    budget_max: 80000,
    profile_text: "Destination wedding photographer in Goa specializing in beach ceremonies with pastel tones"
  },
  {
    name: "Kavya Nair",
    city: "Chennai",
    style_tags: ["traditional", "cultural", "portrait"],
    budget_min: 12000,
    budget_max: 45000,
    profile_text: "Traditional photographer in Chennai focused on cultural events and classical portraits"
  },
  {
    name: "Vikram Singh",
    city: "Jaipur",
    style_tags: ["heritage", "royal", "vintage"],
    budget_min: 30000,
    budget_max: 100000,
    profile_text: "Heritage photographer in Jaipur specializing in royal venues and vintage aesthetics"
  }
];

// Function to get embedding from Hugging Face
async function getHFEmbedding(text) {
  const response = await fetch("https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      inputs: text,
      options: { wait_for_model: true }
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  // BGE model returns the embedding directly as an array of numbers
  if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'number') {
    return result;
  }
  
  // Handle error responses
  if (result.error) {
    throw new Error(`HuggingFace API error: ${result.error}`);
  }
  
  throw new Error("Failed to get embedding - unexpected response format");
}

async function populateDatabase() {
  console.log('Starting to populate database with sample talent data...');
  
  try {
    // First, check if talents already exist
    const { data: existingTalents } = await supabase
      .from('talents')
      .select('id')
      .limit(1);
    
    if (existingTalents && existingTalents.length > 0) {
      console.log('Database already contains talent data. Skipping population.');
      return;
    }

    for (const talent of sampleTalents) {
      console.log(`Processing ${talent.name}...`);
      
      try {
        // Generate embedding for the talent profile
        const embedding = await getHFEmbedding(talent.profile_text);
        
        // Insert talent with embedding
        const { data, error } = await supabase
          .from('talents')
          .insert([{
            name: talent.name,
            city: talent.city,
            style_tags: talent.style_tags,
            budget_min: talent.budget_min,
            budget_max: talent.budget_max,
            embedding: embedding
          }]);

        if (error) {
          console.error(`Error inserting ${talent.name}:`, error);
        } else {
          console.log(`✓ Successfully added ${talent.name}`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (embeddingError) {
        console.error(`Error generating embedding for ${talent.name}:`, embeddingError);
      }
    }

    console.log('Database population completed!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();
