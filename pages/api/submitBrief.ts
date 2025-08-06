import { getHFEmbedding } from "@/lib/embedding";
import { getTopMatches } from "@/lib/match";
import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received request body:', req.body);
    
    const { text, location, budget, style_tags } = req.body;

    if (!text || !location || !budget || !style_tags) {
      console.error('Missing fields:', { text, location, budget, style_tags });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Processing brief submission:', { text, location, budget, style_tags });

    // Generate embedding for the brief text
    const vector = await getHFEmbedding(text);
    console.log('Generated embedding:', vector ? 'Success' : 'Failed');

    if (!vector) {
      throw new Error('Failed to generate embedding');
    }

    // Store the brief in the database
    const { data: briefData, error: briefError } = await supabase
      .from('briefs')
      .insert({
        text,
        location,
        budget,
        style_tags,
        embedding: vector
      })
      .select()
      .single();

    if (briefError) {
      console.error('Error storing brief:', briefError);
      throw new Error(`Database error: ${briefError.message}`);
    }

    console.log('Brief stored successfully:', briefData);

    // Get matching talents from the real database
    const matches = await getTopMatches(vector, { location, budget, style_tags });
    
    console.log(`Found ${matches.length} matches`);

    res.status(200).json({ 
      brief_id: briefData?.id || 'temp-' + Date.now(), 
      matches: matches
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
