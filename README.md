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

> When you create a VPC, also a Network Access Control List (NACL), a Security Group (SG) and a Route Table (RT) are created with default configurations.

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

Now we have two subnets created. By default they're private subnets because we haven't specified to route traffic to the internet, which we'll do in the Route Tables section.

> Notice that in both commands we are specifying `us-east-1a` as AZ. In case you're curious which AZs are available you can query them by typing `aws ec2 describe-availability-zones`.

## Create Internet Gateway

An internet gateway is a virtual router that connects a VPC to the internet.

```
create-internet-gateway
  [--dry-run | --no-dry-run]
  [--cli-input-json <value>]
  [--generate-cli-skeleton <value>]
```

```bash
(bash) $ aws ec2 create-internet-gateway
```

Output:

```json
{
  "InternetGateway": {
    "Tags": [],
    "Attachments": [],
    "InternetGatewayId": "igw-0d956792dbe1751c5"
  }
}
```

### Attach IGW to VPC

The Internet Gateway has been created, but it is required to be assosiated to a VPC.

```
attach-internet-gateway
  [--dry-run | --no-dry-run]
  --internet-gateway-id <value>
  --vpc-id <value>
  [--cli-input-json <value>]
  [--generate-cli-skeleton <value>]
```

```bash
(bash) $ aws ec2 attach-internet-gateway \
    --internet-gateway-id igw-0d956792dbe1751c5 \
    --vpc-id vpc-0d655eeb1089e10ff
```

## Create Route Tables

Route Tables are created inside a VPC. A subnet always must be associated to a Route Table, and if you don't specify the route table it will be associated with the default Route Table created with the VPC.

What a Route Table does is cause that traffic originating from the subnet to be routed according to the routes in the route table.

So then we're going to create our own Route Tables, one for the public subnet and other for the private subnet.

```
create-route-table
  [--dry-run | --no-dry-run]
  --vpc-id <value>
  [--cli-input-json <value>]
  [--generate-cli-skeleton <value>]
```

Execute this command twice so you create two different Route Tables.

```bash
(bash) $ aws ec2 create-route-table --vpc-id vpc-0d655eeb1089e10ff
```

Output:

```json
{
  "RouteTable": {
    "Associations": [],
    "RouteTableId": "rtb-00f0b485037a37edd",
    "VpcId": "vpc-0d655eeb1089e10ff",
    "PropagatingVgws": [],
    "Tags": [],
    "Routes": [
      {
        "GatewayId": "local",
        "DestinationCidrBlock": "10.0.0.0/16",
        "State": "active",
        "Origin": "CreateRouteTable"
      }
    ],
    "OwnerId": "436887685341"
  }
}
```

```json
{
  "RouteTable": {
    "Associations": [],
    "RouteTableId": "rtb-05551d7bcd77d4316",
    "VpcId": "vpc-0d655eeb1089e10ff",
    "PropagatingVgws": [],
    "Tags": [],
    "Routes": [
      {
        "GatewayId": "local",
        "DestinationCidrBlock": "10.0.0.0/16",
        "State": "active",
        "Origin": "CreateRouteTable"
      }
    ],
    "OwnerId": "436887685341"
  }
}
```

* `rtb-00f0b485037a37edd` will be our public subnet (`subnet-035ea7e7fb6ddcf78`).
* `rtb-05551d7bcd77d4316` will be our private subnet (`subnet-04fc9f2d0dc7d8577`).

Also notice that when you create a Route Table it gets by default a Route which goes from `10.0.0.0/16` to `local`. And if you're paying attention the `from` block of IPs is the CIDR of the VPC.

What these route does is enable free traffic among instances belonging to the same VPC so that an EC2 instances in a subnet A is able to communicate to an EC2 instance in a subnet B.

### Make a subnet Public

As I mentioned before, both subnets are private because they only have a route that enables free traffic inside the VPC. In order to make a subnet a public one we must create a route that routes traffic from the subnet to the internet, and that's by using the Internet Gateway.

```
create-route
  [--destination-cidr-block <value>]
  [--destination-ipv6-cidr-block <value>]
  [--dry-run | --no-dry-run]
  [--egress-only-internet-gateway-id <value>]
  [--gateway-id <value>]
  [--instance-id <value>]
  [--nat-gateway-id <value>]
  [--transit-gateway-id <value>]
  [--network-interface-id <value>]
  --route-table-id <value>
  [--vpc-peering-connection-id <value>]
  [--cli-input-json <value>]
  [--generate-cli-skeleton <value>]
```

```bash
(bash) $ aws ec2 create-route \
    --route-table-id rtb-00f0b485037a37edd \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id igw-0d956792dbe1751c5
```

What this command does is "for the Route Table `rtb-00f0b485037a37edd`, create a route that routes traffic from `0.0.0.0/0` to the Internet Gateway `igw-0d956792dbe1751c5`". The `0.0.0.0/0` CIDR block  match all addresses in the IPv4 address space. In other words, every IP has access to the Internet.

### Associate Route Tables to Subnets

Now it's time to make our subnets public and private (both are private by default).

```
associate-route-table
  [--dry-run | --no-dry-run]
  --route-table-id <value>
  --subnet-id <value>
  [--cli-input-json <value>]
  [--generate-cli-skeleton <value>]
```

Associate the public Route Table to a Subnet.

```bash
(bash) $ aws ec2 associate-route-table \
    --route-table-id rtb-00f0b485037a37edd \
    --subnet-id subnet-035ea7e7fb6ddcf78
```

Output:

```json
{
  "AssociationId": "rtbassoc-08fb23dd9088d411b"
}
```

Associate the private Route Table to the other subnet.

```bash
(bash) $ aws ec2 associate-route-table \
    --route-table-id rtb-05551d7bcd77d4316 \
    --subnet-id subnet-04fc9f2d0dc7d8577
```

Output:

```json
{
  "AssociationId": "rtbassoc-077574195a5cb091a"
}
```
