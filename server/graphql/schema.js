const { buildSchema } = require("graphql");

module.exports = buildSchema(`#graphql
  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!
  }

  input UserInputData {
    email: String!
    name: String!
    password: String!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
  }

  type rootQuery {
    hello: String
  }

  schema {
    query: rootQuery
    mutation: RootMutation
  }
`);
