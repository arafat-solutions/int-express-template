module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './src/dev.sqlite3',
    },
    migrations: {
      directory: __dirname + '/src/db/migrations',
    },
    seeds: {
      directory: __dirname + '/src/db/seeds',
    },
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './src/prod.sqlite3',
    },
    migrations: {
      directory: __dirname + '/src/db/migrations',
    },
    seeds: {
      directory: __dirname + '/src/db/seeds',
    },
  },
};
