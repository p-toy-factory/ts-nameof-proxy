import { createUnplugin } from "unplugin";

import { transform as transformCode } from "./core";

export const unplugin = createUnplugin(() => {
  return {
    name: "unplugin-ts-nameof-proxy",
    enforce: "pre",
    transformInclude(id) {
      return /\.[jt]sx?$/.test(id);
    },
    transform(code, id) {
      return transformCode(code, id);
    },
  };
});

export default unplugin;
