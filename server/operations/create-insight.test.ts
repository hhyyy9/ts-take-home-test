import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import type { Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";

describe("creating insights in the database", () => {
  withDB((fixture) => {
    let result: Insight;

    beforeAll(() => {
      result = createInsight({
        ...fixture,
        brand: 2,
        text: "new insight",
      });
    });

    it("creates an insight", () => {
      expect(result.id).toBeGreaterThan(0);
      expect(result.brand).toBe(2);
      expect(result.text).toBe("new insight");
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("persists the insight", () => {
      expect(fixture.insights.selectAll()).toEqual([{
        id: result.id,
        brand: 2,
        createdAt: result.createdAt.toISOString(),
        text: "new insight",
      }]);
    });
  });
});
