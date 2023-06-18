const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/federation");

const data = {
  users: [
    {
      id: "a user id",
      fullName: "a full name",
      gender: "MALE",
    },
    {
      id: "b user id",
      fullName: "b full name",
      gender: "MALE",
    },
    {
      id: "c user id",
      fullName: "c full name",
      gender: "FEMALE",
    },
  ],
};

const typeDefs = gql`
  enum Gender {
    MALE
    FEMALE
  }

  type User @key(fields: "id") {
    id: ID!
    fullName: String!
    gender: Gender!
  }

  extend type Query {
    user(id: ID!): User
    users: [User]
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => {
      return data.users.find((user) => user.id === id);
    },
    users: () => {
      return data.users;
    },
  },
  User: {
    __resolveReference: (ref) => {
      console.log("user resolve reference", ref);
      const { id } = ref;
      return data.users.find((user) => user.id === id);
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen(4002).then(({ url }) => {
  console.log(`User Service running at ${url}`);
});
