import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from 'fs';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Dynamic routing
const routeFiles = fs.readdirSync(new URL('./app/routes', import.meta.url).pathname);
for (const file of routeFiles) {
  const route = await import(new URL(`./app/routes/${file}`, import.meta.url).pathname);
  app.use('/', route.default);
}

// Pubsub topic init
const eventFiles = fs.readdirSync(new URL('./app/events', import.meta.url).pathname);
for (const file of eventFiles) {
  const event = await import(new URL(`./app/events/${file}`, import.meta.url).pathname);
  createTopic(event.getTopicName()).catch((err) => {
    console.error('ERROR:', err.details);
  });
}

// Pubsub subscription init
const subscriberFiles = fs.readdirSync(new URL('./app/subscribers', import.meta.url).pathname);
for (const file of subscriberFiles) {
  const subs = await import(new URL(`./app/subscribers/${file}`, import.meta.url).pathname);
  createTopic(subs.getTopicName()).catch((err) => {
    console.error('ERROR:', err.details);
  });

  topic(subs.getTopicName()).createSubscription(subs.getSubsName()).catch((err) => {
    console.error('ERROR:', err.details);
  });

  subscription(subs.getSubsName()).on('message', subs.handler);
}

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

export default app;
