import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";

// Importe do meu schema do banco de dados
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema
});