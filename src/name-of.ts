import { separatedPathOf } from ".";
import { NameSelector } from "./types";

/**
 * @example
 * nameOf(student, (s) => s.age);         // "age"
 * nameOf(student, (s) => s.name.length); // "length"
 * nameOf<Student>((s) => s.name.length); // "length"
 */
export function nameOf<T>(callback: NameSelector<T>): string;
export function nameOf<T>(obj: T, callback: NameSelector<T>): string;

export function nameOf<T>(
  arg1: T | NameSelector<T>,
  arg2?: NameSelector<T>
): string {
  const separatedPath = separatedPathOf(arg1, arg2);
  if (separatedPath.length === 0) {
    throw new Error("ts-nameof-proxy: No properties were read.");
  }
  return separatedPath.pop() as string;
}
