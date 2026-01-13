import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!BUCKET_NAME) {
  console.warn(
    'S3_BUCKET_NAME is not set. File uploads to S3 will fail until this is configured in your environment.'
  );
}

export const s3Client = new S3Client({
  region: REGION,
});

export async function uploadToS3(buffer, key, contentType) {
  if (!BUCKET_NAME) {
    throw new Error('S3 bucket name (S3_BUCKET_NAME) is not configured');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return {
    bucket: BUCKET_NAME,
    key,
    url: `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`,
  };
}


