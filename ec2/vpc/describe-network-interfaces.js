// TODO: 리전별 그리고 어슘롤 가능하도록 클라이언트 구성하기
import { ec2Client } from '../../libs/ec2Client.js';
import {
  AuthorizeSecurityGroupIngressCommand,
  DescribeNetworkInterfacesCommand,
  DescribeVpcPeeringConnectionsCommand,
} from '@aws-sdk/client-ec2';

const getInUseNetworkInterfacesInfo = async () => {
  let results = [];
  while (true) {
    let token = undefined;

    try {
      const { NextToken, NetworkInterfaces, $metadata } = await ec2Client.send(
        new DescribeNetworkInterfacesCommand({
          Filters: [{ Name: 'status', Values: ['in-use'] }],
          NextToken: token,
        })
      );

      if ($metadata.httpStatusCode !== 200) {
        console.log(
          `❌ [getInUseNetworkInterfacesInfo] STATUS: ${$metadata.httpStatusCode}`
        );
        return undefined;
      }

      if (!NextToken) {
        results = [...results, ...NetworkInterfaces];
        break;
      }

      token = NextToken;
    } catch (e) {
      console.log(`❌ [DescribeNetworkInterfacesCommand] EXCEPTION: ${e}`);
      return undefined;
    }
  }

  return results;
};

const networkInterfaces = await getInUseNetworkInterfacesInfo();

if (!networkInterfaces) {
  console.log('❌ ERROR!');
}

const results = networkInterfaces.map((networkInterface) => {
  const {
    Association: { PublicIp } = {},
    Attachment: { InstanceId, InstanceOwnerId } = {},
    InterfaceType,
    NetworkInterfaceId,
    OwnerId,
    PrivateIpAddresses,
    VpcId,
    SubnetId,
    Groups: SecurityGroups,
  } = networkInterface;

  return {
    OwnerId,
    NetworkInterfaceId,
    PublicIp,
    InstanceId,
    InstanceOwnerId,
    InterfaceType,
    VpcId,
    SubnetId,
    SecurityGroups, // {GroupName, GroupId}
    PrivateIps: PrivateIpAddresses.map(
      (privateIp) => privateIp.PrivateIpAddress
    ),
  };
});

// TODO: 향후에 create 하는 기능만 남겨두기
const createSecurityGroupRule = async ({
  srcEniId,
  dstEniId,
  FromPort,
  ToPort,
  IpProtocol,
  Description,
}) => {
  const src = results.find((result) => result.NetworkInterfaceId === srcEniId);
  const dst = results.find((result) => result.NetworkInterfaceId === dstEniId);

  if (!src || !dst) {
    console.log('❌ [createSecurityGroupRule] Src or Dst not exists.');
    return;
  }

  // FIXME: 이거 굳이 필요한가? 어차피 vpcid 같으면..
  if (src.OwnerId === dst.OwnerId) {
    // SG REF 가능
    console.log(
      `✅ Same Account ID. SRC : ${src.OwnerId} / DST : ${dst.OwnerId}`
    );
    if (src.VpcId === dst.VpcId) {
      console.log(`✅ Same VPC ID. SRC : ${src.VpcId} / DST : ${dst.VpcId}`);
      // TODO: LB거치는지, 종류는 뭔지 등등도 알아야되는데 이건 어떻게 식별할까?
      // LB쪽으로 통신 요청을 하면 LB의 타겟그룹을 받아와서 그 타겟 그룹쪽 ip로 끝나는 sg에 넣어주기.
      // TODO: 인자는 객체로 넘겨서 디스트럭쳐링으로 해결하자
      try {
        const { $metadata, Return, SecurityGroupRules } = await ec2Client.send(
          new AuthorizeSecurityGroupIngressCommand({
            GroupId: dst.SecurityGroups.find((securityGroup) =>
              securityGroup.GroupName.endsWith('ref')
            ).GroupId,
            IpPermissions: [
              {
                FromPort,
                ToPort,
                IpProtocol,
                UserIdGroupPairs: [
                  {
                    GroupId: src.SecurityGroups.find((securityGroup) =>
                      securityGroup.GroupName.endsWith('ref')
                    ).GroupId,
                    Description,
                  },
                ],
              },
            ],
          })
        );
        console.log(Return);
        console.log('✅ Created.');
      } catch (error) {
        // [ 'Code', 'name', '$fault', '$metadata', '$response' ]
        console.log(Object.keys(error));
        return;
      }
    } else {
      console.log(
        `❌ Not same VPC ID. SRC : ${src.VpcId} / DST : ${dst.VpcId} `
      );
      // NOTE: VPC가 다를때
      // VPC PEERING 확인 필요
      const { VpcPeeringConnections, $metadata } = await ec2Client.send(
        new DescribeVpcPeeringConnectionsCommand({
          Filters: [
            {
              Name: 'accepter-vpc-info.vpc-id',
              Values: [src.VpcId],
            },
            { Name: 'requester-vpc-info.vpc-id', Values: [dst.VpcId] },
            { Name: 'status-code', Values: ['active'] },
          ],
        })
      );

      if ($metadata.httpStatusCode !== 200) {
        console.log(
          `❌ [createSecurityGroupRule] STATUS: ${$metadata.httpStatusCode}`
        );
        return undefined;
      }

      if (VpcPeeringConnections.length === 0) {
        console.log(`❌ [createSecurityGroupRule] No VPC Peerings.`);
        // return undefined;
      }

      try {
        const { $metadata, Return, SecurityGroupRules } = await ec2Client.send(
          new AuthorizeSecurityGroupIngressCommand({
            GroupId: dst.SecurityGroups.find((securityGroup) =>
              securityGroup.GroupName.endsWith('ip')
            ).GroupId,
            IpPermissions: [
              {
                FromPort,
                ToPort,
                IpProtocol,
                IpRanges: [
                  {
                    CidrIp: `${src.PrivateIps}/32`,
                    Description: 'IP_BASED',
                  },
                ],
              },
            ],
          })
        );
        console.log(Return);
        console.log('✅ Created.');
      } catch (error) {
        // [ 'Code', 'name', '$fault', '$metadata', '$response' ]
        console.log(Object.keys(error));
        console.log(error);
        return;
      }
    }
  } else {
    // NOTE: AWS ACCOUNT ID 다를 때(인덴테이션 꼭 줄이기)
    // FIXME: VPC PEERING 확인 필요
    // 동일 내용임 함수화 필요
  }
};

const ingressRule = {
  srcEniId: 'eni-0b489116dcef1ee1e',
  dstEniId: 'eni-0703790e81e0f8259',
  FromPort: 3000,
  ToPort: 4000,
  IpProtocol: 'tcp',
  // CidrIp
  Description: 'SG_BASED',
};

createSecurityGroupRule(ingressRule);
