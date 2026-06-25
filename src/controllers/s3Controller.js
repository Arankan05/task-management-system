const s3Service = require("../services/s3Service");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * GET /api/projects/attachments/presigned-url
 * Generates a pre-signed URL for client direct upload to S3.
 */
const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.query;
    if (!fileName || !fileType) {
      return errorResponse(res, "fileName and fileType query parameters are required", 400);
    }

    const data = await s3Service.generatePresignedUrl(fileName, fileType);
    return successResponse(res, "Presigned URL generated successfully", data);
  } catch (error) {
    console.error("S3 URL generation error:", error);
    return errorResponse(res, error.message || "Failed to generate presigned URL", 500);
  }
};

module.exports = {
  getPresignedUrl,
};
