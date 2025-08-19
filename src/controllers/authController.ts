import { Request, Response } from "express";
import forgeAuthService from "../services/forgeAuthService";

/**
 * Controller para autenticação do Forge
 * Simplificado para autenticação two-legged
 */
class AuthController {
  /**
   * Obtém token de acesso para o Forge
   * GET /token
   */
  async getToken(req: Request, res: Response): Promise<void> {
    try {
      const token = await forgeAuthService.getAccessToken();

      res.json({
        access_token: token,
        expires_in: 3600,
      });
    } catch (error) {
      console.error("Erro ao obter token:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Erro ao obter token",
      });
    }
  }
}

// Exporta uma instância única do controller
export default new AuthController();
