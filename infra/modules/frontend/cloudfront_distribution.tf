resource "aws_cloudfront_distribution" "xyz-mailroomapp-web" {
  enabled         = true
  is_ipv6_enabled = true

  default_root_object = "index.html"
  aliases             = ["mailroomapp.xyz"]
  comment             = "CloudFront distribution for XYZ MailroomApp frontend"


  origin {
    domain_name              = aws_s3_bucket.xyz-mailroomapp-web.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.xyz-mailroomapp-web.id
    origin_access_control_id = aws_cloudfront_origin_access_control.xyz-mailroomapp-web.id
  }

  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.xyz-mailroomapp-web.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]

    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_origin_access_control" "xyz-mailroomapp-web" {
  name                              = "xyz-mailroomapp-web-origin-access-control"
  description                       = "OAC for xyz-mailroomapp-web S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}
