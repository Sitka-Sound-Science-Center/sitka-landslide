terraform {
  backend "s3" {
    key = "terraform"
    region  = "us-west-2"
    encrypt = "false"
  }
}

#s3://sitka-production-config-us-west-2