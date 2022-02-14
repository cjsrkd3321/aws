### test instance 1 ###
resource "aws_instance" "test_instance3" {
  ami           = "ami-0eb14fe5735c13eb5" // ap-northeast-2
  instance_type = "t2.micro"

  subnet_id                   = data.aws_subnet.this2.id
  availability_zone           = "ap-northeast-2a"
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.this11.id, aws_security_group.this22.id, aws_security_group.this33.id]

  tags = {
    Name = "test2-ec2"
  }
}

resource "aws_security_group" "this11" {
  name        = "test_instance3_sg_ip"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this2.id
}

resource "aws_security_group" "this22" {
  name        = "test_instance3_sg_common"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this2.id
}

resource "aws_security_group" "this33" {
  name        = "test_instance3_sg1_ref"
  description = "test_sg_ip"
  vpc_id      = data.aws_vpc.this2.id
}