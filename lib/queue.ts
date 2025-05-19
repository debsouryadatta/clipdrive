import Redis from 'ioredis';
import { v4 as uuidv4 } from "uuid";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});


export async function pushJob(jobData: any) {
  try {
    // Generate a job ID
    const jobId = uuidv4();
    
    // Add job metadata
    const job = {
      id: jobId,
      createdAt: new Date().toISOString(),
      ...jobData
    };
    
    // Serialize job to JSON
    const serializedJob = JSON.stringify(job);
    
    // Push job to the left of the list (newer jobs at the beginning)
    // Consumer will pop from the right (oldest jobs first)
    await redis.lpush(process.env.REDIS_QUEUE_KEY!, serializedJob);
    
    // Optional: Set TTL on the queue if needed
    // await redis.expire(process.env.REDIS_QUEUE_KEY!, 86400); // 24 hours
    
    return { success: true, jobId };
  } catch (error) {
    console.error("Failed to push job:", error);
    return { success: false, error: (error as Error).message };
  }
}

