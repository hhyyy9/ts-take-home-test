import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import { expect } from "jsr:@std/expect";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";

describe("deleting insights in the database", () => {
  describe("specified insight not in the DB", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        result = deleteInsight({ ...fixture, id: 1 });
      });

      it("returns false", () => {
        expect(result).toBe(false);
      });
    });
  });

  describe("insight is in the DB", () => {
    withDB((fixture) => {
      let result: boolean;

      beforeAll(() => {
        fixture.insights.insert([{
          brand: 1,
          createdAt: new Date().toISOString(),
          text: "delete me",
        }]);
        result = deleteInsight({ ...fixture, id: 1 });
      });

      it("returns true", () => {
        expect(result).toBe(true);
      });

      it("removes the insight", () => {
        expect(fixture.insights.selectAll()).toEqual([]);
      });
    });
  });
});
