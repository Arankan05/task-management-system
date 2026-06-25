const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client, AWS_S3_BUCKET } = require("../config/s3");
const crypto = require("crypto");

/**
 * Generate a pre-signed URL for uploading a file directly to AWS S3.
 * @param {string} fileName - Name of the file
 * @param {string} fileType - Content-Type / MIME type of the file
 * @returns {Promise<{uploadUrl: string, fileKey: string, fileUrl: string}>}
 */
const generatePresignedUrl = async (fileName, fileType) => {
  if (!s3Client) {
    throw new Error("AWS S3 is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in your environment.");
  }

  const fileKey = `attachments/${crypto.randomBytes(16).toString("hex")}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: fileKey,
    ContentType: fileType,
  });

  // Pre-signed URL expires in 15 minutes (900 seconds)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

  // Construct the expected final S3 public URL
  const fileUrl = `https://${AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`;

  return {
    uploadUrl,
    fileKey,
    fileUrl,
  };
};

module.exports = {
  generatePresignedUrl,
};
