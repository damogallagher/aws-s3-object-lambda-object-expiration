terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}


variable "bucket_name" {
  type    = string
  default = "a-test-s3-object-bucket"
}

# Create a bucket
resource "aws_s3_bucket" "public_content_bucket" {
  bucket = var.bucket_name
  acl    = "public-read"   # or can be "public-read"
  tags = {
    Name        = var.bucket_name
  }
}

# Upload a kitten image object
resource "aws_s3_bucket_object" "kitten" {
  bucket = aws_s3_bucket.public_content_bucket.id
  key    = "kitten.jpg"
  acl    = "public-read"  # or can be "public-read"
  source = "./s3Files/kitten.jpg"
  etag = filemd5("./s3Files/kitten.jpg")
}


# Upload a puppy image object
resource "aws_s3_bucket_object" "puppy" {
  bucket = aws_s3_bucket.public_content_bucket.id
  key    = "puppy.jpg"
  acl    = "public-read"  # or can be "public-read"
  source = "./s3Files/puppy.jpg"
  etag = filemd5("./s3Files/puppy.jpg")
  tags = {
    Name        = var.bucket_name
    AllowedDownloads = 5
  }
}
# Create the access point
resource "aws_s3_access_point" "public_content_bucket" {
  bucket = aws_s3_bucket.public_content_bucket.id
  name   = var.bucket_name
}
