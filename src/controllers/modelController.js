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
var modelPropertiesService_1 = require("../services/modelPropertiesService");
var modelDerivativeService_1 = require("../services/modelDerivativeService");
/**
 * Controller para gerenciar URNs de modelos e propriedades
 */
var ModelController = /** @class */ (function () {
    function ModelController() {
        var _this = this;
        /**
         * Obter URN do modelo para visualização
         */
        this.getModelUrn = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var modelUrn;
            return __generator(this, function (_a) {
                try {
                    modelUrn = process.env.MODEL_URN ||
                        "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aGFjazIyL3Rlc3QucnZ0";
                    return [2 /*return*/, res.json({
                            urn: modelUrn,
                            message: "URN do modelo obtido com sucesso",
                            status: "ready",
                        })];
                }
                catch (error) {
                    console.error("❌ Erro ao obter URN:", error);
                    return [2 /*return*/, res.status(500).json({
                            error: "Erro ao obter URN do modelo",
                        })];
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * Iniciar tradução de modelo para viewables
         */
        this.translateModel = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var urn, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        urn = req.body.urn;
                        if (!urn) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "URN do modelo é obrigatório",
                                })];
                        }
                        console.log("🔄 Iniciando tradução do modelo:", urn);
                        return [4 /*yield*/, modelDerivativeService_1.default.translateModel(urn)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.json({
                                message: "Tradução iniciada com sucesso",
                                urn: urn,
                                result: result,
                            })];
                    case 2:
                        error_1 = _a.sent();
                        console.error("❌ Erro ao iniciar tradução:", error_1.message);
                        return [2 /*return*/, res.status(500).json({
                                error: "Erro ao iniciar tradução do modelo",
                                message: error_1.message,
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Verificar status da tradução
         */
        this.getTranslationStatus = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var urn, status_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        urn = req.params.urn;
                        if (!urn) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "URN do modelo é obrigatório",
                                })];
                        }
                        console.log("🔍 Verificando status da tradução:", urn);
                        return [4 /*yield*/, modelDerivativeService_1.default.getTranslationStatus(urn)];
                    case 1:
                        status_1 = _a.sent();
                        return [2 /*return*/, res.json({
                                urn: urn,
                                status: status_1,
                            })];
                    case 2:
                        error_2 = _a.sent();
                        console.error("❌ Erro ao verificar status:", error_2.message);
                        return [2 /*return*/, res.status(500).json({
                                error: "Erro ao verificar status da tradução",
                                message: error_2.message,
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Listar modelos disponíveis
         */
        this.listModels = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                try {
                    models = [
                        {
                            id: "model-001",
                            name: "Projeto Principal",
                            urn: process.env.MODEL_URN ||
                                "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aGFjazIyL3Rlc3QucnZ0",
                            status: "ready",
                            description: "Modelo principal do projeto",
                        },
                    ];
                    return [2 /*return*/, res.json({
                            models: models,
                            count: models.length,
                        })];
                }
                catch (error) {
                    console.error("❌ Erro ao listar modelos:", error.message);
                    return [2 /*return*/, res.status(500).json({
                            error: "Erro ao listar modelos",
                        })];
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * Obter todas as propriedades de um modelo
         */
        this.getModelProperties = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var urn, properties, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        urn = req.params.urn;
                        if (!urn) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "URN do modelo é obrigatório",
                                })];
                        }
                        console.log("🔍 Buscando propriedades para URN:", urn);
                        return [4 /*yield*/, modelPropertiesService_1.default.getModelProperties(urn)];
                    case 1:
                        properties = _a.sent();
                        return [2 /*return*/, res.json(properties)];
                    case 2:
                        error_3 = _a.sent();
                        console.error("❌ Erro ao obter propriedades:", error_3.message);
                        return [2 /*return*/, res.status(500).json({
                                error: "Erro ao obter propriedades do modelo",
                                message: error_3.message,
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Análise completa do modelo IFC
         */
        this.analyzeIFCModel = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var urn, allProperties, analysis_1, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        urn = req.params.urn;
                        if (!urn) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "URN do modelo é obrigatório",
                                })];
                        }
                        console.log("🔍 Analisando modelo IFC:", urn);
                        return [4 /*yield*/, modelPropertiesService_1.default.getModelProperties(urn)];
                    case 1:
                        allProperties = _a.sent();
                        analysis_1 = {
                            totalElements: allProperties.data.collection.length,
                            categories: {},
                        };
                        allProperties.data.collection.forEach(function (obj) {
                            var _a;
                            var type = ((_a = obj.properties.Item) === null || _a === void 0 ? void 0 : _a.Type) || "Unknown";
                            analysis_1.categories[type] = (analysis_1.categories[type] || 0) + 1;
                        });
                        return [2 /*return*/, res.json({
                                urn: urn,
                                analysis: analysis_1,
                                fullData: allProperties,
                            })];
                    case 2:
                        error_4 = _a.sent();
                        console.error("❌ Erro na análise do modelo IFC:", error_4.message);
                        return [2 /*return*/, res.status(500).json({
                                error: "Erro na análise do modelo IFC",
                                message: error_4.message,
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return ModelController;
}());
exports.default = new ModelController();
