import { separatedPathOf } from ".";
import { NameSelector } from "./types";

/**
 * @example
 * pathOf(student, (s) => s.name.firstName[0]); // "['name']['firstName']['0']"
 * pathOf<Student>((s) => s.name.firstName[0]); // "['name']['firstName']['0']"
 */
export function pathOf<T>(callback: NameSelector<T>): string;
export function pathOf<T>(obj: T, callback: NameSelector<T>): string;

export function pathOf<T>(
  arg1: T | NameSelector<T>,
  arg2?: NameSelector<T>
): string {
  const separatedPath = separatedPathOf(arg1, arg2);
  if (separatedPath.length === 0) {
    throw new Error("ts-nameof-proxy: No properties were read.");
  }
  return "['" + separatedPath.join("']['") + "']";
}
