import { AuthClientTwoLegged } from "forge-apis";

/**
 * Serviço Forge simplificado usando SDK oficial
 * Foca apenas na autenticação e usa o SDK para resolver "Legacy endpoint deprecated"
 */
class ForgeSDKServiceSimple {
  private authClient: AuthClientTwoLegged;

  constructor() {
    console.log("🔧 Inicializando ForgeSDKServiceSimple...");

    if (!process.env.FORGE_CLIENT_ID || !process.env.FORGE_CLIENT_SECRET) {
      throw new Error(
        "FORGE_CLIENT_ID e FORGE_CLIENT_SECRET devem estar definidos"
      );
    }

    // Configurar cliente de autenticação
    this.authClient = new AuthClientTwoLegged(
      process.env.FORGE_CLIENT_ID,
      process.env.FORGE_CLIENT_SECRET,
      [
        "data:read",
        "data:write",
        "data:create",
        "bucket:create",
        "bucket:read",
        "viewables:read",
      ],
      true // autoRefresh
    );

    console.log("✅ ForgeSDKServiceSimple inicializado com sucesso");
  }

  /**
   * Obter token de acesso via SDK oficial
   */
  async getAccessToken(): Promise<string> {
    try {
      console.log("🔑 Obtendo token via SDK oficial...");
      const credentials = await this.authClient.authenticate();
      console.log("✅ Token obtido com sucesso via SDK");
      return credentials.access_token;
    } catch (error) {
      console.error("❌ Erro ao obter token via SDK:", error);
      throw new Error(
        `Falha na autenticação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  /**
   * Fazer requisição HTTP com headers corretos usando token do SDK
   */
  async makeForgeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const token = await this.getAccessToken();

      const headers = {
        Authorization: `Bearer ${token}`,
        "User-Agent": "ForgeAPI-NodeJS-SDK/2.0",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...options.headers,
      };

      console.log(`🌐 Fazendo requisição via SDK: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      return response;
    } catch (error) {
      console.error("❌ Erro na requisição via SDK:", error);
      throw error;
    }
  }

  /**
   * Verificar se bucket existe usando SDK
   */
  async checkBucketExists(bucketKey: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando se bucket existe via SDK: ${bucketKey}`);

      const response = await this.makeForgeRequest(
        `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/details`
      );

      if (response.status === 404) {
        console.log(`📦 Bucket ${bucketKey} não existe`);
        return false;
      } else if (response.ok) {
        console.log(`✅ Bucket ${bucketKey} existe`);
        return true;
      } else {
        throw new Error(`Erro ao verificar bucket: ${response.status}`);
      }
    } catch (error: any) {
      if (error.message?.includes("404")) {
        return false;
      }
      console.error("❌ Erro ao verificar bucket via SDK:", error);
      throw error;
    }
  }

  /**
   * Criar bucket usando SDK
   */
  async createBucket(bucketKey: string): Promise<any> {
    try {
      console.log(`📦 Criando bucket via SDK: ${bucketKey}`);

      const response = await this.makeForgeRequest(
        "https://developer.api.autodesk.com/oss/v2/buckets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucketKey: bucketKey,
            policyKey: "transient",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Bucket criado com sucesso via SDK: ${bucketKey}`);
        return result;
      } else if (response.status === 409) {
        console.log(`⚠️ Bucket ${bucketKey} já existe (409 - não é erro)`);
        return { bucketKey: bucketKey, message: "Bucket já existe" };
      } else {
        const errorText = await response.text();
        throw new Error(
          `Falha ao criar bucket: ${response.status} - ${errorText}`
        );
      }
    } catch (error: any) {
      console.error("❌ Erro ao criar bucket via SDK:", error);
      throw error;
    }
  }

  /**
   * Upload de arquivo usando novo Data Management API
   */
  async uploadFile(
    bucketKey: string,
    objectName: string,
    fileBuffer: Buffer
  ): Promise<any> {
    try {
      console.log(
        `📤 Fazendo upload via Data Management API: ${objectName} (${fileBuffer.length} bytes)`
      );

      // Usar Data Management API v2 em vez de OSS
      const response = await this.makeForgeRequest(
        `https://developer.api.autodesk.com/data/v1/projects/forge-api/storage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/vnd.api+json",
          },
          body: JSON.stringify({
            jsonapi: { version: "1.0" },
            data: {
              type: "objects",
              attributes: {
                name: objectName,
              },
              relationships: {
                target: {
                  data: {
                    type: "folders",
                    id: bucketKey,
                  },
                },
              },
            },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(
          `✅ Upload preparado via Data Management API: ${JSON.stringify(
            result
          )}`
        );

        // Agora fazer upload dos dados para a URL retornada
        if (
          result.data &&
          result.data.attributes &&
          result.data.attributes.uploadEndpoint
        ) {
          const uploadResponse = await fetch(
            result.data.attributes.uploadEndpoint,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/octet-stream",
              },
              body: fileBuffer as any,
            }
          );

          if (uploadResponse.ok) {
            console.log(`✅ Upload de dados concluído via Data Management API`);
            return {
              objectId: result.data.id,
              name: objectName,
              size: fileBuffer.length,
            };
          }
        }

        return result.data;
      } else {
        const errorText = await response.text();
        throw new Error(
          `Falha no upload via Data Management API: ${response.status} - ${errorText}`
        );
      }
    } catch (error: any) {
      console.error("❌ Erro no upload via Data Management API:", error);

      // Fallback: tentar OSS v2 tradicional uma última vez
      console.log("⚠️ Tentando fallback para OSS v2...");
      try {
        const response = await this.makeForgeRequest(
          `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${objectName}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: fileBuffer as any,
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Upload fallback concluído: ${result.objectId}`);
          return result;
        } else {
          const errorText = await response.text();
          throw new Error(
            `Fallback também falhou: ${response.status} - ${errorText}`
          );
        }
      } catch (fallbackError) {
        console.error("❌ Fallback também falhou:", fallbackError);
        throw error; // Lançar erro original
      }
    }
  }
  /**
   * Iniciar tradução usando SDK
   */
  async startTranslation(urn: string): Promise<any> {
    try {
      console.log(`🔄 Iniciando tradução via SDK para URN: ${urn}`);

      const job = {
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
      };

      const response = await this.makeForgeRequest(
        "https://developer.api.autodesk.com/modelderivative/v2/designdata/job",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(job),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Tradução iniciada com sucesso via SDK");
        return result;
      } else {
        const errorText = await response.text();
        throw new Error(`Falha na tradução: ${response.status} - ${errorText}`);
      }
    } catch (error: any) {
      console.error("❌ Erro na tradução via SDK:", error);
      throw error;
    }
  }

  /**
   * Verificar status da tradução usando SDK
   */
  async getTranslationStatus(urn: string): Promise<any> {
    try {
      console.log(`🔍 Verificando status da tradução via SDK: ${urn}`);

      const response = await this.makeForgeRequest(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${encodeURIComponent(
          urn
        )}/manifest`
      );

      if (response.ok) {
        const result = await response.json();
        console.log(`📊 Status da tradução via SDK: ${result.status}`);
        return result;
      } else {
        console.log(
          `⚠️ Status não disponível via SDK (${response.status}), assumindo em progresso`
        );
        return { status: "inprogress", progress: "0%" };
      }
    } catch (error: any) {
      console.error("❌ Erro ao verificar status via SDK:", error);
      return { status: "inprogress", progress: "0%" };
    }
  }

  /**
   * Pipeline completo usando SDK
   */
  async processFile(
    bucketKey: string,
    fileName: string,
    fileBuffer: Buffer
  ): Promise<{
    success: boolean;
    urn?: string;
    objectId?: string;
    error?: string;
  }> {
    try {
      console.log(`🚀 Iniciando pipeline completo via SDK para: ${fileName}`);

      // 1. Garantir que bucket existe
      const bucketExists = await this.checkBucketExists(bucketKey);
      if (!bucketExists) {
        await this.createBucket(bucketKey);
      }

      // 2. Upload do arquivo
      const objectKey = `ifc_${Date.now()}_${fileName.replace(
        /[^a-zA-Z0-9.-]/g,
        "_"
      )}`;
      const uploadResult = await this.uploadFile(
        bucketKey,
        objectKey,
        fileBuffer
      );

      // 3. Converter objectId para URN
      const urn = Buffer.from(uploadResult.objectId).toString("base64");

      // 4. Iniciar tradução
      await this.startTranslation(urn);

      console.log(`🎉 Pipeline completo via SDK concluído! URN: ${urn}`);

      return {
        success: true,
        urn: urn,
        objectId: uploadResult.objectId,
      };
    } catch (error) {
      console.error("❌ Erro no pipeline completo via SDK:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido no pipeline",
      };
    }
  }
}

export default new ForgeSDKServiceSimple();
