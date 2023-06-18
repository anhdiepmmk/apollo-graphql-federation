const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/federation");

const data = {
  orders: [
    {
      id: "a order id",
      createdBy: "a user id",
      items: [
        {
          bookId: "a book id",
          quantity: 10,
          price: 100,
        },
        {
          bookId: "b book id",
          quantity: 5,
          price: 45,
        },
      ],
    },
  ],
};

const typeDefs = gql`
  type OrderItem {
    bookId: String!
    book: Book!
    quantity: Int!
    price: Int!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }

  extend type Book @key(fields: "id") {
    id: ID! @external
  }

  type Order @key(fields: "id") {
    id: ID!
    totalPrice: Int!
    totalQuantity: Int!
    createdBy: String!
    createdUser: User!
    items: [OrderItem!]!
  }

  extend type Query {
    orders: [Order!]!
    order(id: ID!): Order!
  }
`;

const resolvers = {
  Query: {
    order: (_, { id }) => {
      return data.orders.find((order) => order.id === id);
    },
    orders: () => {
      return data.orders;
    },
  },
  OrderItem: {
    book: (orderItem) => {
      // tell book service resolve correct book data
      return {
        __typename: "Book",
        id: orderItem.bookId,
      };
    },
  },
  Order: {
    __resolveReference: (ref) => {
      console.log("order resolve reference", ref);
      const { id } = ref;
      return data.orders.find((order) => order.id === id);
    },
    createdUser: (order) => {
      // tell user service resolve correct user data
      return {
        __typename: "User",
        id: order.createdBy,
      };
    },
    totalPrice: (parent) => {
      return parent.items.reduce((acc, item) => {
        return acc + item.quantity * item.price;
      }, 0);
    },

    totalQuantity: (parent) => {
      return parent.items.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);
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

server.listen(4003).then(({ url }) => {
  console.log(`Order Service running at ${url}`);
});
