const UsersGenerator = [
  {
    'repeat(30)': {
      _id: '{{objectId()}}',
      isActive: '{{bool()}}',
      picture: 'http://placehold.it/32x32',
      age: '{{integer(20, 40)}}',
      name: {
        first: '{{firstName()}}',
        last: '{{surname()}}'
      },
      company: '{{company().toUpperCase()}}',
      email(tags) {
        return `${this.name.first}.${this.name.last}@${this.company}${tags.domainZone()}`.toLowerCase();
      },
      avatar() {
        return `https://api.adorable.io/avatars/200/${this.email}.png`;
      },
      phone: '+1 {{phone()}}',
      address: '{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}, {{integer(100, 10000)}}',
      registered: '{{moment(this.date(new Date(2014, 0, 1), new Date())).format("LLLL")}}'
    }
  }
];
