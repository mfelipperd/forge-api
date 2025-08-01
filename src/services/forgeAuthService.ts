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
 * Baseado no repositório original
 */
class ForgeAuthService {
  /**
   * Obter token de acesso do Forge
   */
  async getAccessToken(): Promise<ForgeToken> {
    try {
      // Criar dados no formato URL-encoded
      const data = new URLSearchParams();
      data.append("client_id", credentials.credentials.client_id);
      data.append("client_secret", credentials.credentials.client_secret);
      data.append("grant_type", credentials.credentials.grant_type);
      data.append("scope", credentials.credentials.scope);

      console.log("🔑 Solicitando token do Forge...");
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

      console.log("✅ Token obtido com sucesso!");
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Erro ao obter token do Forge:",
        error.response?.data || error.message
      );
      throw new Error("Falha na autenticação com Forge");
    }
  }

  /**
   * Validar se o token ainda é válido
   */
  isTokenValid(token: ForgeToken, issuedAt: number): boolean {
    const now = Date.now();
    const expirationTime = issuedAt + token.expires_in * 1000;
    return now < expirationTime;
  }
}

export default new ForgeAuthService();
