import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Configuration } from "@rspack/core";

import { unplugin } from "../../../src";

const fixtureDirectory = fileURLToPath(new URL(".", import.meta.url));

export function createRspackConfig(outputPath: string): Configuration {
  return {
    context: fixtureDirectory,
    mode: "production",
    target: "node",
    entry: "./src/entry.ts",
    devtool: "source-map",
    output: {
      path: outputPath,
      filename: "bundle.cjs",
      library: {
        type: "commonjs2",
      },
    },
    resolve: {
      alias: {
        "ts-nameof-proxy": resolve(fixtureDirectory, "src/runtime-proxy.ts"),
      },
      extensions: [".ts", ".js"],
      extensionAlias: {
        ".js": [".ts", ".js"],
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          sideEffects: false,
          use: {
            loader: "builtin:swc-loader",
            options: {
              detectSyntax: "auto",
              jsc: {
                target: "es2022",
              },
              module: {
                type: "commonjs",
              },
            },
          },
        },
      ],
    },
    plugins: [unplugin.rspack()],
    optimization: {
      minimize: true,
      sideEffects: true,
      usedExports: true,
    },
  };
}
