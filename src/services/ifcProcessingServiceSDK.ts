import fs from "fs";
import path from "path";
import forgeSDKService from "./forgeSDKServiceSimple";

/**
 * Serviço para upload e processamento de arquivos IFC usando SDK oficial
 * Resolve problemas de "Legacy endpoint deprecated"
 */
class IFCProcessingServiceSDK {
  private bucketKey: string;

  constructor() {
    // Usar bucket único baseado no client ID para evitar conflitos
    this.bucketKey = `forge-ifc-bucket-${process.env.FORGE_CLIENT_ID?.substring(
      0,
      8
    )}`.toLowerCase();

    console.log(
      `🔧 IFCProcessingServiceSDK inicializado com bucket: ${this.bucketKey}`
    );
  }

  /**
   * Processa arquivo IFC completo usando SDK oficial: upload → bucket → translation → URN
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
      console.log(`🚀 Iniciando processamento IFC via SDK: ${fileName}`);

      // Ler arquivo
      const fileBuffer = fs.readFileSync(filePath);
      console.log(`📁 Arquivo lido: ${fileBuffer.length} bytes`);

      // Usar o pipeline completo do SDK
      const result = await forgeSDKService.processFile(
        this.bucketKey,
        fileName,
        fileBuffer
      );

      if (result.success) {
        console.log(`🎉 Processamento IFC via SDK concluído com sucesso!`);
        console.log(`   📦 URN: ${result.urn}`);
        console.log(`   🔗 ObjectId: ${result.objectId}`);

        return {
          success: true,
          urn: result.urn,
          objectId: result.objectId,
          translationStatus: "inprogress",
        };
      } else {
        console.error(`❌ Erro no processamento IFC via SDK: ${result.error}`);
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      console.error("❌ Erro no processamento IFC via SDK:", error);
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
   * Verificar status da tradução usando SDK
   */
  async getTranslationStatus(urn: string): Promise<{
    status: string;
    progress: string;
    success: boolean;
    messages?: any[];
  }> {
    try {
      console.log(`🔍 Verificando status da tradução via SDK: ${urn}`);

      const manifest = await forgeSDKService.getTranslationStatus(urn);

      return {
        status: manifest.status || "inprogress",
        progress: manifest.progress || "0%",
        success: manifest.status === "success",
        messages: manifest.derivatives,
      };
    } catch (error) {
      console.error("❌ Erro ao verificar status via SDK:", error);

      // Se não conseguir verificar, assume que está em progresso
      return {
        status: "inprogress",
        progress: "0%",
        success: false,
      };
    }
  }

  /**
   * Obter token usando SDK (para compatibilidade)
   */
  async getAccessToken(): Promise<string> {
    try {
      return await forgeSDKService.getAccessToken();
    } catch (error) {
      console.error("❌ Erro ao obter token via SDK:", error);
      throw error;
    }
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

  /**
   * Processar múltiplos arquivos IFC
   */
  async processMultipleIFCFiles(
    files: Array<{ filePath: string; fileName: string }>
  ): Promise<
    Array<{
      fileName: string;
      success: boolean;
      urn?: string;
      objectId?: string;
      error?: string;
    }>
  > {
    const results = [];

    for (const file of files) {
      console.log(`🔄 Processando arquivo ${file.fileName}...`);

      try {
        const result = await this.processIFCFile(file.filePath, file.fileName);
        results.push({
          fileName: file.fileName,
          success: result.success,
          urn: result.urn,
          objectId: result.objectId,
          error: result.error,
        });
      } catch (error) {
        results.push({
          fileName: file.fileName,
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return results;
  }

  /**
   * Listar arquivos no bucket
   */
  async listBucketObjects(): Promise<any[]> {
    try {
      console.log(`📋 Listando objetos no bucket: ${this.bucketKey}`);

      // Note: forge-apis SDK não tem método direto para listar objetos
      // Usaremos a API REST quando necessário
      console.log(
        "⚠️ Listagem de objetos não implementada no SDK - use API REST se necessário"
      );
      return [];
    } catch (error) {
      console.error("❌ Erro ao listar objetos do bucket:", error);
      return [];
    }
  }
}

export default new IFCProcessingServiceSDK();
