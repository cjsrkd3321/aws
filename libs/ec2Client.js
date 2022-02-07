import { EC2Client } from '@aws-sdk/client-ec2';

const REGION = 'ap-northeast-2';
export const ec2Client = new EC2Client({ region: REGION });
