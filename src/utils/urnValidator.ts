/**
 * Função para validar formato básico de URN
 */
export function isValidUrn(urn: string): boolean {
  try {
    if (!urn || typeof urn !== "string") return false;

    // Verificar se é base64
    const decoded = Buffer.from(urn, "base64").toString("utf8");

    // Verificar se contém estrutura básica de URN do Forge
    return (
      decoded.includes("urn:adsk.objects:os.object:") ||
      decoded.includes("urn:adsk.viewing:") ||
      decoded.includes("urn:")
    );
  } catch {
    return false;
  }
}
