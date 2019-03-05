const DEBUG = true; //process.env.NODE_ENV === "development"

module.exports = {
  type: "postgres",
  url: process.env.DB_URI,
  synchronize: DEBUG,
  logging: DEBUG,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
};
