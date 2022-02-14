### test instance 1 ###
resource "aws_instance" "test_instance1" {
  ami           = "ami-0eb14fe5735c13eb5" // ap-northeast-2
  instance_type = "t2.micro"

  subnet_id                   = data.aws_subnet.this.id
  availability_zone           = "ap-northeast-2a"
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.this1.id, aws_security_group.this2.id, aws_security_group.this3.id]

  tags = {
    Name = "src"
  }
}

resource "aws_security_group" "this1" {
  name        = "test_instance1_sg_ip"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this.id
}

resource "aws_security_group" "this2" {
  name        = "test_instance1_sg_common"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this.id
}

resource "aws_security_group" "this3" {
  name        = "test_instance1_sg_ref"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this.id
}

### test instance 2 ###
resource "aws_instance" "test_instance2" {
  ami           = "ami-0eb14fe5735c13eb5" // ap-northeast-2
  instance_type = "t2.micro"

  subnet_id                   = data.aws_subnet.this.id
  availability_zone           = "ap-northeast-2a"
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.this4.id, aws_security_group.this5.id, aws_security_group.this6.id]

  tags = {
    Name = "dst"
  }
}

resource "aws_security_group" "this4" {
  name        = "test_instance2_sg_ip"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this.id
}

resource "aws_security_group" "this5" {
  name        = "test_instance2_sg_common"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this.id
}

resource "aws_security_group" "this6" {
  name        = "test_instance2_sg_ref"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this.id
}