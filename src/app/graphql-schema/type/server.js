'use strict';

const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLBoolean
} = graphql;


const ServerType = new GraphQLObjectType({
  name: 'Server',
  fields: {
    isScanning: { type: GraphQLBoolean }
  }
});


module.exports = ServerType;
