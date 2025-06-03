provider "aws" {
  region = var.region
  # Set default tags so we don't need tags everywhere
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project
    }
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

# Get AWS Account ID
data "aws_caller_identity" "current" {}

#
# S3
#
resource "aws_s3_bucket" "site" {
  bucket = local.short
}

data "aws_iam_policy_document" "read_and_list_access" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.site.arn,
      "${aws_s3_bucket.site.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "read_and_list_access" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.read_and_list_access.json
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.bucket

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_acl" "site_acl" {
  bucket = aws_s3_bucket.site.id
  acl    = "public-read"
}

# Redirect from www
resource "aws_s3_bucket" "www-redirect" {
  bucket = "www.${var.domain_name}"
}

resource "aws_s3_bucket_website_configuration" "www-redirect" {
  bucket = aws_s3_bucket.www-redirect.bucket

  redirect_all_requests_to {
    host_name = var.domain_name
    protocol = "https"
  }
}

#
# Cloudfront
#

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint
    origin_id   = aws_s3_bucket.site.id

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "http-only"
      origin_read_timeout      = 30
      origin_ssl_protocols     = [
        "TLSv1",
        "TLSv1.1",
        "TLSv1.2",
      ]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  comment             = local.short
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.site.id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 60
    max_ttl                = 600
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  price_class = "PriceClass_100"
  aliases     = [var.domain_name]

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.site.arn
    ssl_support_method             = "sni-only"
  }
}

#
# EC* resources also includes IAM resources for eventbridge
#
resource "aws_ecr_repository" "default" {
  name = local.short
}


resource "aws_ecs_cluster" "default" {
  name = local.short
}

resource "aws_ecs_task_definition" "build" {
  family                   = "build"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024
  memory                   = 2048
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_role.arn
  container_definitions    = <<DEFINITION
[
  {
    "name": "build",
    "image": "${aws_ecr_repository.default.repository_url}:latest",
    "essential": true,
    "portMappings": [],
    "environment": [
      {
        "name": "MESOWEST_TOKEN",
        "value": "${var.MESOWEST_TOKEN}"
      }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "log${local.short}Build",
        "awslogs-region": "${var.region}",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }
]
DEFINITION
}

resource "aws_iam_role" "ecs_task_role" {
  name = "ecs${local.short}TaskExecutionwithS3AccessRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Sid = ""
      }
    ]
  })
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
    aws_iam_policy.eventbridge_invoke_ecs.arn
  ]
}

data "aws_iam_policy_document" "eventbridge_invoke_ecs" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "eventbridge_invoke_ecs" {
  name = "eventbridge_invoke_ecs"

  policy = <<EOT
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecs:RunTask"
            ],
            "Resource": [
                "arn:aws:ecs:*:${data.aws_caller_identity.current.account_id}:task-definition/build:*",
                "arn:aws:ecs:*:${data.aws_caller_identity.current.account_id}:task-definition/build"
            ],
            "Condition": {
                "ArnLike": {
                    "ecs:cluster": "${aws_ecs_cluster.default.arn}"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": [
                "*"
            ],
            "Condition": {
                "StringLike": {
                    "iam:PassedToService": "ecs-tasks.amazonaws.com"
                }
            }
        }
    ]
}
EOT
}

# CloudWatch resources (EventBridge too)
resource "aws_cloudwatch_log_group" "app" {
  name              = "log${local.short}Build"
  retention_in_days = 30
}

resource "aws_cloudwatch_event_rule" "publish_site" {
  name                = "publish_site"
  description         = "Periodically build and publish the site"
  schedule_expression = "cron(8,17,37,59 * * * ? *)"
}

resource "aws_cloudwatch_event_target" "ecs_scheduled_task" {
  target_id = "build"
  arn       = aws_ecs_cluster.default.arn
  rule      = aws_cloudwatch_event_rule.publish_site.name
  role_arn  = aws_iam_role.ecs_task_role.arn

  ecs_target {
    task_count              = 1
    launch_type             = "FARGATE"
    task_definition_arn     = aws_ecs_task_definition.build.arn
    platform_version        = "1.4.0"
    enable_ecs_managed_tags = true

    network_configuration {
      subnets          = ["subnet-0c809320a8958a62e"] # Manually got ID
      security_groups  = ["sg-09f6958f76126065e"]     # Manually got ID
      assign_public_ip = true
    }
  }
}

# Add S3 Endpoint
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = "vpc-0782aa50f85e73afd" # Manually got existing VPC ID
  service_name = "com.amazonaws.us-west-2.s3"
}

# DNS
resource "aws_route53_zone" "external" {
  name = var.domain_name
}

resource "aws_route53_record" "site" {
  zone_id = aws_route53_zone.external.id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "site_ipv6" {
  zone_id = aws_route53_zone.external.id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www-redirect" {
  zone_id = aws_route53_zone.external.id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_s3_bucket_website_configuration.www-redirect.website_domain
    zone_id                = aws_s3_bucket.www-redirect.hosted_zone_id
    evaluate_target_health = false
  }
}

# Certificate
resource "aws_acm_certificate" "site" {
  provider          = aws.us-east-1
  domain_name       = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "verify" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.external.id
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.verify : record.fqdn]
}