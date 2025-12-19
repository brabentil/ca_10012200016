import OpenAI from "openai";
import { AppError } from "../errors";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate CLIP embedding from image
 * @param imageUrl - URL of the image to generate embedding from
 * @returns 512-dimensional embedding vector
 */
export async function generateImageEmbedding(
  imageUrl: string
): Promise<number[]> {
  try {
    // Note: OpenAI's current API doesn't support CLIP embeddings directly
    // This is a placeholder implementation. In production, you would:
    // 1. Use OpenAI's vision model or
    // 2. Use a dedicated CLIP service or
    // 3. Self-host CLIP model
    
    // For now, we'll use a text embedding as a placeholder
    // In production, replace with actual CLIP embedding generation
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `image:${imageUrl}`,
    });

    const embedding = response.data[0].embedding;
    
    // Pad or truncate to 512 dimensions for consistency
    if (embedding.length > 512) {
      return embedding.slice(0, 512);
    } else if (embedding.length < 512) {
      return [...embedding, ...Array(512 - embedding.length).fill(0)];
    }
    
    return embedding;
  } catch (error: any) {
    console.error("Error generating image embedding:", error);
    throw new AppError(
      "Failed to generate image embedding",
      500
    );
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Similarity score (0-1, higher is more similar)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Parse embedding string to number array
 * @param embeddingString - Comma-separated embedding values
 * @returns Array of numbers
 */
export function parseEmbedding(embeddingString: string): number[] {
  try {
    return embeddingString.split(",").map((val) => parseFloat(val));
  } catch (error) {
    throw new AppError(
      "Invalid embedding format",
      400
    );
  }
}

/**
 * Serialize embedding array to string for database storage
 * @param embedding - Array of numbers
 * @returns Comma-separated string
 */
export function serializeEmbedding(embedding: number[]): string {
  return embedding.join(",");
}
