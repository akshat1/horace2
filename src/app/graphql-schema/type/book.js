'use strict';

const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = graphql;


const BookType = new GraphQLObjectType({
  name: 'Book',
  fields: {
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    authors: { type: new GraphQLList(GraphQLString)},
    subjects: { type: new GraphQLList(GraphQLString)},
    year: { type: GraphQLInt }
  }
});

module.exports = BookType;
