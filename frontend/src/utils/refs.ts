export function refId(ref: string | { _id: string } | null | undefined) {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref._id;
}

export function isPopulated<T extends { _id: string }>(ref: string | T): ref is T {
  return typeof ref !== "string";
}
