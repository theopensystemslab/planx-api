const DEBUG = true; //process.env.NODE_ENV === "development"

module.exports = {
  type: "postgres",
  url: process.env.DB_URI,
  synchronize: DEBUG,
  logging: DEBUG,
  entities: ["src/db/entities/**/*.ts"],
  migrations: ["src/db/migrations/**/*.ts"],
  subscribers: ["src/db/subscribers/**/*.ts"],
  cli: {
    entitiesDir: "src/db/entities",
    migrationsDir: "src/db/migrations",
    subscribersDir: "src/db/subscribers"
  }
};
