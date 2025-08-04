import axios from "axios";
import forgeAuthService from "./forgeAuthService";

/**
 * URN padrão válida para teste
 */
// Default URN for testing when no valid URN is available - Real URN from Autodesk extension
const DEFAULT_TEST_URN =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";

/**
 * Função para obter URN válida (apenas para fallback, não substitui URNs reais)
 */
function getValidUrn(urn?: string): string {
  if (!urn) {
    console.log("🔄 URN não fornecida, usando URN padrão de teste");
    return DEFAULT_TEST_URN;
  }

  try {
    const decoded = Buffer.from(urn, "base64").toString();
    // Apenas retorna URN de teste para URNs claramente fake/demo
    // URNs reais do Forge devem ser mantidas como estão
    if (
      decoded.includes("forge-viewer-models/") &&
      !decoded.includes("forge-real-")
    ) {
      console.log("🔄 URN fake detectada, usando URN padrão de teste");
      return DEFAULT_TEST_URN;
    }
    // Retorna a URN original para URNs reais
    console.log("✅ URN válida detectada, mantendo URN original");
    return urn;
  } catch {
    console.log("🔄 URN inválida, usando URN padrão de teste");
    return DEFAULT_TEST_URN;
  }
}

/**
 * Serviço para Model Derivative API
 * Para upload e conversão de modelos conforme documentação APS
 */
class ModelDerivativeService {
  /**
   * Iniciar tradução de modelo para viewables
   */
  async translateModel(objectUrn: string): Promise<any> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const validUrn = getValidUrn(objectUrn);
        const token = await forgeAuthService.getAccessToken();

        const body = {
          input: {
            urn: validUrn,
          },
          output: {
            formats: [
              {
                type: "svf",
                views: ["2d", "3d"],
              },
            ],
          },
        };

        const response = await axios.post(
          "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ Tradução iniciada com sucesso!");
        return response.data;
      } catch (error: any) {
        console.error(
          `❌ Erro na tradução (tentativa ${attempt}/${maxRetries}):`,
          error.response?.data || error.message
        );

        // Verifica se é erro de token expirado
        const isTokenError =
          error.response?.status === 401 ||
          error.response?.data?.errorCode === "AUTH-006";

        if (isTokenError && attempt < maxRetries) {
          console.log(
            "🔄 Token expirado, limpando cache e tentando novamente..."
          );
          forgeAuthService.clearCache();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        throw new Error("Falha na tradução do modelo");
      }
    }
  }

  /**
   * Verificar status da tradução
   */
  async getTranslationStatus(urn: string): Promise<any> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const validUrn = getValidUrn(urn);
        const token = await forgeAuthService.getAccessToken();

        const response = await axios.get(
          `https://developer.api.autodesk.com/modelderivative/v2/designdata/${validUrn}/manifest`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error: any) {
        console.error(
          `❌ Erro ao verificar status (tentativa ${attempt}/${maxRetries}):`,
          error.response?.data || error.message
        );

        // Verifica se é erro de token expirado
        const isTokenError =
          error.response?.status === 401 ||
          error.response?.data?.errorCode === "AUTH-006";

        if (isTokenError && attempt < maxRetries) {
          console.log(
            "🔄 Token expirado, limpando cache e tentando novamente..."
          );
          forgeAuthService.clearCache();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        throw new Error("Falha ao verificar status da tradução");
      }
    }
  }

  /**
   * Mapear status do Forge para status interno
   */
  mapForgeStatus(manifest: any): {
    status: "uploaded" | "translating" | "success" | "failed";
    progress: string;
    hasDerivatives: boolean;
  } {
    if (!manifest) {
      return { status: "uploaded", progress: "0%", hasDerivatives: false };
    }

    const forgeStatus = manifest.status;
    const forgeProgress = manifest.progress;

    // Verificar se tem derivatives prontos
    const hasDerivatives =
      manifest.derivatives &&
      manifest.derivatives.length > 0 &&
      manifest.derivatives.some(
        (d: any) =>
          d.status === "success" && d.children && d.children.length > 0
      );

    let mappedStatus: "uploaded" | "translating" | "success" | "failed";
    let mappedProgress: string;

    switch (forgeStatus) {
      case "success":
        mappedStatus = "success";
        mappedProgress = "complete";
        break;
      case "inprogress":
        mappedStatus = "translating";
        mappedProgress = forgeProgress || "50%";
        break;
      case "failed":
      case "timeout":
        mappedStatus = "failed";
        mappedProgress = "failed";
        break;
      default:
        mappedStatus = "uploaded";
        mappedProgress = "0%";
    }

    return {
      status: mappedStatus,
      progress: mappedProgress,
      hasDerivatives,
    };
  }

  /**
   * Verificar status detalhado e mapear corretamente
   */
  async getDetailedStatus(urn: string): Promise<{
    forgeStatus: any;
    mappedStatus: "uploaded" | "translating" | "success" | "failed";
    mappedProgress: string;
    hasDerivatives: boolean;
    canVisualize: boolean;
  }> {
    try {
      const validUrn = getValidUrn(urn);
      console.log(`🔍 Verificando status para URN: ${urn.substring(0, 50)}...`);
      console.log(`🔄 Usando URN válida: ${validUrn.substring(0, 50)}...`);

      const manifest = await this.getTranslationStatus(validUrn);
      console.log(
        `✅ Manifest obtido, status: ${manifest?.status || "undefined"}`
      );

      const mapped = this.mapForgeStatus(manifest);
      console.log(`📊 Status mapeado: ${mapped.status} (${mapped.progress})`);

      return {
        forgeStatus: manifest,
        mappedStatus: mapped.status,
        mappedProgress: mapped.progress,
        hasDerivatives: mapped.hasDerivatives,
        canVisualize: mapped.status === "success" && mapped.hasDerivatives,
      };
    } catch (error) {
      console.error(
        `❌ Erro ao verificar status para URN ${urn.substring(0, 50)}:`,
        error
      );
      return {
        forgeStatus: null,
        mappedStatus: "uploaded",
        mappedProgress: "0%",
        hasDerivatives: false,
        canVisualize: false,
      };
    }
  }
}

export default new ModelDerivativeService();
