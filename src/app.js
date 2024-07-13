const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const pubsub = require(__dirname + '/config/pubsub');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// Dynamic routing
fs.readdirSync(__dirname + '/app/routes').forEach((file) => {
  app.use('/', require(__dirname + '/app/routes/' + file));
});

// Pubsub topic init
fs.readdirSync(__dirname + '/app/events').forEach((file) => {
  const event = require(__dirname + '/app/events/' + file);

  pubsub.createTopic(event.getTopicName()).catch((err) => {
    console.error('ERROR:', err.details);
  });
});

// Pubsub subscription init
fs.readdirSync(__dirname + '/app/subscribers').forEach((file) => {
  const subs = require(__dirname + '/app/subscribers/' + file);

  pubsub.createTopic(subs.getTopicName()).catch((err) => {
    console.error('ERROR:', err.details);
  });

  pubsub
      .topic(subs.getTopicName())
      .createSubscription(subs.getSubsName())
      .catch((err) => {
        console.error('ERROR:', err.details);
      });

  pubsub.subscription(subs.getSubsName()).on('message', subs.handler);
});

// Default error handler
app.use((err, req, res, next) => {
  if (typeof err.handle === 'function') {
    err.handle();
  }

  console.log(err);

  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    msg: err.printMsg || 'Something went wrong!',
  });
});

module.exports = app;
