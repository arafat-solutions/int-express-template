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
