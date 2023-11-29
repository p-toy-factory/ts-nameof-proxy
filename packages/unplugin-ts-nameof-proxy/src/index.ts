import { createUnplugin } from "unplugin";

const plugins = createUnplugin((options) => {
	return {
		name: "unplugin-ts-nameof-proxy",
		transformInclude(id) {
			return /\.[jt]sx?$/.test(id);
		},
		transform(code) {
			return "";
		},
	};
});
