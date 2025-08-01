"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var forgeAuthService_1 = require("./forgeAuthService");
/**
 * Serviço para obter propriedades de modelos
 * Extrai metadados e propriedades IFC dos modelos 3D
 */
var ModelPropertiesService = /** @class */ (function () {
    function ModelPropertiesService() {
    }
    /**
     * Obter todas as propriedades de um modelo
     */
    ModelPropertiesService.prototype.getModelProperties = function (urn) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, forgeAuthService_1.default.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        console.log("🔍 Obtendo propriedades do modelo:", urn);
                        return [4 /*yield*/, axios_1.default.get("https://developer.api.autodesk.com/modelderivative/v2/designdata/".concat(urn, "/metadata/properties"), {
                                headers: {
                                    Authorization: "Bearer ".concat(token.access_token),
                                    "Content-Type": "application/json",
                                },
                            })];
                    case 2:
                        response = _b.sent();
                        console.log("✅ Propriedades obtidas com sucesso!");
                        return [2 /*return*/, response.data];
                    case 3:
                        error_1 = _b.sent();
                        console.error("❌ Erro ao obter propriedades:", ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                        throw new Error("Falha ao obter propriedades do modelo");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Obter propriedades de objetos específicos por external IDs
     */
    ModelPropertiesService.prototype.getObjectProperties = function (urn, externalIds) {
        return __awaiter(this, void 0, void 0, function () {
            var token, requestBody, response, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, forgeAuthService_1.default.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        requestBody = {
                            fields: ["objectid", "name", "externalId", "properties"],
                            query: {
                                $in: ["externalId", externalIds],
                            },
                        };
                        console.log("🔍 Obtendo propriedades de objetos específicos...");
                        return [4 /*yield*/, axios_1.default.post("https://developer.api.autodesk.com/modelderivative/v2/designdata/".concat(urn, "/metadata/properties:query"), requestBody, {
                                headers: {
                                    Authorization: "Bearer ".concat(token.access_token),
                                    "Content-Type": "application/json",
                                },
                            })];
                    case 2:
                        response = _b.sent();
                        console.log("✅ Propriedades de objetos obtidas com sucesso!");
                        return [2 /*return*/, response.data];
                    case 3:
                        error_2 = _b.sent();
                        console.error("❌ Erro ao obter propriedades de objetos:", ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) || error_2.message);
                        throw new Error("Falha ao obter propriedades dos objetos");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Filtrar propriedades por tipo de elemento IFC
     */
    ModelPropertiesService.prototype.filterByIFCType = function (properties, ifcType) {
        return properties.data.collection.filter(function (obj) { var _a, _b; return ((_b = (_a = obj.properties.Item) === null || _a === void 0 ? void 0 : _a.Type) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === ifcType.toUpperCase(); });
    };
    /**
     * Obter elementos por categoria (portas, janelas, etc.)
     */
    ModelPropertiesService.prototype.getElementsByCategory = function (urn, category) {
        return __awaiter(this, void 0, void 0, function () {
            var allProperties, categoryMap, types_1, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getModelProperties(urn)];
                    case 1:
                        allProperties = _a.sent();
                        categoryMap = {
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
                        types_1 = categoryMap[category.toLowerCase()] || [
                            category.toUpperCase(),
                        ];
                        return [2 /*return*/, allProperties.data.collection.filter(function (obj) {
                                var _a, _b;
                                var itemType = ((_b = (_a = obj.properties.Item) === null || _a === void 0 ? void 0 : _a.Type) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || "";
                                return types_1.some(function (type) { return itemType.includes(type); });
                            })];
                    case 2:
                        error_3 = _a.sent();
                        console.error("\u274C Erro ao obter elementos da categoria ".concat(category, ":"), error_3.message);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extrair informações resumidas de um objeto
     */
    ModelPropertiesService.prototype.extractObjectSummary = function (obj) {
        var _a, _b, _c, _d, _e, _f;
        return {
            id: obj.objectid,
            name: obj.name,
            externalId: obj.externalId,
            type: ((_a = obj.properties.Item) === null || _a === void 0 ? void 0 : _a.Type) || "Unknown",
            guid: ((_b = obj.properties.Item) === null || _b === void 0 ? void 0 : _b.GUID) || ((_c = obj.properties.IFC) === null || _c === void 0 ? void 0 : _c.GLOBALID) || null,
            layer: ((_d = obj.properties.Item) === null || _d === void 0 ? void 0 : _d.Layer) || null,
            material: ((_e = obj.properties.Item) === null || _e === void 0 ? void 0 : _e.Material) || null,
            sourceFile: ((_f = obj.properties.Item) === null || _f === void 0 ? void 0 : _f["Source File"]) || null,
        };
    };
    return ModelPropertiesService;
}());
exports.default = new ModelPropertiesService();
