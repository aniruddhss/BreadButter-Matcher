import { cosineSimilarity } from "./utils";
import { createClient } from "@supabase/supabase-js";
import { Talent, Brief } from "../types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BriefParams {
  location: string;
  budget: number;
  style_tags: string[];
}

interface ScoredTalent extends Talent {
  ruleScore: number;
  vectorScore: number;
  finalScore: number;
  reasons: string[];
}

export function ruleScore(talent: Talent, brief: BriefParams) {
  let score = 0;
  const reasons: string[] = [];

  if (talent.city === brief.location) {
    score += 2;
    reasons.push("Location matched");
  }
  if (brief.budget >= talent.budget_min && brief.budget <= talent.budget_max) {
    score += 3;
    reasons.push("Budget matched");
  }
  const styleOverlap = talent.style_tags.filter((tag) =>
    brief.style_tags.includes(tag)
  );
  if (styleOverlap.length > 0) {
    score += 3;
    reasons.push("Style tags matched");
  }

  return { score, reasons };
}

export async function getTopMatches(briefVector: number[] | null, brief: BriefParams): Promise<ScoredTalent[]> {
  console.log('Getting top matches...');
  
  const { data: talents, error } = await supabase
    .from("talents")
    .select("*");

  if (error) {
    console.error('Error fetching talents:', error);
    return [];
  }

  if (!talents || talents.length === 0) {
    console.log('No talents found in database');
    return [];
  }

  console.log(`Found ${talents.length} talents in database`);

  const scored: ScoredTalent[] = talents.map((talent: Talent) => {
    const { score: rule, reasons } = ruleScore(talent, brief);
    
    let vectorScore = 0;
    let finalScore = rule;
    
    // Only calculate vector similarity if we have both embeddings
    if (briefVector && talent.embedding && Array.isArray(talent.embedding)) {
      try {
        vectorScore = cosineSimilarity(talent.embedding, briefVector);
        finalScore = rule + vectorScore * 10;
      } catch (error) {
        console.warn(`Error calculating similarity for ${talent.name}:`, error);
        // Fall back to rule-based scoring only
        vectorScore = 0;
        finalScore = rule;
      }
    } else {
      console.log(`No vector similarity for ${talent.name} - using rule-based scoring only`);
      // Add a small boost for text matching as fallback
      const textSimilarity = calculateTextSimilarity(brief, talent);
      finalScore = rule + textSimilarity;
    }

    return {
      ...talent,
      ruleScore: rule,
      vectorScore: parseFloat(vectorScore.toFixed(3)),
      finalScore: parseFloat(finalScore.toFixed(2)),
      reasons,
    };
  });

  return scored.sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);
}

// Fallback text similarity function for when embeddings fail
function calculateTextSimilarity(brief: BriefParams, talent: Talent): number {
  const briefText = `${brief.location} ${brief.style_tags.join(' ')}`.toLowerCase();
  const talentText = `${talent.city} ${talent.style_tags ? talent.style_tags.join(' ') : ''}`.toLowerCase();
  
  // Simple keyword matching
  const briefWords = briefText.split(/\s+/);
  const talentWords = talentText.split(/\s+/);
  
  let matches = 0;
  briefWords.forEach(word => {
    if (word.length > 2 && talentWords.some(tWord => tWord.includes(word) || word.includes(tWord))) {
      matches++;
    }
  });
  
  // Return a score between 0-5 to replace the missing vector similarity
  return Math.min(matches * 1.5, 5);
}
