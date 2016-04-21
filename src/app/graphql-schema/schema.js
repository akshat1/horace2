'use strict';

var graphql   = require('graphql');
//var BookQuery = require('./queries/book.js');
var BookListQuery = require('./query/book-list.js');
var ServerQuery = require('./query/server.js');


var schema = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      bookList: BookListQuery,
      server: ServerQuery
    }
  })
});


module.exports = schema;
