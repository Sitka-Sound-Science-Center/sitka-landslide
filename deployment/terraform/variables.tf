locals {
  short = "${var.project}${var.environment}"
}

variable "project" {
  default = "sitka"
  type    = string
}

variable "environment" {
  default = "production"
  type    = string
}

variable "region" {
  default = "us-west-2"
  type    = string
}

variable "domain_name" {
  default = "sitkalandslide.org"
  type    = string
}