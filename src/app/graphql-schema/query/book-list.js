'use strict';

const DB       = require('../../db.js');
const bookType = require('../type/book.js');
const graphql  = require('graphql');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = graphql;


const BookListQuery = {
  type: new GraphQLList(bookType),
  args: {
    from: { type: GraphQLInt },
    numItems: { type: GraphQLInt }
  },
  resolve: function(root, args) {
    return DB.getBooksSimple(args.from, args.numItems)
  }
};

module.exports = BookListQuery;
