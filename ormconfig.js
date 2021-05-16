const typeOrmDir = process.env.NODE_ENV === "development" ? "src" : "dist";

const baseConfig = {
  type: "postgres",
  synchronize: false,
  logging: false,
  entities: [`${typeOrmDir}/entity/**/*`],
  migrations: [`${typeOrmDir}/migration/**/*`],
  subscribers: [`${typeOrmDir}/subscriber/**/*`],
  cli: {
    migrationsDir: `${typeOrmDir}/migration`,
  },
};

const localConfig = {
  ...baseConfig,
  host: "localhost",
  port: 5432,
  username: "williams",
  password: "postgres",
  database: "time",
};

const prodConfig = process.env.DATABASE_URL && {
  ...baseConfig,
  url: process.env.DATABASE_URL,
  extra: {
    ssl: true,
  },
};

module.exports = process.env.DATABASE_URL ? prodConfig : localConfig;
