terraform {
  backend "s3" {
    region  = "us-west-2"
    encrypt = "false"
  }
}

#s3://sitka-production-config-us-west-2