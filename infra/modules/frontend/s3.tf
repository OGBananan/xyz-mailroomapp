
resource "aws_s3_bucket" "xyz-mailroomapp-web" {
  bucket = "xyz-mailroomapp-web"
}

resource "aws_s3_bucket_versioning" "xyz-mailroomapp-web" {
  bucket = aws_s3_bucket.xyz-mailroomapp-web.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "xyz-mailroomapp-web" {
  bucket = aws_s3_bucket.xyz-mailroomapp-web.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

# Block all public access — CloudFront reaches the bucket via OAC only
resource "aws_s3_bucket_public_access_block" "xyz-mailroomapp-web" {
  bucket                  = aws_s3_bucket.xyz-mailroomapp-web.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}



resource "aws_s3_bucket_policy" "xyz-mailroomapp-web" {
  bucket = aws_s3_bucket.xyz-mailroomapp-web.id
  policy = data.aws_iam_policy_document.s3_cloudfront.json

  depends_on = [aws_s3_bucket_public_access_block.xyz-mailroomapp-web]
}

data "aws_iam_policy_document" "s3_cloudfront" {
  statement {
    sid    = "AllowCloudFrontServicePrincipal"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.xyz-mailroomapp-web.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.xyz-mailroomapp-web.arn]
    }
  }
}

