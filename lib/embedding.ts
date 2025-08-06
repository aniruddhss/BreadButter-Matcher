// Fast embedding function with fallback
export async function getHFEmbedding(text: string): Promise<number[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const res = await fetch("https://api-inference.huggingface.co/models/BAAI/bge-small-en-v1.5", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: text,
        options: { 
          wait_for_model: false,
          use_cache: true
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return generateFallbackEmbedding(text);
    }

    const data = await res.json();
    
    if (data.error) {
      return generateFallbackEmbedding(text);
    }
    
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'number') {
      return data;
    }
    
    return generateFallbackEmbedding(text);
    
  } catch (error: any) {
    return generateFallbackEmbedding(text);
  }
}

// Fallback embedding based on text features
function generateFallbackEmbedding(text: string): number[] {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  // Simple hashing approach for text features
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode + i * 31 + j * 17) % 384;
      embedding[index] += 0.1;
    }
  }
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude;
    }
  }
  
  return embedding;
}
