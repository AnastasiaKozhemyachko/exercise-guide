import { expect, it } from "vitest";
import { assetUrl } from "./assetUrl";
it("resolves images at the domain root and under the GitHub project prefix", () => {
  expect(assetUrl("/images/card.png", "/")).toBe("/images/card.png");
  expect(assetUrl("/images/card.png", "/exercise-guide/")).toBe(
    "/exercise-guide/images/card.png",
  );
});
