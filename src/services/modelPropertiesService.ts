import axios from "axios";
import forgeAuthService from "./forgeAuthService";

/**
 * Interface para propriedades de objetos do modelo
 */
export interface ModelObjectProperty {
  objectid: number;
  name: string;
  externalId: string;
  properties: {
    [category: string]: {
      [property: string]: any;
    };
  };
}

export interface ModelPropertiesResponse {
  data: {
    type: "properties";
    collection: ModelObjectProperty[];
  };
}

/**
 * Serviço para obter propriedades de modelos
 * Extrai metadados e propriedades IFC dos modelos 3D
 */
class ModelPropertiesService {
  /**
   * Obter todas as propriedades de um modelo
   */
  async getModelProperties(urn: string): Promise<ModelPropertiesResponse> {
    try {
      const token = await forgeAuthService.getAccessToken();

      console.log("🔍 Obtendo propriedades do modelo:", urn);

      const response = await axios.get(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/properties`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Propriedades obtidas com sucesso!");
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Erro ao obter propriedades:",
        error.response?.data || error.message
      );
      throw new Error("Falha ao obter propriedades do modelo");
    }
  }

  /**
   * Obter propriedades de objetos específicos por external IDs
   */
  async getObjectProperties(
    urn: string,
    externalIds: string[]
  ): Promise<ModelPropertiesResponse> {
    try {
      const token = await forgeAuthService.getAccessToken();

      const requestBody = {
        fields: ["objectid", "name", "externalId", "properties"],
        query: {
          $in: ["externalId", externalIds],
        },
      };

      console.log("🔍 Obtendo propriedades de objetos específicos...");

      const response = await axios.post(
        `https://developer.api.autodesk.com/modelderivative/v2/designdata/${urn}/metadata/properties:query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Propriedades de objetos obtidas com sucesso!");
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Erro ao obter propriedades de objetos:",
        error.response?.data || error.message
      );
      throw new Error("Falha ao obter propriedades dos objetos");
    }
  }

  /**
   * Filtrar propriedades por tipo de elemento IFC
   */
  filterByIFCType(
    properties: ModelPropertiesResponse,
    ifcType: string
  ): ModelObjectProperty[] {
    return properties.data.collection.filter(
      (obj) =>
        obj.properties.Item?.Type?.toUpperCase() === ifcType.toUpperCase()
    );
  }

  /**
   * Obter elementos por categoria (portas, janelas, etc.)
   */
  async getElementsByCategory(
    urn: string,
    category: string
  ): Promise<ModelObjectProperty[]> {
    try {
      const allProperties = await this.getModelProperties(urn);

      // Mapear categorias comuns
      const categoryMap: { [key: string]: string[] } = {
        doors: ["IFCDOOR", "DOOR"],
        windows: ["IFCWINDOW", "WINDOW"],
        walls: ["IFCWALL", "IFCWALLSTANDARDCASE", "WALL"],
        floors: ["IFCSLAB", "FLOOR", "IFCBUILDINGFLOOR"],
        roofs: ["IFCROOF", "ROOF"],
        columns: ["IFCCOLUMN", "COLUMN"],
        beams: ["IFCBEAM", "BEAM"],
        spaces: ["IFCSPACE", "SPACE"],
        storeys: ["IFCBUILDINGSTOREY", "STOREY"],
        buildings: ["IFCBUILDING", "BUILDING"],
        sites: ["IFCSITE", "SITE"],
        projects: ["IFCPROJECT", "PROJECT"],
      };

      const types = categoryMap[category.toLowerCase()] || [
        category.toUpperCase(),
      ];

      return allProperties.data.collection.filter((obj) => {
        const itemType = obj.properties.Item?.Type?.toUpperCase() || "";
        return types.some((type) => itemType.includes(type));
      });
    } catch (error: any) {
      console.error(
        `❌ Erro ao obter elementos da categoria ${category}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Extrair informações resumidas de um objeto
   */
  extractObjectSummary(obj: ModelObjectProperty) {
    return {
      id: obj.objectid,
      name: obj.name,
      externalId: obj.externalId,
      type: obj.properties.Item?.Type || "Unknown",
      guid: obj.properties.Item?.GUID || obj.properties.IFC?.GLOBALID || null,
      layer: obj.properties.Item?.Layer || null,
      material: obj.properties.Item?.Material || null,
      sourceFile: obj.properties.Item?.["Source File"] || null,
    };
  }
}

export default new ModelPropertiesService();
