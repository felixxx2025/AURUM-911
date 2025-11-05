terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "aurum_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "aurum-911-vpc"
  }
}

resource "aws_eks_cluster" "aurum_cluster" {
  name     = "aurum-911"
  role_arn = aws_iam_role.cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = [
      aws_subnet.private_1.id,
      aws_subnet.private_2.id,
    ]
  }
}

resource "aws_db_instance" "aurum_db" {
  identifier = "aurum-911-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage = 20
  storage_encrypted = true
  
  db_name  = "aurum911"
  username = "aurum"
  password = var.db_password
  
  skip_final_snapshot = true
  
  tags = {
    Name = "aurum-911-db"
  }
}