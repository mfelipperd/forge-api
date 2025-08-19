import { isValidUrn } from "./urnValidator";

// URN padrão válida para teste (modelo que sabemos que funciona)
const DEFAULT_TEST_URN =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";

export function getValidUrn(urn?: string): string {
  if (!urn) {
    return DEFAULT_TEST_URN;
  }

  try {
    const decoded = Buffer.from(urn, "base64").toString();

    if (
      decoded.includes("forge-viewer-models/") &&
      !decoded.match(/\.(ifc|IFC)$/)
    ) {
      return DEFAULT_TEST_URN;
    }

    return urn;
  } catch {
    return DEFAULT_TEST_URN;
  }
}
