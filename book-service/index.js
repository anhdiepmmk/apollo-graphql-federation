const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/federation");

const data = {
  books: [
    {
      id: "a book id",
      title: "a book title",
      price: 100,
      createdBy: "a user id",
    },
    {
      id: "b book id",
      title: "b book title",
      price: 200,
      createdBy: "b user id",
    },
    {
      id: "c book id",
      title: "c book title",
      price: 300,
      createdBy: "c user id",
    },
  ],
};

const typeDefs = gql`
  type Book @key(fields: "id") {
    id: ID!
    title: String!
    description: String
    price: Int!
    createdBy: String!
    createdUser: User!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    books: [Book!]!
  }

  extend type Query {
    book(id: ID!): Book
    books: [Book!]!
  }
`;

const resolvers = {
  Query: {
    book: (parent, { id }) => {
      return data.books.find((book) => book.id === id);
    },
    books: () => {
      return data.books;
    },
  },
  User: {
    books: (user) => {
      const { id: userId } = user;
      return data.books.filter((book) => book.createdBy === userId);
    },
  },
  Book: {
    __resolveReference: (ref) => {
      console.log("book resolve reference", ref);
      const { id } = ref;
      return data.books.find((book) => book.id === id);
    },
    createdUser: (book) => {
      // this tell user service resolve correct user data
      return {
        __typename: "User",
        id: book.createdBy,
      };
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

server.listen(4001).then(({ url }) => {
  console.log(`Book Service running at ${url}`);
});
