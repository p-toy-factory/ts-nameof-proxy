// @ts-check

/**
 * @param {{ hash: string, repo: string, userOrOrg: string }} commit `{ commit: string, repo: string, userOrOrg: string }`
 */
function buildCommitUrl({ hash, repo, userOrOrg }) {
	return `https://github.com/${userOrOrg}/${repo}/commit/${hash}`;
}

/** @type {import("beachball").BeachballConfig} */
module.exports = {
	access: "public",
	branch: "main",
	changelog: {
		customRenderers: {
			// Original template: https://github.com/microsoft/beachball/blob/aefbc1ac37ee85961cc787133c827f1fd3925550/src/changelog/renderPackageChangelog.ts#L93
			renderEntry(entry) {
				if (entry.author === "beachball") {
					return `- ${entry.comment}`;
				}
				const shortCommitHash = entry.commit.substring(0, 7);
				const commitUrl = buildCommitUrl({
					hash: entry.commit,
					repo: "ts-nameof-proxy",
					userOrOrg: "p-toy-factory",
				});
				// Imitate GitHub's commit format https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls#commit-shas
				return `- ${entry.comment} ([${shortCommitHash}](${commitUrl}))`;
			},
		},
	},
};
