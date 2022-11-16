import { readdir, readFile } from "fs/promises";
import type { Knex } from "knex";
import { join } from "path";
import { isNullish } from "./utils.js";

const UP_BEGIN = "up begin";
const UP_END = "up end";
const DOWN_BEGIN = "down begin";
const DOWN_END = "down end";
const NO_TRAN = "no transaction";

class SqlMigrationSource implements Knex.MigrationSource<{ file }> {
  constructor(public directory: string) {}

  async getMigrations() {
    const items = await readdir(this.directory);

    return items.map((item) => ({
      file: item,
    }));
  }

  getMigrationName(item) {
    return item.file;
  }

  async getMigration(item) {
    const file = await readFile(join(this.directory, item.file));
    const lines = file.toString().split("\n");
    const meta = lines.reduce<Record<string, number>>(
      (prev, line, i) => {
        line = line.trim().toLowerCase();

        if (line.startsWith("--")) {
          if (line.includes(UP_BEGIN)) return { ...prev, [UP_BEGIN]: i };
          if (line.includes(UP_END)) return { ...prev, [UP_END]: i };
          if (line.includes(DOWN_BEGIN))
            return { ...prev, [DOWN_BEGIN]: i };
          if (line.includes(DOWN_END)) return { ...prev, [DOWN_END]: i };
          if (line.includes(NO_TRAN)) return { ...prev, transaction: 0 };
        }

        return prev;
      },
      { transaction: 1 }
    );

    // validations
    if (isNullish(meta[UP_BEGIN])) throw new Error("up begin is required");
    if (isNullish(meta[UP_END])) throw new Error("up end is required");

    if (isNullish(meta[DOWN_BEGIN]))
      throw new Error("down begin is required");
    if (isNullish(meta[DOWN_END])) throw new Error("down end is required");

    if (meta[UP_BEGIN] >= meta[UP_END])
      throw new Error("up end cant be before up begin");
    if (meta[DOWN_BEGIN] >= meta[DOWN_END])
      throw new Error("down end cant be before down begin");

    const up = lines
      .filter((_, i) => i > meta[UP_BEGIN] && i < meta[UP_END])
      .join("\n");
    const down = lines
      .filter((_, i) => i > meta[DOWN_BEGIN] && i < meta[DOWN_END])
      .join("\n");

    return {
      up: (k) => k.raw(up),
      down: (k) => k.raw(down),
      config: {
        transaction: !!meta["transaction"],
      },
    };
  }
}

export default SqlMigrationSource;
