import axios from "axios";
import credentials from "../config/credentials";

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
        console.log("🔄 Usando token em cache");
        // Garantir que o token em cache é uma string
        if (typeof this.cachedToken === "string") {
          return this.cachedToken;
        } else {
          console.log("⚠️ Token em cache não é string, limpando cache...");
          this.cachedToken = null;
        }
      }

      console.log("🔑 Solicitando novo token do Forge...");

      // Criar dados no formato URL-encoded
      const data = new URLSearchParams();
      data.append("client_id", credentials.credentials.client_id);
      data.append("client_secret", credentials.credentials.client_secret);
      data.append("grant_type", credentials.credentials.grant_type);
      data.append("scope", credentials.credentials.scope);

      console.log("URL:", credentials.Authentication);
      console.log("Client ID:", credentials.credentials.client_id);

      const response = await axios.post(
        credentials.Authentication,
        data.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const tokenData: ForgeToken = response.data;

      // Debug completo do token recebido
      console.log("🔍 DEBUG TOKEN RECEBIDO:");
      console.log("- tokenData completo:", tokenData);
      console.log("- access_token tipo:", typeof tokenData.access_token);
      console.log("- access_token valor:", tokenData.access_token);
      console.log(
        "- access_token constructor:",
        tokenData.access_token?.constructor?.name
      );

      // Cachear token (com margem de segurança de 5 minutos)
      this.cachedToken = tokenData.access_token;
      this.tokenExpiresAt = Date.now() + (tokenData.expires_in - 300) * 1000;

      // Debug do token cacheado
      console.log("🔍 DEBUG TOKEN CACHEADO:");
      console.log("- cachedToken tipo:", typeof this.cachedToken);
      console.log("- cachedToken valor:", this.cachedToken);

      console.log(
        `✅ Token obtido com sucesso! Expira em ${tokenData.expires_in} segundos`
      );

      // Garantir que retornamos uma string
      if (typeof this.cachedToken === "string") {
        return this.cachedToken;
      } else {
        console.error(
          `❌ Token não é string: ${typeof this.cachedToken}`,
          this.cachedToken
        );
        throw new Error("Token obtido não é uma string válida");
      }
    } catch (error: any) {
      console.error(
        "❌ Erro ao obter token do Forge:",
        error.response?.data || error.message
      );

      // Limpar cache em caso de erro
      this.cachedToken = null;
      this.tokenExpiresAt = 0;

      // Limpar cache em caso de erro
      this.cachedToken = null;
      this.tokenExpiresAt = 0;

      throw new Error("Falha na autenticação com Forge");
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
    console.log("🧹 Cache de token limpo");
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
