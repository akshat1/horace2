'use strict';

const DB       = require('../../db.js');
const bookType = require('../types/book.js');
const graphql  = require('graphql');


const BookQuery = {
  type: bookType,
  args: {
    id: {
      type: graphql.GraphQLInt
    }
  },
  resolve: function(_, args) {
    return DB.getBook(args.id);
  }
}

module.exports = BookQuery;
