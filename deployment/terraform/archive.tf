resource "aws_s3_bucket" "archive" {
  bucket = "${local.short}-archive"
}
