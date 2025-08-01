import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import forgeAuthService from './forgeAuthService';

/**
 * Serviço para upload e processamento de arquivos IFC
 * Automatiza o processo de bucket + derivatives + URN
 */
class IFCProcessingService {
  private bucketKey: string;

  constructor() {
    // Usar bucket único baseado no client ID para evitar conflitos
    this.bucketKey = `forge-ifc-bucket-${process.env.FORGE_CLIENT_ID?.substring(0, 8)}`.toLowerCase();
  }

  /**
   * Processa arquivo IFC completo: upload → bucket → translation → URN
   */
  async processIFCFile(filePath: string, fileName: string): Promise<{
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

      console.log(`✅ Arquivo enviado para bucket. ObjectId: ${uploadResult.objectId}`);

      // 3. Iniciar tradução (derivatives)
      const translationResult = await this.startTranslation(uploadResult.objectId!);
      if (!translationResult.success) {
        return { success: false, error: translationResult.error };
      }

      console.log(`✅ Tradução iniciada. URN: ${translationResult.urn}`);

      return {
        success: true,
        urn: translationResult.urn,
        objectId: uploadResult.objectId,
        translationStatus: 'inprogress'
      };

    } catch (error) {
      console.error('❌ Erro no processamento IFC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no processamento'
      };
    }
  }

  /**
   * Garantir que o bucket existe
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      const token = await forgeAuthService.getAccessToken();
      
      // Verificar se bucket existe
      const checkResponse = await fetch(
        `https://developer.api.autodesk.com/oss/v2/buckets/${this.bucketKey}/details`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (checkResponse.status === 404) {
        // Bucket não existe, criar
        console.log(`📦 Criando bucket: ${this.bucketKey}`);
        
        const createResponse = await fetch(
          'https://developer.api.autodesk.com/oss/v2/buckets',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              bucketKey: this.bucketKey,
              policyKey: 'temporary' // 24h retention
            })
          }
        );

        if (!createResponse.ok) {
          const error = await createResponse.text();
          throw new Error(`Erro ao criar bucket: ${error}`);
        }

        console.log(`✅ Bucket criado: ${this.bucketKey}`);
      } else if (checkResponse.ok) {
        console.log(`✅ Bucket já existe: ${this.bucketKey}`);
      } else {
        const error = await checkResponse.text();
        throw new Error(`Erro ao verificar bucket: ${error}`);
      }

    } catch (error) {
      console.error('❌ Erro ao garantir bucket:', error);
      throw error;
    }
  }

  /**
   * Upload do arquivo para o bucket OSS
   */
  private async uploadFileToBucket(filePath: string, fileName: string): Promise<{
    success: boolean;
    objectId?: string;
    error?: string;
  }> {
    try {
      const token = await forgeAuthService.getAccessToken();
      const fileBuffer = fs.readFileSync(filePath);
      
      // Gerar objectKey único
      const objectKey = `ifc_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log(`📤 Enviando arquivo para bucket: ${objectKey}`);

      const response = await fetch(
        `https://developer.api.autodesk.com/oss/v2/buckets/${this.bucketKey}/objects/${objectKey}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileBuffer.length.toString()
          },
          body: fileBuffer
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Erro no upload: ${error}` };
      }

      const result = await response.json();
      return { 
        success: true, 
        objectId: result.objectId 
      };

    } catch (error) {
      console.error('❌ Erro no upload:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no upload' 
      };
    }
  }

  /**
   * Iniciar tradução (Model Derivative)
   */
  private async startTranslation(objectId: string): Promise<{
    success: boolean;
    urn?: string;
    error?: string;
  }> {
    try {
      const token = await forgeAuthService.getAccessToken();
      
      // Converter objectId para URN base64
      const urn = Buffer.from(objectId).toString('base64');
      
      console.log(`🔄 Iniciando tradução para URN: ${urn}`);

      const response = await fetch(
        'https://developer.api.autodesk.com/modelderivative/v2/designdata/job',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            input: {
              urn: urn
            },
            output: {
              formats: [
                {
                  type: 'svf2',
                  views: ['2d', '3d']
                }
              ]
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Erro na tradução: ${error}` };
      }

      const result = await response.json();
      
      return { 
        success: true, 
        urn: urn
      };

    } catch (error) {
      console.error('❌ Erro na tradução:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro na tradução'
      };
    }
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
    try {
      const token = await forgeAuthService.getAccessToken();
      
      const response = await fetch(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${encodeURIComponent(urn)}/manifest`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        return { status: 'failed', progress: '0%', success: false };
      }

      const manifest = await response.json();
      
      return {
        status: manifest.status || 'inprogress',
        progress: manifest.progress || '0%',
        success: manifest.status === 'success',
        messages: manifest.derivatives
      };

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      return { status: 'failed', progress: '0%', success: false };
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
}

export default new IFCProcessingService();
