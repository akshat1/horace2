'use strict';

const Horace       = require('../../horace.js');
const ServerType = require('../type/server.js');
const graphql  = require('graphql');
const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = graphql;


function resolve(root, args) {
  return {
    isScanningForBooks: !!Horace.isScanningForBooks()
  };
}


const ServerQuery = {
  type: ServerType,
  resolve: resolve
};


module.exports = ServerQuery;
