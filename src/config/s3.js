const { S3Client } = require("@aws-sdk/client-s3");

const AWS_ACCESS_KEY_ID = (process.env.AWS_ACCESS_KEY_ID || "").trim();
const AWS_SECRET_ACCESS_KEY = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();
const AWS_REGION = (process.env.AWS_REGION || "us-east-1").trim();
const AWS_S3_BUCKET = (process.env.AWS_S3_BUCKET || "").trim();

const s3Client = AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
  ? new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

module.exports = {
  s3Client,
  AWS_S3_BUCKET,
  AWS_REGION,
};
