import { AuthenticationClient, Scopes } from "@aps_sdk/authentication";
import { OssClient, Region, PolicyKey } from "@aps_sdk/oss";
import {
  ModelDerivativeClient,
  View,
  OutputType,
} from "@aps_sdk/model-derivative";
import * as path from "path";
import * as fs from "fs";

/**
 * 🚀 APS Official SDK Service
 * Usando os SDKs oficiais da Autodesk para evitar endpoints depreciados
 */
export class APSOfficialService {
  private authClient: AuthenticationClient;
  private ossClient: OssClient;
  private modelDerivativeClient: ModelDerivativeClient;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.FORGE_CLIENT_ID!;
    this.clientSecret = process.env.FORGE_CLIENT_SECRET!;

    if (!this.clientId || !this.clientSecret) {
      throw new Error("FORGE_CLIENT_ID e FORGE_CLIENT_SECRET são obrigatórios");
    }

    this.authClient = new AuthenticationClient();
    this.ossClient = new OssClient();
    this.modelDerivativeClient = new ModelDerivativeClient();

    console.log("🔧 Inicializando APSOfficialService com SDK oficial...");
  }

  /**
   * 🔑 Obter token interno com escopos de leitura/escrita
   */
  private async getInternalToken(): Promise<string> {
    console.log("🔑 Obtendo novo token via SDK oficial...");

    const credentials = await this.authClient.getTwoLeggedToken(
      this.clientId,
      this.clientSecret,
      [
        Scopes.DataRead,
        Scopes.DataCreate,
        Scopes.DataWrite,
        Scopes.BucketCreate,
        Scopes.BucketRead,
      ]
    );

    console.log(
      `✅ Token obtido com sucesso via SDK (expira em ${credentials.expires_in}s)`
    );
    return credentials.access_token;
  }

  /**
   * 🔑 Obter token do viewer
   */
  async getViewerToken() {
    const credentials = await this.authClient.getTwoLeggedToken(
      this.clientId,
      this.clientSecret,
      [Scopes.ViewablesRead]
    );
    return credentials;
  }

  /**
   * 📦 Garantir que o bucket existe
   */
  private async ensureBucketExists(bucketKey: string): Promise<void> {
    const accessToken = await this.getInternalToken();

    try {
      console.log(`🔍 Verificando se bucket existe: ${bucketKey}`);
      await this.ossClient.getBucketDetails(bucketKey, { accessToken });
      console.log(`✅ Bucket ${bucketKey} já existe`);
    } catch (err: any) {
      if (err.axiosError?.response?.status === 404) {
        console.log(`📦 Bucket ${bucketKey} não existe, criando...`);
        await this.ossClient.createBucket(
          Region.Us,
          {
            bucketKey: bucketKey,
            policyKey: PolicyKey.Persistent,
          },
          { accessToken }
        );
        console.log(`✅ Bucket criado com sucesso: ${bucketKey}`);
      } else {
        throw err;
      }
    }
  }

  /**
   * 📤 Upload de arquivo para bucket
   */
  async uploadFile(
    filePath: string,
    bucketKey: string,
    objectKey: string
  ): Promise<any> {
    console.log(`📤 Fazendo upload via SDK oficial: ${objectKey}`);

    await this.ensureBucketExists(bucketKey);
    const accessToken = await this.getInternalToken();

    const fileStats = fs.statSync(filePath);
    console.log(`   Tamanho: ${fileStats.size} bytes`);

    try {
      const obj = await this.ossClient.uploadObject(
        bucketKey,
        objectKey,
        filePath,
        { accessToken }
      );

      console.log(`✅ Upload realizado com sucesso: ${objectKey}`);
      return obj;
    } catch (error: any) {
      console.error(`❌ Erro no upload via SDK oficial:`, error.message);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  /**
   * 🔄 Iniciar tradução do modelo
   */
  async translateObject(urn: string, rootFilename?: string): Promise<any> {
    console.log(`🔄 Iniciando tradução via SDK oficial: ${urn}`);

    const accessToken = await this.getInternalToken();

    try {
      const job = await this.modelDerivativeClient.startJob(
        {
          input: {
            urn,
            compressedUrn: !!rootFilename,
            rootFilename,
          },
          output: {
            formats: [
              {
                views: [View._2d, View._3d],
                type: OutputType.Svf2,
              },
            ],
          },
        },
        { accessToken }
      );

      console.log(`✅ Tradução iniciada com sucesso`);
      return job.result;
    } catch (error: any) {
      console.error(`❌ Erro na tradução:`, error.message);
      throw new Error(`Falha na tradução: ${error.message}`);
    }
  }

  /**
   * 📋 Obter status da tradução
   */
  async getTranslationStatus(urn: string): Promise<any> {
    const accessToken = await this.getInternalToken();

    try {
      const manifest = await this.modelDerivativeClient.getManifest(urn, {
        accessToken,
      });
      return manifest;
    } catch (err: any) {
      if (err.axiosError?.response?.status === 404) {
        return null;
      } else {
        throw err;
      }
    }
  }

  /**
   * 🔗 Converter ID para URN (base64) - CORREÇÃO CRÍTICA
   */
  urnify(objectId: string): string {
    console.log(`🔍 DEBUG urnify - objectId original: ${objectId}`);

    // O objectId vem no formato: bucket/object
    // Precisamos adicionar o prefixo urn:adsk.objects:os.object:
    let fullId;
    if (objectId.startsWith("urn:")) {
      fullId = objectId;
    } else {
      fullId = `urn:adsk.objects:os.object:${objectId}`;
    }

    console.log(`🔍 DEBUG urnify - fullId com prefixo: ${fullId}`);

    const urn = Buffer.from(fullId).toString("base64").replace(/=/g, "");
    console.log(`🔍 DEBUG urnify - URN final: ${urn}`);

    return urn;
  }

  /**
   * 🚀 Pipeline completo: upload + tradução
   */
  async processFile(
    filePath: string,
    fileName: string
  ): Promise<{
    success: boolean;
    urn?: string;
    message: string;
    objectId?: string;
    bucketKey?: string;
    translationStatus?: any;
  }> {
    console.log(
      `🚀 Iniciando pipeline completo via SDK oficial para: ${fileName}`
    );

    try {
      // 1. Configurar nomes únicos com extensão maiúscula
      const timestamp = Date.now();
      const bucketKey = `forge-real-${timestamp}`;
      // Garantir que a extensão seja maiúscula .IFC (como modelo padrão)
      const normalizedFileName = fileName.replace(/\.ifc$/i, ".IFC");
      const objectKey = `ifc_${timestamp}_${normalizedFileName}`;

      // 2. Upload do arquivo
      const uploadResult = await this.uploadFile(
        filePath,
        bucketKey,
        objectKey
      );
      const urn = this.urnify(uploadResult.objectId);

      console.log(`🔗 URN gerada: ${urn}`);

      // 3. Iniciar tradução
      const translationResult = await this.translateObject(urn);

      console.log(`✅ Pipeline completo finalizado com sucesso`);

      return {
        success: true,
        urn,
        message: "Upload e tradução iniciados com sucesso via SDK oficial",
        objectId: uploadResult.objectId,
        bucketKey,
        translationStatus: translationResult,
      };
    } catch (error: any) {
      console.error(`❌ Erro no pipeline completo via SDK oficial:`, error);

      return {
        success: false,
        message: `Erro no processamento: ${error.message}`,
      };
    }
  }
}
