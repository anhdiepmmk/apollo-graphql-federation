const { ApolloGateway } = require("@apollo/gateway");
const { ApolloServer } = require("apollo-server");

const gateway = new ApolloGateway({
  serviceList: [
    { name: "book-service", url: "http://localhost:4001" },
    { name: "user-service", url: "http://localhost:4002" },
    { name: "order-service", url: "http://localhost:4003" },
  ],
});

const server = new ApolloServer({
  gateway,
  subscriptions: false,
});

server.listen(4000).then(({ url }) => {
  console.log(`Gateway running at ${url}`);
});
