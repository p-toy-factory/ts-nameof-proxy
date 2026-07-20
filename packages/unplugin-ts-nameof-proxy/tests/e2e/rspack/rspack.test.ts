import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { rspack, type Configuration, type Stats } from "@rspack/core";
import { expect, test } from "vitest";

import { createRspackConfig } from "./rspack.config";

function compile(config: Configuration): Promise<Stats> {
  return new Promise((resolve, reject) => {
    const compiler = rspack(config);

    compiler.run((error, stats) => {
      compiler.close((closeError) => {
        if (error) {
          reject(error);
        } else if (closeError) {
          reject(closeError);
        } else if (stats) {
          resolve(stats);
        } else {
          reject(new Error("Rspack did not return compilation stats."));
        }
      });
    });
  });
}

test("transforms TypeScript before the Rspack SWC loader", async () => {
  const outputPath = await mkdtemp(join(tmpdir(), "unplugin-ts-nameof-proxy-rspack-"));

  try {
    const stats = await compile(createRspackConfig(outputPath));

    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);

    const bundle = await readFile(join(outputPath, "bundle.cjs"), "utf8");
    const sourceMap = JSON.parse(await readFile(join(outputPath, "bundle.cjs.map"), "utf8"));

    expect(sourceMap).toHaveProperty("version");
    expect(bundle).toContain("extension-alias-resolved");
    expect(bundle).toContain("['profile']['name']");
    expect(bundle).not.toContain("runtimeValueMustNotBeEvaluated");
    expect(bundle).not.toContain("RUNTIME_VALUE_MUST_NOT_BE_EVALUATED");
    expect(bundle).not.toContain("RUNTIME_PROXY_MUST_NOT_BE_BUNDLED");
    expect(bundle).not.toMatch(/\b(fieldName|pathStringsOf)\b/);
  } finally {
    await rm(outputPath, { recursive: true, force: true });
  }
});
