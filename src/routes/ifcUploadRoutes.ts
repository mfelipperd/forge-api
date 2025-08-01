import { Router } from 'express';
import ifcUploadController from '../controllers/ifcUploadController';

const router = Router();

/**
 * Rotas para upload e processamento automático de arquivos IFC
 * 
 * Funcionalidade:
 * - Upload de arquivo .ifc
 * - Criação automática de bucket
 * - Upload para Autodesk OSS
 * - Início automático de tradução
 * - Monitoramento de progresso
 * - Geração automática de URN
 */

/**
 * POST /api/models/ifc/upload
 * Upload e processamento automático de arquivo IFC
 * 
 * Content-Type: multipart/form-data
 * 
 * Form Fields:
 * - ifcFile: arquivo .ifc (obrigatório)
 * - name: nome do modelo (obrigatório)
 * - description: descrição do modelo (opcional)
 */
router.post('/upload', 
  ifcUploadController.uploadMiddleware,
  ifcUploadController.uploadAndProcessIFC
);

/**
 * GET /api/models/ifc/status/:id
 * Verificar status do processamento de um upload específico
 */
router.get('/status/:id', ifcUploadController.getUploadStatus);

export default router;
