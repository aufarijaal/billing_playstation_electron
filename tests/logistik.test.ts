import { expect, test } from "vitest";
import logistikRepository from "../electron/repositories/logistik-repository";

test("Add one logistik must be successful", async () => {
  expect(await logistikRepository.store("Es teh", 2000)).toBeInstanceOf(
    typeof Number,
  );
});
