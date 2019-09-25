# Tutorial: Implement a Custom VPC with private and public subnets

This tutorial will teach you how to create a custom VPC from scratch and secure your backends services while keeping public services available for everyone.

## Architecture

![Architecture](assets/architecture.png)

## Workflow

There're two subnets inside the same Availability Zone (`AZ-1a`). `subnet-a` is public (has internet access) while `subnet-b` is private.

`subnet-a` is public because it has associated a Route Table which routes traffic from the subnet to the internet through the Internet Gateway (from `0.0.0.0/0` to IGW).

`subnet-b` is private because it does not have internet acces by its own, instead it uses a NAT Gateway (Network Address Translator). What the NAT Gateway does is, whenever an instance inside the private subnet wants to reach iternet, the traffic is routed to the NAT device, which acts imposter, lending it's public IP (Elastic IP) to reach internet through the IGW. When the response goes back, the NAT device route back it to the original requester. So, there's a Route Table associated with the `subnet-b` which makes it private, routing traffic that wants to reach internet to the NAT device (from `0.0.0.0/0` to NAT). Notice that the NAT Gateway must be inside the public subnet so it is able to hit internet.

And as you have already inferred, there's also an Internet Gateway attached to the VPC, enabling internet access.

There's an EC2 instance in the public subnet with a Server Side Rendered (SSR) React App, developed using [Next.js](https://nextjs.org/) which hits an API hosted in another EC2 inside the private subnet. This API only has one Endpoint to retrieve a static list of users.

## App Example

## Prerequisites

This tutorial asumes you have an AWS account and you've configured AWS credentials for CLI, if you haven't [please do so](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html#post-install-configure).

I have configured the CLI to use the `us-east-1` region, so all the resources will be created in this region.

To follow the procedures in this tutorial you'll need a command line terminal to run commands. Commands are shown as below:

```
(bash) $ command
----------------
output
```

`(bash) $ ` is a constant indicating that is a command running in bash. Everything below `--------------` is the output of the command, or if the response is a JSON, it will have its own section denoted by **Output:** header.

> **IMPORTANT!** Make sure to replace ID parameters in all the AWS commands.

Let's start.

## Creating a Custom VPC

A VPC is an isolated portion of the AWS cloud populated by AWS objects, such as Amazon EC2 instances. It is basically a network in the cloud. You must specify an IPv4 address range for your VPC. Specify the IPv4 address range as a Classless Inter-Domain Routing (CIDR) block; for example, 10.0.0.0/16. You cannot specify an IPv4 CIDR block larger than /16. You can optionally associate an Amazon-provided IPv6 CIDR block with the VPC.

```
create-vpc
  --cidr-block <value>
  [--amazon-provided-ipv6-cidr-block | --no-amazon-provided-ipv6-cidr-block]
  [--dry-run | --no-dry-run]
  [--instance-tenancy <value>]
  [--cli-input-json <value>]
  [--generate-cli-skeleton <value>]
```

```bash
(bash) $ aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16
```

Output:

```json
{
  "Vpc": {
    "VpcId": "vpc-0d655eeb1089e10ff",
    "InstanceTenancy": "default",
    "Tags": [],
    "CidrBlockAssociationSet": [
      {
        "AssociationId": "vpc-cidr-assoc-0d312e44950988d81",
        "CidrBlock": "10.0.0.0/16",
        "CidrBlockState": {
          "State": "associated"
        }
      }
    ],
    "Ipv6CidrBlockAssociationSet": [],
    "State": "pending",
    "DhcpOptionsId": "dopt-0c363277",
    "OwnerId": "436887685341",
    "CidrBlock": "10.0.0.0/16",
    "IsDefault": false
  }
}
```

## Creating subnets

A subnet us a portion of your network (your VPC).

In an on-premise architecture it is common to design subnets based on departments and functionalities (ie. finances, HR, marketing, each of them with its own subred).

But in cloud it's used to design according to what should be public and what private. Backend services should be isolated from internet and only enable access from known sources. By doing this we keep our services secure from unintended access.

When you create each subnet, you provide the VPC ID and IPv4 CIDR block for the subnet. After you create a subnet, you can't change its CIDR block. The size of the subnet's IPv4 CIDR block can be the same as a VPC's IPv4 CIDR block, or a subset of a VPC's IPv4 CIDR block. If you create more than one subnet in a VPC, the subnets' CIDR blocks must not overlap. The smallest IPv4 subnet (and VPC) you can create uses a /28 netmask (16 IPv4 addresses), and the largest uses a /16 netmask (65,536 IPv4 addresses).

If you add more than one subnet to a VPC, they're set up in a star topology with a logical router in the middle.

```
create-subnet
  [--availability-zone <value>]
  [--availability-zone-id <value>]
  --cidr-block <value>
  [--ipv6-cidr-block <value>]
  --vpc-id <value>
  [--dry-run | --no-dry-run]
  [--cli-input-json <value>]
  [--generate-cli-skeleton <value>]
```

```bash
(bash) $ aws ec2 create-subnet \
    --availability-zone us-east-1a \
    --vpc-id vpc-0d655eeb1089e10ff \
    --cidr-block 10.0.1.0/24
```

Output:

```json
{
  "Subnet": {
    "MapPublicIpOnLaunch": false,
    "AvailabilityZoneId": "use1-az6",
    "AvailableIpAddressCount": 251,
    "DefaultForAz": false,
    "SubnetArn": "arn:aws:ec2:us-east-1:436887685341:subnet/subnet-035ea7e7fb6ddcf78",
    "Ipv6CidrBlockAssociationSet": [],
    "VpcId": "vpc-0d655eeb1089e10ff",
    "State": "pending",
    "AvailabilityZone": "us-east-1a",
    "SubnetId": "subnet-035ea7e7fb6ddcf78",
    "OwnerId": "436887685341",
    "CidrBlock": "10.0.1.0/24",
    "AssignIpv6AddressOnCreation": false
  }
}
```

```bash
(bash) $ aws ec2 create-subnet \
    --availability-zone us-east-1a \
    --vpc-id vpc-0d655eeb1089e10ff \
    --cidr-block 10.0.2.0/24
```

Output:

```json
{
  "Subnet": {
    "MapPublicIpOnLaunch": false,
    "AvailabilityZoneId": "use1-az6",
    "AvailableIpAddressCount": 251,
    "DefaultForAz": false,
    "SubnetArn": "arn:aws:ec2:us-east-1:436887685341:subnet/subnet-04fc9f2d0dc7d8577",
    "Ipv6CidrBlockAssociationSet": [],
    "VpcId": "vpc-0d655eeb1089e10ff",
    "State": "pending",
    "AvailabilityZone": "us-east-1a",
    "SubnetId": "subnet-04fc9f2d0dc7d8577",
    "OwnerId": "436887685341",
    "CidrBlock": "10.0.2.0/24",
    "AssignIpv6AddressOnCreation": false
  }
}
```

> Notice that in both commands we are specifying `us-east-1a` as AZ. In case you're curious which AZs are available you can query them by typing `aws ec2 describe-availability-zones`.

