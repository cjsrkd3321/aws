data "aws_vpc" "this" {
  id = "vpc-0a050dcbace0f3bd8"
}

data "aws_subnet" "this" {
  vpc_id            = data.aws_vpc.this.id
  availability_zone = "ap-northeast-2a"
}

data "aws_vpc" "this2" {
  id = "vpc-006f5278f93b7cf95"
}

data "aws_subnet" "this2" {
  vpc_id            = data.aws_vpc.this2.id
  availability_zone = "ap-northeast-2a"
}