import { nameOf as fieldName, pathStringsOf } from "ts-nameof-proxy";

import { extensionAliasMarker } from "./extension-alias.js";

type User = {
  id: string;
  profile: {
    name: string;
  };
};

function runtimeValueMustNotBeEvaluated(): User {
  throw new Error("RUNTIME_VALUE_MUST_NOT_BE_EVALUATED");
}

export const transformedValues = [
  fieldName<User>(runtimeValueMustNotBeEvaluated(), (user) => user.profile["name"]),
  pathStringsOf<User>(
    runtimeValueMustNotBeEvaluated(),
    (user) => (user.profile.name, user.id),
  ),
  extensionAliasMarker,
];
