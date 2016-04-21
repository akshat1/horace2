'use strict';


var graphql     = require('graphql');
var graphqlHTTP = require('express-graphql');
var schema      = require('../graphql-schema/schema.js')

var graphQLServer = graphqlHTTP({ schema: schema, pretty: true })

module.exports = {
  getGraphQLHTTP: function() {
    return graphQLServer;
  }
};
