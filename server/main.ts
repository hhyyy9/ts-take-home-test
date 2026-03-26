import { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import * as path from "@std/path";
import { Port } from "../lib/utils/index.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";
import { createTable } from "./tables/insights.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const dbFilePath = path.resolve("tmp", "db.sqlite3");

console.log(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
const db = new Database(dbFilePath);

db.exec(createTable);

console.log("Initialising server");

const router = new oak.Router();

const parseInsightId = (value: string | undefined): number | undefined => {
  if (!value) {
    return;
  }

  const id = Number(value);
  if (!Number.isInteger(id) || id < 0) {
    return;
  }

  return id;
};

type CreateInsightBody = {
  brand: number;
  text: string;
};

const isCreateInsightBody = (value: unknown): value is CreateInsightBody => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Number.isInteger(record.brand) &&
    Number(record.brand) >= 0 &&
    typeof record.text === "string" &&
    record.text.trim().length > 0;
};

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/insights", (ctx) => {
  const result = listInsights({ db });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.get("/insights/:id", (ctx) => {
  const id = parseInsightId(ctx.params.id);
  if (id === undefined) {
    ctx.response.body = { error: "Invalid insight id" };
    ctx.response.status = 400;
    return;
  }

  const result = lookupInsight({ db, id });
  if (!result) {
    ctx.response.body = { error: "Insight not found" };
    ctx.response.status = 404;
    return;
  }

  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights", async (ctx) => {
  let body: unknown;
  try {
    body = await ctx.request.body.json();
  } catch {
    ctx.response.body = { error: "Invalid JSON body" };
    ctx.response.status = 400;
    return;
  }

  if (!isCreateInsightBody(body)) {
    ctx.response.body = { error: "Invalid request body" };
    ctx.response.status = 400;
    return;
  }

  const result = createInsight({
    db,
    brand: body.brand,
    text: body.text.trim(),
  });
  ctx.response.body = result;
  ctx.response.status = 201;
});

router.delete("/insights/:id", (ctx) => {
  const id = parseInsightId(ctx.params.id);
  if (id === undefined) {
    ctx.response.body = { error: "Invalid insight id" };
    ctx.response.status = 400;
    return;
  }

  const success = deleteInsight({ db, id });
  if (success) {
    ctx.response.status = 204;
  } else {
    ctx.response.status = 404;
  }
});

const app = new oak.Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);