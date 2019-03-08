const DEBUG = JSON.parse(process.env.DEBUG)
const path = process.env.NODE_ENV === 'production' ? 'dist' : 'src'

module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: DEBUG,
  logging: DEBUG,
  entities: [`${path}/db/entities/**/*.{js,ts}`],
  migrations: [`${path}/db/migrations/**/*.{js,ts}`],
  subscribers: [`${path}/db/subscribers/**/*.{js,ts}`],
  cli: {
    entitiesDir: 'src/db/entities',
    migrationsDir: 'src/db/migrations',
    subscribersDir: 'src/db/subscribers',
  },
}
