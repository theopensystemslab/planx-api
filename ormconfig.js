const DEBUG = process.env.NODE_ENV !== 'production'

module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: DEBUG,
  logging: DEBUG,
  entities: ['dist/db/entities/**/*.js'],
  migrations: ['dist/db/migrations/**/*.js'],
  subscribers: ['dist/db/subscribers/**/*.js'],
  cli: {
    entitiesDir: 'src/db/entities',
    migrationsDir: 'src/db/migrations',
    subscribersDir: 'src/db/subscribers',
  },
}
