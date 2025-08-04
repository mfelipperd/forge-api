import axios, { AxiosInstance } from "axios";

/**
 * Serviço usando a nova API da Autodesk Platform Services (APS)
 * Resolve problemas de endpoints deprecados usando requests HTTP diretos
 */
class APSService {
  private httpClient: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    console.log("🔧 Inicializando APSService com nova API da APS...");

    if (!process.env.FORGE_CLIENT_ID || !process.env.FORGE_CLIENT_SECRET) {
      throw new Error(
        "FORGE_CLIENT_ID e FORGE_CLIENT_SECRET devem estar definidos"
      );
    }

    // Cliente HTTP para APS
    this.httpClient = axios.create({
      baseURL: "https://developer.api.autodesk.com",
      timeout: 60000,
    });

    console.log("✅ APSService inicializado com sucesso");
  }

  /**
   * Obter token de acesso com refresh automático
   */
  async getAccessToken(): Promise<string> {
    try {
      // Verificar se token ainda é válido
      if (
        this.accessToken &&
        this.tokenExpiry &&
        new Date() < this.tokenExpiry
      ) {
        return this.accessToken!;
      }

      console.log("🔑 Obtendo novo token via APS Authentication API...");

      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      params.append("client_id", process.env.FORGE_CLIENT_ID!);
      params.append("client_secret", process.env.FORGE_CLIENT_SECRET!);
      params.append(
        "scope",
        "data:read data:write data:create bucket:create bucket:read viewables:read"
      );

      const response = await axios.post(
        "https://developer.api.autodesk.com/authentication/v2/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token expira em 3600 segundos (1 hora), renovar 5 min antes
      this.tokenExpiry = new Date(
        Date.now() + (response.data.expires_in - 300) * 1000
      );

      console.log(
        `✅ Token obtido com sucesso via APS (expira em ${response.data.expires_in}s)`
      );
      return this.accessToken!;
    } catch (error: any) {
      console.error(
        "❌ Erro ao obter token via APS:",
        error.response?.data || error.message
      );
      throw new Error(
        `Falha na autenticação APS: ${error.message || "Erro desconhecido"}`
      );
    }
  }

  /**
   * Verificar se bucket existe
   */
  async checkBucketExists(bucketKey: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      await this.httpClient.get(`/oss/v2/buckets/${bucketKey}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Criar bucket
   */
  async createBucket(bucketKey: string): Promise<any> {
    try {
      console.log(`📦 Criando bucket via APS OSS API: ${bucketKey}`);
      const token = await this.getAccessToken();

      const response = await this.httpClient.post(
        "/oss/v2/buckets",
        {
          bucketKey: bucketKey,
          policyKey: "temporary", // 24 horas
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Bucket criado com sucesso via APS: ${bucketKey}`);
      return response.data;
    } catch (error: any) {
      // Se bucket já existe, não é erro
      if (error.response?.status === 409) {
        console.log(`⚠️ Bucket ${bucketKey} já existe (409 - não é erro)`);
        return { bucketKey: bucketKey, message: "Bucket já existe" };
      }

      console.error(
        "❌ Erro ao criar bucket via APS:",
        error.response?.data || error.message
      );
      throw new Error(
        `Falha ao criar bucket: ${error.message || "Erro desconhecido"}`
      );
    }
  }

  /**
   * Garantir que bucket existe (criar se não existir)
   */
  async ensureBucketExists(bucketKey: string): Promise<void> {
    try {
      const exists = await this.checkBucketExists(bucketKey);

      if (!exists) {
        await this.createBucket(bucketKey);
      }

      console.log(`✅ Bucket ${bucketKey} está disponível`);
    } catch (error) {
      console.error(`❌ Erro ao garantir bucket ${bucketKey}:`, error);
      throw error;
    }
  }

  /**
   * Upload de arquivo para bucket
   */
  async uploadFile(
    bucketKey: string,
    objectName: string,
    fileBuffer: Buffer
  ): Promise<any> {
    try {
      console.log(
        `📤 Fazendo upload via APS OSS: ${objectName} (${fileBuffer.length} bytes)`
      );
      const token = await this.getAccessToken();

      const response = await this.httpClient.put(
        `/oss/v2/buckets/${bucketKey}/objects/${objectName}`,
        fileBuffer,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/octet-stream",
            "Content-Length": fileBuffer.length.toString(),
          },
        }
      );

      console.log(`✅ Upload concluído via APS: ${response.data.objectId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Erro no upload via APS:",
        error.response?.data || error.message
      );
      throw new Error(
        `Falha no upload: ${error.message || "Erro desconhecido"}`
      );
    }
  }

  /**
   * Iniciar tradução (Model Derivative)
   */
  async startTranslation(urn: string): Promise<any> {
    try {
      console.log(
        `🔄 Iniciando tradução via APS Model Derivative para URN: ${urn}`
      );
      const token = await this.getAccessToken();

      const response = await this.httpClient.post(
        "/modelderivative/v2/designdata/job",
        {
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Tradução iniciada com sucesso via APS Model Derivative");
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Erro na tradução via APS:",
        error.response?.data || error.message
      );
      throw new Error(
        `Falha na tradução: ${error.message || "Erro desconhecido"}`
      );
    }
  }

  /**
   * Verificar status da tradução
   */
  async getTranslationStatus(urn: string): Promise<any> {
    try {
      console.log(`🔍 Verificando status da tradução via APS: ${urn}`);
      const token = await this.getAccessToken();

      const response = await this.httpClient.get(
        `/modelderivative/v2/designdata/${urn}/manifest`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`📊 Status da tradução: ${response.data.status}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Erro ao verificar status via APS:",
        error.response?.data || error.message
      );
      throw new Error(
        `Falha ao verificar status: ${error.message || "Erro desconhecido"}`
      );
    }
  }

  /**
   * Testar URN diretamente - método auxiliar para debug
   */
  async testUrn(urn: string): Promise<any> {
    try {
      console.log(`🧪 TESTE DIRETO DO URN: ${urn}`);
      const token = await this.getAccessToken();

      const manifestUrl = `/modelderivative/v2/designdata/${urn}/manifest`;
      console.log(
        `🧪 URL completa: https://developer.api.autodesk.com${manifestUrl}`
      );

      const response = await this.httpClient.get(manifestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`✅ TESTE URN SUCESSO! Status: ${response.data.status}`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ TESTE URN FALHOU:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * Pipeline completo: garantir bucket + upload + tradução
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
      console.log(`🚀 Iniciando pipeline completo via APS para: ${fileName}`);

      // 1. Garantir bucket
      await this.ensureBucketExists(bucketKey);

      // 2. Upload do arquivo
      const objectKey = `ifc_${Date.now()}_${fileName
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .replace(/\.ifc$/i, ".IFC")}`; // Garantir extensão maiúscula
      const uploadResult = await this.uploadFile(
        bucketKey,
        objectKey,
        fileBuffer
      );

      // 3. Converter objectId para URN (base64 encode) - CORREÇÃO CRÍTICA
      const rawId = uploadResult.objectId;
      console.log(`🔍 DEBUG - rawId do upload: ${rawId}`);

      // O objectId já vem no formato bucket/object, não precisamos adicionar prefixo
      let fullObjectId;
      if (rawId.startsWith("urn:")) {
        fullObjectId = rawId;
      } else {
        // Se não tem o prefixo urn:, adicionar
        fullObjectId = `urn:adsk.objects:os.object:${rawId}`;
      }

      console.log(`🔍 DEBUG - fullObjectId: ${fullObjectId}`);

      // Verificar se está no formato correto (bucket/object)
      if (!fullObjectId.includes("/")) {
        console.log(
          `⚠️ WARNING: URN pode estar malformada - não contém '/' para separar bucket/object`
        );
      }

      // Remover padding '=' para viewer
      const urn = Buffer.from(fullObjectId)
        .toString("base64")
        .replace(/=/g, "");
      console.log(`🔍 DEBUG - URN final (Base64 sem padding): ${urn}`);
      console.log(
        `🔍 DEBUG - URL do manifesto seria: https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/manifest`
      );

      // 4. Iniciar tradução
      await this.startTranslation(urn);

      console.log(`🎉 Pipeline completo via APS concluído! URN: ${urn}`);

      return {
        success: true,
        urn: urn,
        objectId: uploadResult.objectId,
      };
    } catch (error) {
      console.error("❌ Erro no pipeline completo via APS:", error);
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

export default new APSService();
