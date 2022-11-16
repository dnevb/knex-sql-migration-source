// Update with your config settings.
import { URL } from "url";
import { SqlMigrationSource } from "./dist/main.js";

const directory = new URL("migr", import.meta.url).pathname;

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3",
    },
    migrations: {
      extension: "sql",
      stub: "sql.stub",
      migrationSource: new SqlMigrationSource(directory),
    },
  },
};
