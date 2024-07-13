const PubSub = require('@google-cloud/pubsub').PubSub;

const pubsub = new PubSub({
  apiEndpoint: 'localhost:8085',
});

module.exports = pubsub;
