import Replicate from "replicate";
import { AppError } from "../errors";
import crypto from "crypto";

const replicate = process.env.REPLICATE_API_TOKEN
  ? new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })
  : null;

const USE_DEV_MODE = !process.env.REPLICATE_API_TOKEN;

/**
 * Generate deterministic mock embedding for development
 * Creates consistent embeddings based on URL hash
 */
function generateMockEmbedding(imageUrl: string): number[] {
  // Create a deterministic seed from the URL
  const hash = crypto.createHash("md5").update(imageUrl).digest();
  
  const embedding: number[] = [];
  
  // Generate 512 deterministic values between -1 and 1
  for (let i = 0; i < 512; i++) {
    const byteIndex = i % hash.length;
    const value = (hash[byteIndex] / 255) * 2 - 1; // Normalize to [-1, 1]
    embedding.push(value);
  }
  
  // Normalize the vector to unit length (standard for embeddings)
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Generate CLIP embedding from image
 * Uses real CLIP in production, mock embeddings in development
 * @param imageUrl - URL of the image to generate embedding from
 * @returns 512-dimensional embedding vector
 */
export async function generateImageEmbedding(
  imageUrl: string
): Promise<number[]> {
  // Development mode - use mock embeddings
  if (USE_DEV_MODE) {
    console.log("📝 [DEV MODE] Using mock embedding for:", imageUrl);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return generateMockEmbedding(imageUrl);
  }
  
  // Production mode - use real CLIP
  if (!replicate) {
    throw new AppError(
      "REPLICATE_API_TOKEN not configured for production",
      500
    );
  }
  
  try {
    console.log("🤖 [PRODUCTION] Generating real CLIP embedding...");
    const output = await replicate.run(
      "andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
      {
        input: {
          inputs: imageUrl,
        },
      }
    ) as any;
    
    // Extract embedding from output
    let embedding: number[];
    
    if (Array.isArray(output)) {
      embedding = output;
    } else if (output.embedding) {
      embedding = output.embedding;
    } else if (output[0]) {
      embedding = output[0];
    } else {
      throw new Error("Unexpected output format from CLIP model");
    }
    
    // Normalize to 512 dimensions
    if (embedding.length > 512) {
      return embedding.slice(0, 512);
    } else if (embedding.length < 512) {
      return [...embedding, ...Array(512 - embedding.length).fill(0)];
    }
    
    return embedding;
  } catch (error: any) {
    console.error("Error generating image embedding:", error);
    throw new AppError(
      `Failed to generate image embedding: ${error.message}`,
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
