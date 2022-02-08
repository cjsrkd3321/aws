import { ec2Client } from '../../libs/ec2Client.js';
import { DescribeNetworkInterfacesCommand } from '@aws-sdk/client-ec2';

const describeNetworkInterfaces = async () => {
  const { NextToken, NetworkInterfaces, $metadata } = await ec2Client.send(
    new DescribeNetworkInterfacesCommand({
      Filters: [{ Name: 'status', Values: ['in-use'] }],
    })
  );
  if ($metadata.httpStatusCode !== 200) {
    return;
  }

  NetworkInterfaces.forEach((eni) => {
    const {
      Association: { PublicIp } = {},
      Attachment: { InstanceId, InstanceOwnerId } = {},
      InterfaceType,
      NetworkInterfaceId,
      OwnerId,
      PrivateIpAddresses,
      Status,
      VpcId,
      SubnetId,
      Groups,
    } = eni;

    console.log(
      PublicIp,
      InstanceId,
      InstanceOwnerId,
      InterfaceType,
      NetworkInterfaceId,
      OwnerId,
      Status,
      VpcId,
      SubnetId,
      Groups
    );
    PrivateIpAddresses.forEach((privateIp) =>
      console.log(privateIp.PrivateIpAddress)
    );
  });
};

describeNetworkInterfaces();
