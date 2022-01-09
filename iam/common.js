{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor3",
            "Effect": "Deny",
            "Action": "*",
            "Resource": "*",
            "Condition": {
                "NotIpAddress": {
                    "aws:SourceIp": "183.102.108.241/32"
                },
                "Bool": {
                    "aws:ViaAWSService": "false"
                }
            }
        }
    ]
}