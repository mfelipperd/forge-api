import fs from "fs";
import path from "path";
import FormData from "form-data";
import forgeAuthService from "./forgeAuthService";

/**
 * Serviço para upload e processamento de arquivos IFC
 * Automatiza o processo de bucket + derivatives + URN
 */
class IFCProcessingService {
  private bucketKey: string;

  constructor() {
    // Usar bucket único baseado no client ID para evitar conflitos
    this.bucketKey = `forge-ifc-bucket-${process.env.FORGE_CLIENT_ID?.substring(
      0,
      8
    )}`.toLowerCase();
  }

  /**
   * Processa arquivo IFC completo: upload → bucket → translation → URN
   */
  async processIFCFile(
    filePath: string,
    fileName: string
  ): Promise<{
    success: boolean;
    urn?: string;
    objectId?: string;
    translationStatus?: string;
    error?: string;
  }> {
    try {
      console.log(`🚀 Iniciando processamento do arquivo: ${fileName}`);

      // 1. Garantir que o bucket existe
      await this.ensureBucketExists();

      // 2. Upload do arquivo para o bucket
      const uploadResult = await this.uploadFileToBucket(filePath, fileName);
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }

      console.log(
        `✅ Arquivo enviado para bucket. ObjectId: ${uploadResult.objectId}`
      );

      // 3. Iniciar tradução (derivatives)
      const translationResult = await this.startTranslation(
        uploadResult.objectId!
      );
      if (!translationResult.success) {
        return { success: false, error: translationResult.error };
      }

      console.log(`✅ Tradução iniciada. URN: ${translationResult.urn}`);

      return {
        success: true,
        urn: translationResult.urn,
        objectId: uploadResult.objectId,
        translationStatus: "inprogress",
      };
    } catch (error) {
      console.error("❌ Erro no processamento IFC:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido no processamento",
      };
    }
  }

  /**
   * Garantir que o bucket existe
   */
  private async ensureBucketExists(): Promise<void> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        console.log(
          `🔍 Verificação do bucket - Tentativa ${attempt}/${maxRetries}`
        );
        const token = await forgeAuthService.getAccessToken();
        console.log(
          `🔑 Token obtido (tipo: ${typeof token}):`,
          typeof token === "string" && token.length > 20
            ? `${token.substring(0, 20)}...`
            : token
        );

        // Verificar se bucket existe
        console.log(
          `📡 Fazendo requisição para: https://developer.api.autodesk.com/oss/v2/buckets/${this.bucketKey}/details`
        );

        // Validar tipo do token antes de usar
        if (typeof token !== "string") {
          throw new Error(
            `Token inválido: esperado string, recebido ${typeof token}`
          );
        }

        const checkResponse = await fetch(
          `https://developer.api.autodesk.com/oss/v2/buckets/${this.bucketKey}/details`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "User-Agent": "ForgeAPI-NodeJS/2.0",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        console.log(
          `🔍 Status da verificação do bucket: ${checkResponse.status}`
        );
        console.log(`🔍 Status Text: ${checkResponse.statusText}`);
        console.log(`🔍 Bucket Key usado: ${this.bucketKey}`);

        // Verificar se é erro de token
        if (checkResponse.status === 401) {
          const errorText = await checkResponse.text();
          console.log(`🚨 Erro 401 - Resposta: ${errorText}`);

          if (attempt < maxRetries) {
            console.log(
              `🔄 Token expirado na verificação do bucket, tentativa ${attempt}/${maxRetries}`
            );
            forgeAuthService.clearCache();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error("Token inválido após múltiplas tentativas");
        }

        if (checkResponse.status === 404) {
          // Bucket não existe, criar
          console.log(`📦 Criando bucket: ${this.bucketKey}`);

          // Validar tipo do token antes de usar
          if (typeof token !== "string") {
            throw new Error(
              `Token inválido: esperado string, recebido ${typeof token}`
            );
          }

          const createResponse = await fetch(
            "https://developer.api.autodesk.com/oss/v2/buckets",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "User-Agent": "ForgeAPI-NodeJS/2.0",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
              },
              body: JSON.stringify({
                bucketKey: this.bucketKey,
                policyKey: "transient", // Mudado para "transient" - mais compatível
              }),
            }
          );

          // Verificar se é erro de token na criação
          if (createResponse.status === 401) {
            if (attempt < maxRetries) {
              console.log(
                `🔄 Token expirado na criação do bucket, tentativa ${attempt}/${maxRetries}`
              );
              forgeAuthService.clearCache();
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }
            throw new Error(
              "Token inválido na criação do bucket após múltiplas tentativas"
            );
          }

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch (e) {
              errorData = { message: errorText };
            }

            // Se erro AUTH-006 e ainda temos tentativas
            if (errorData.errorCode === "AUTH-006" && attempt < maxRetries) {
              console.log(
                `🔄 AUTH-006 detectado, tentativa ${attempt}/${maxRetries}`
              );
              forgeAuthService.clearCache();
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }

            throw new Error(`Erro ao criar bucket: ${errorText}`);
          }

          console.log(`✅ Bucket criado: ${this.bucketKey}`);
          return;
        } else if (checkResponse.ok) {
          console.log(`✅ Bucket já existe: ${this.bucketKey}`);
          return;
        } else {
          const error = await checkResponse.text();
          throw new Error(`Erro ao verificar bucket: ${error}`);
        }
      } catch (error) {
        if (attempt >= maxRetries) {
          console.error(
            "❌ Erro ao garantir bucket após múltiplas tentativas:",
            error
          );
          throw error;
        }

        // Se é erro de rede ou outro erro, tentar novamente
        console.log(
          `⚠️ Erro na tentativa ${attempt}/${maxRetries}, tentando novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("Falha ao garantir bucket após múltiplas tentativas");
  }

  /**
   * Upload do arquivo para o bucket OSS
   */
  private async uploadFileToBucket(
    filePath: string,
    fileName: string
  ): Promise<{
    success: boolean;
    objectId?: string;
    error?: string;
  }> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        const token = await forgeAuthService.getAccessToken();

        // Validar tipo do token antes de usar
        if (typeof token !== "string") {
          throw new Error(
            `Token inválido: esperado string, recebido ${typeof token}`
          );
        }

        const fileBuffer = fs.readFileSync(filePath);

        // Gerar objectKey único
        const objectKey = `ifc_${Date.now()}_${fileName.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}`;

        console.log(
          `📤 Enviando arquivo para bucket: ${objectKey} (tentativa ${attempt})`
        );

        const response = await fetch(
          `https://developer.api.autodesk.com/oss/v2/buckets/${this.bucketKey}/objects/${objectKey}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/octet-stream",
              "User-Agent": "ForgeAPI-NodeJS/2.0",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            body: fileBuffer,
          }
        );

        if (!response.ok) {
          const error = await response.text();

          // Se erro de token e ainda temos tentativas, limpar cache e retry
          if (
            (response.status === 401 || error.includes("AUTH-006")) &&
            attempt < maxRetries
          ) {
            console.log(
              `🔄 Token expirou no upload, tentativa ${attempt}/${maxRetries}`
            );
            forgeAuthService.clearCache();
            continue;
          }

          return { success: false, error: `Erro no upload: ${error}` };
        }

        const result = await response.json();
        console.log(`✅ Upload concluído: ${result.objectId}`);

        return {
          success: true,
          objectId: result.objectId,
        };
      } catch (error) {
        console.error(`❌ Erro no upload (tentativa ${attempt}):`, error);

        if (attempt >= maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Erro no upload",
          };
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return { success: false, error: "Máximo de tentativas excedido" };
  }

  /**
   * Iniciar tradução (Model Derivative)
   */
  private async startTranslation(objectId: string): Promise<{
    success: boolean;
    urn?: string;
    error?: string;
  }> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        const token = await forgeAuthService.getAccessToken();

        // Validar tipo do token antes de usar
        if (typeof token !== "string") {
          throw new Error(
            `Token inválido: esperado string, recebido ${typeof token}`
          );
        }

        // Converter objectId para URN base64
        const urn = Buffer.from(objectId).toString("base64");

        console.log(
          `🔄 Iniciando tradução para URN: ${urn} (tentativa ${attempt})`
        );

        const response = await fetch(
          "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "User-Agent": "ForgeAPI-NodeJS/2.0",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            body: JSON.stringify({
              input: {
                urn: urn,
              },
              output: {
                formats: [
                  {
                    type: "svf2",
                    views: ["2d", "3d"],
                  },
                ],
              },
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();

          // Se erro de token e ainda temos tentativas, limpar cache e retry
          if (
            (response.status === 401 || error.includes("AUTH-006")) &&
            attempt < maxRetries
          ) {
            console.log(
              `🔄 Token expirou na tradução, tentativa ${attempt}/${maxRetries}`
            );
            forgeAuthService.clearCache();
            continue;
          }

          return { success: false, error: `Erro na tradução: ${error}` };
        }

        const result = await response.json();
        console.log(`✅ Tradução iniciada com sucesso`);

        return {
          success: true,
          urn: urn,
        };
      } catch (error) {
        console.error(`❌ Erro na tradução (tentativa ${attempt}):`, error);

        if (attempt >= maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Erro na tradução",
          };
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return { success: false, error: "Máximo de tentativas excedido" };
  }

  /**
   * Verificar status da tradução
   */
  async getTranslationStatus(urn: string): Promise<{
    status: string;
    progress: string;
    success: boolean;
    messages?: any[];
  }> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        const token = await forgeAuthService.getAccessToken();

        // Validar tipo do token antes de usar
        if (typeof token !== "string") {
          throw new Error(
            `Token inválido: esperado string, recebido ${typeof token}`
          );
        }

        const response = await fetch(
          `https://developer.api.autodesk.com/modelderivative/v2/designdata/${encodeURIComponent(
            urn
          )}/manifest`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Agent": "ForgeAPI-NodeJS/2.0",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (response.status === 401 && attempt < maxRetries) {
          console.log(
            `🔄 Token expirou na verificação de status, tentativa ${attempt}/${maxRetries}`
          );
          forgeAuthService.clearCache();
          continue;
        }

        if (!response.ok) {
          console.log(
            `⚠️ Status não disponível (${response.status}), assumindo em progresso`
          );
          return { status: "inprogress", progress: "0%", success: false };
        }

        const manifest = await response.json();

        return {
          status: manifest.status || "inprogress",
          progress: manifest.progress || "0%",
          success: manifest.status === "success",
          messages: manifest.derivatives,
        };
      } catch (error) {
        console.error(
          `❌ Erro ao verificar status (tentativa ${attempt}):`,
          error
        );

        if (attempt >= maxRetries) {
          return { status: "failed", progress: "0%", success: false };
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return { status: "failed", progress: "0%", success: false };
  }

  /**
   * Limpar arquivo temporário
   */
  cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Arquivo temporário removido: ${filePath}`);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao remover arquivo temporário: ${error}`);
    }
  }
}

export default new IFCProcessingService();
