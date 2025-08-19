import {
  AuthClientTwoLegged,
  BucketsApi,
  ObjectsApi,
  DerivativesApi,
} from "forge-apis";

/**
 * Serviço principal de interação com Forge SDK
 */
export class ForgeSDKService {
  private authClient: AuthClientTwoLegged;

  constructor() {
    if (!process.env.FORGE_CLIENT_ID || !process.env.FORGE_CLIENT_SECRET) {
      throw new Error(
        "FORGE_CLIENT_ID e FORGE_CLIENT_SECRET devem estar definidos"
      );
    }

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

    console.log("[Forge] Service inicializado com sucesso");
  }

  /**
   * Obter token de acesso
   */
  async getAccessToken(): Promise<string> {
    try {
      console.log("[Forge] Obtendo token...");
      const credentials = await this.authClient.authenticate();
      console.log("[Forge] Token obtido com sucesso");
      return credentials.access_token;
    } catch (error) {
      console.error("[Forge] Erro ao obter token:", error);
      throw error;
    }
  }

  /**
   * Verificar se bucket existe
   */
  private async checkBucketExists(bucketKey: string): Promise<boolean> {
    try {
      console.log("[Forge] Verificando bucket: " + bucketKey);
      const credentials = await this.authClient.authenticate();
      const bucketsApi = new BucketsApi();

      await bucketsApi.getBucketDetails(
        bucketKey,
        this.authClient,
        credentials
      );
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) return false;
      throw error;
    }
  }

  /**
   * Criar bucket no Forge
   */
  async createBucket(bucketKey: string): Promise<void> {
    try {
      // Verificar se bucket já existe
      const exists = await this.checkBucketExists(bucketKey);
      if (exists) {
        console.log("[Forge] Bucket " + bucketKey + " já existe");
        return;
      }

      console.log("[Forge] Criando bucket: " + bucketKey);
      const credentials = await this.authClient.authenticate();
      const bucketsApi = new BucketsApi();

      await bucketsApi.createBucket(
        { bucketKey, policyKey: "transient" },
        {},
        this.authClient,
        credentials
      );

      console.log("[Forge] Bucket criado com sucesso");
    } catch (error: any) {
      console.error("[Forge] Erro ao criar bucket:", error);
      throw error;
    }
  }

  /**
   * Upload de objeto para o Forge
   */
  async uploadObject(
    bucketKey: string,
    objectKey: string,
    fileData: Buffer
  ): Promise<{ objectId: string }> {
    try {
      console.log("[Forge] Iniciando upload do objeto: " + objectKey);
      const credentials = await this.authClient.authenticate();
      const objectsApi = new ObjectsApi();

      const response = await objectsApi.uploadObject(
        bucketKey,
        objectKey,
        fileData.length,
        fileData,
        {},
        this.authClient,
        credentials
      );

      console.log("[Forge] Upload concluído com sucesso");
      return { objectId: response.body.objectId };
    } catch (error: any) {
      console.error("[Forge] Erro no upload:", error);
      throw error;
    }
  }

  /**
   * Iniciar tradução do objeto
   */
  async translateObject(objectId: string): Promise<{ urn: string }> {
    try {
      const urn = Buffer.from(objectId).toString("base64");
      console.log("[Forge] Iniciando tradução, URN: " + urn);

      const credentials = await this.authClient.authenticate();
      const derivativesApi = new DerivativesApi();

      await derivativesApi.translate(
        {
          input: { urn },
          output: { formats: [{ type: "svf", views: ["2d", "3d"] }] },
        },
        {},
        this.authClient,
        credentials
      );

      console.log("[Forge] Tradução iniciada com sucesso");
      return { urn };
    } catch (error: any) {
      console.error("[Forge] Erro na tradução:", error);
      throw error;
    }
  }

  /**
   * Obter status da tradução
   */
  async getTranslationStatus(urn: string): Promise<any> {
    try {
      console.log("[Forge] Verificando status da tradução: " + urn);
      const credentials = await this.authClient.authenticate();
      const derivativesApi = new DerivativesApi();

      const response = await derivativesApi.getManifest(
        urn,
        {},
        this.authClient,
        credentials
      );

      console.log("[Forge] Status obtido com sucesso");
      return response.body;
    } catch (error: any) {
      console.error("[Forge] Erro ao verificar status:", error);
      throw error;
    }
  }

  /**
   * Pipeline completo: upload + tradução
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
      console.log("[Forge] Iniciando pipeline para " + fileName);

      // 1. Criar bucket (se não existir)
      await this.createBucket(bucketKey);

      // 2. Upload do arquivo
      const objectKey =
        "ifc_" + Date.now() + "_" + fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uploadResult = await this.uploadObject(
        bucketKey,
        objectKey,
        fileBuffer
      );

      // 3. Iniciar tradução
      const translationResult = await this.translateObject(
        uploadResult.objectId
      );

      console.log("[Forge] Pipeline concluído com sucesso");

      return {
        success: true,
        urn: translationResult.urn,
        objectId: uploadResult.objectId,
      };
    } catch (error: any) {
      console.error("[Forge] Erro no pipeline:", error);
      return {
        success: false,
        error: error.message || "Erro desconhecido",
      };
    }
  }
}

// Exportar instância única
export default new ForgeSDKService();
