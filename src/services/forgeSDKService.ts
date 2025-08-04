import {
  AuthClientTwoLegged,
  BucketsApi,
  ObjectsApi,
  DerivativesApi,
} from "forge-apis";

/**
 * Serviço Forge usando SDK oficial da Autodesk
 * Resolve problemas de "Legacy endpoint deprecated" e outros issues de compatibilidade
 */
class ForgeSDKService {
  private authClient: AuthClientTwoLegged;

  constructor() {
    console.log("🔧 Inicializando ForgeSDKService com SDK oficial...");

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

    console.log("✅ ForgeSDKService inicializado com sucesso");
  }

  /**
   * Obter token de acesso
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
   * Verificar se bucket existe
   */
  async checkBucketExists(bucketKey: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando se bucket existe: ${bucketKey}`);
      const credentials = await this.authClient.authenticate();
      const bucketsApi = new BucketsApi();

      await bucketsApi.getBucketDetails(
        bucketKey,
        this.authClient,
        credentials
      );

      console.log(`✅ Bucket ${bucketKey} existe`);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log(`📦 Bucket ${bucketKey} não existe`);
        return false;
      }
      console.error("❌ Erro ao verificar bucket:", error);
      throw error;
    }
  }

  /**
   * Criar bucket
   */
  async createBucket(bucketKey: string): Promise<any> {
    try {
      console.log(`📦 Criando bucket via SDK: ${bucketKey}`);
      const credentials = await this.authClient.authenticate();
      const bucketsApi = new BucketsApi();

      const bucketPayload = {
        bucketKey: bucketKey,
        policyKey: "transient",
      };

      const result = await bucketsApi.createBucket(
        bucketPayload,
        {},
        this.authClient,
        credentials
      );

      console.log(`✅ Bucket criado com sucesso via SDK: ${bucketKey}`);
      return result.body;
    } catch (error: any) {
      // Se bucket já existe, não é erro
      if (error.statusCode === 409) {
        console.log(`⚠️ Bucket ${bucketKey} já existe (409 - não é erro)`);
        return { bucketKey: bucketKey, message: "Bucket já existe" };
      }

      console.error("❌ Erro ao criar bucket via SDK:", error);
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
        `📤 Fazendo upload via SDK: ${objectName} (${fileBuffer.length} bytes)`
      );
      const credentials = await this.authClient.authenticate();
      const objectsApi = new ObjectsApi();

      const result = await objectsApi.uploadObject(
        bucketKey,
        objectName,
        fileBuffer.length,
        fileBuffer,
        {},
        this.authClient,
        credentials
      );

      console.log(`✅ Upload concluído via SDK: ${result.body.objectId}`);
      return result.body;
    } catch (error: any) {
      console.error("❌ Erro no upload via SDK:", error);
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
      console.log(`🔄 Iniciando tradução via SDK para URN: ${urn}`);
      const credentials = await this.authClient.authenticate();
      const derivativesApi = new DerivativesApi();

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

      const result = await derivativesApi.translate(
        job,
        {},
        this.authClient,
        credentials
      );

      console.log("✅ Tradução iniciada com sucesso via SDK");
      return result.body;
    } catch (error: any) {
      console.error("❌ Erro na tradução via SDK:", error);
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
      console.log(`🔍 Verificando status da tradução via SDK: ${urn}`);
      const credentials = await this.authClient.authenticate();
      const derivativesApi = new DerivativesApi();

      const result = await derivativesApi.getManifest(
        urn,
        {},
        this.authClient,
        credentials
      );

      console.log(`📊 Status da tradução: ${result.body.status}`);
      return result.body;
    } catch (error: any) {
      console.error("❌ Erro ao verificar status via SDK:", error);
      throw new Error(
        `Falha ao verificar status: ${error.message || "Erro desconhecido"}`
      );
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
      console.log(`🚀 Iniciando pipeline completo via SDK para: ${fileName}`);

      // 1. Garantir bucket
      await this.ensureBucketExists(bucketKey);

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

export default new ForgeSDKService();
