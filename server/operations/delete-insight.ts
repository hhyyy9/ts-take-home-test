import type { HasDBClient } from "../shared.ts";

type Input = HasDBClient & {
  id: number;
};

export default (input: Input): boolean => {
  console.log(`Deleting insight for id=${input.id}`);

  input.db.exec(`DELETE FROM insights WHERE id = ?`, input.id);

  const changes = input.db.changes;
  const success = changes > 0;

  if (success) {
    console.log("Insight deleted successfully");
  } else {
    console.log("Insight not found");
  }

  return success;
};
