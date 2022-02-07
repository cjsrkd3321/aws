import { ec2Client } from '../../libs/ec2Client.js';
import { DescribeNetworkInterfacesCommand } from '@aws-sdk/client-ec2';

const describeNetworkInterfaces = async () => {
  const result = await ec2Client.send(
    new DescribeNetworkInterfacesCommand({
      Filters: [{ Name: 'status', Values: ['in-use'] }],
    })
  );
  const { NextToken, NetworkInterfaces, $metadata } = result;
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
    // if (Status !== 'in-use') {
    //   return;
    // }
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
