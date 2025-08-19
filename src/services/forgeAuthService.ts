import axios from "axios";

/**
 * Interface para o token de acesso do Forge
 */
export interface ForgeToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Serviço para autenticação com Autodesk Forge
 * Com cache de token e refresh automático
 */
class ForgeAuthService {
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  /**
   * Obter token de acesso (string) com cache e refresh automático
   */
  async getAccessToken(): Promise<string> {
    try {
      // Verificar se há token válido em cache
      if (this.cachedToken && this.isTokenValid()) {
        if (typeof this.cachedToken === "string") {
          return this.cachedToken;
        } else {
          this.cachedToken = null;
          throw new Error("Token em cache inválido - não é uma string");
        }
      }

      // Obter token via API direta
      const response = await axios.post(
        "https://developer.api.autodesk.com/authentication/v1/token",
        new URLSearchParams({
          client_id: process.env.FORGE_CLIENT_ID!,
          client_secret: process.env.FORGE_CLIENT_SECRET!,
          grant_type: "client_credentials",
          scope: "data:read data:write bucket:create bucket:read",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const token = response.data.access_token;

      // Cachear token (com margem de segurança de 5 minutos)
      this.cachedToken = token;
      this.tokenExpiresAt = Date.now() + (3600 - 300) * 1000; // 1 hora - 5 min

      return token;
    } catch (error: any) {
      // Limpar cache em caso de erro
      this.cachedToken = null;
      this.tokenExpiresAt = 0;

      throw new Error(`Falha na autenticação com Forge: ${error.message}`);
    }
  }

  /**
   * Verificar se o token em cache ainda é válido
   */
  private isTokenValid(): boolean {
    return Date.now() < this.tokenExpiresAt;
  }

  /**
   * Forçar renovação do token (limpar cache)
   */
  clearCache(): void {
    this.cachedToken = null;
    this.tokenExpiresAt = 0;
  }

  /**
   * Obter token de acesso (compatibilidade com código existente)
   */
  async getAccessTokenObject(): Promise<ForgeToken> {
    const token = await this.getAccessToken();
    return {
      access_token: token,
      token_type: "Bearer",
      expires_in: Math.floor((this.tokenExpiresAt - Date.now()) / 1000),
    };
  }
}

export default new ForgeAuthService();
