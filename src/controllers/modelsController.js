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
exports.modelsController = exports.ModelsController = void 0;
var Model_1 = require("../models/Model");
var modelDerivativeService_1 = require("../services/modelDerivativeService");
var modelPropertiesService_1 = require("../services/modelPropertiesService");
var ModelsController = /** @class */ (function () {
    function ModelsController() {
    }
    // Listar todos os modelos
    ModelsController.prototype.getAllModels = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, status_1, tag, search, filter, models, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, status_1 = _a.status, tag = _a.tag, search = _a.search;
                        filter = {};
                        // Filtros opcionais
                        if (status_1)
                            filter.status = status_1;
                        if (tag)
                            filter.tags = { $in: [tag] };
                        if (search) {
                            filter.$or = [
                                { name: { $regex: search, $options: "i" } },
                                { fileName: { $regex: search, $options: "i" } },
                                { description: { $regex: search, $options: "i" } },
                            ];
                        }
                        return [4 /*yield*/, Model_1.default.find(filter).sort({ uploadDate: -1 })];
                    case 1:
                        models = _b.sent();
                        res.json({
                            success: true,
                            count: models.length,
                            data: models,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        console.error("Erro ao listar modelos:", error_1);
                        res.status(500).json({
                            error: "Erro ao listar modelos",
                            message: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Obter modelo específico
    ModelsController.prototype.getModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, model, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, Model_1.default.findById(id)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, res.status(404).json({
                                    error: "Modelo não encontrado",
                                })];
                        }
                        res.json({
                            success: true,
                            data: model,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Erro ao obter modelo:", error_2);
                        res.status(500).json({
                            error: "Erro ao obter modelo",
                            message: error_2 instanceof Error ? error_2.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Registrar novo modelo (após upload via VS Code Extension ou API)
    ModelsController.prototype.registerModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, name_1, fileName, urn, fileSize, fileType, description, tags, existingModel, base64Urn, newModel, translationError_1, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        _a = req.body, name_1 = _a.name, fileName = _a.fileName, urn = _a.urn, fileSize = _a.fileSize, fileType = _a.fileType, description = _a.description, tags = _a.tags;
                        // Validação básica
                        if (!name_1 || !fileName || !urn || !fileSize || !fileType) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "Campos obrigatórios: name, fileName, urn, fileSize, fileType",
                                })];
                        }
                        return [4 /*yield*/, Model_1.default.findOne({ urn: urn })];
                    case 1:
                        existingModel = _b.sent();
                        if (existingModel) {
                            return [2 /*return*/, res.status(409).json({
                                    error: "Modelo com este URN já existe",
                                    existingId: existingModel._id,
                                })];
                        }
                        base64Urn = void 0;
                        try {
                            // Se já está em base64, usar como está
                            if (urn.includes("=") && !urn.includes(":")) {
                                base64Urn = urn;
                            }
                            else {
                                // Converter para base64
                                base64Urn = Buffer.from(urn).toString("base64");
                            }
                        }
                        catch (error) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "URN inválido",
                                })];
                        }
                        newModel = new Model_1.default({
                            name: name_1,
                            fileName: fileName,
                            urn: urn,
                            base64Urn: base64Urn,
                            fileSize: fileSize,
                            fileType: fileType.toLowerCase(),
                            description: description,
                            tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
                        });
                        return [4 /*yield*/, newModel.save()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, modelDerivativeService_1.default.translateModel(urn)];
                    case 4:
                        _b.sent();
                        console.log("Tradu\u00E7\u00E3o iniciada para modelo ".concat(newModel._id.toString()));
                        return [3 /*break*/, 6];
                    case 5:
                        translationError_1 = _b.sent();
                        console.log("Aviso: Falha ao iniciar tradu\u00E7\u00E3o para modelo ".concat(newModel._id.toString()), translationError_1);
                        return [3 /*break*/, 6];
                    case 6:
                        res.status(201).json({
                            success: true,
                            message: "Modelo registrado com sucesso",
                            data: newModel,
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _b.sent();
                        console.error("Erro ao registrar modelo:", error_3);
                        res.status(500).json({
                            error: "Erro ao registrar modelo",
                            message: error_3 instanceof Error ? error_3.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // Atualizar modelo
    ModelsController.prototype.updateModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, updates, model, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        updates = req.body;
                        // Campos que não podem ser atualizados
                        delete updates.urn;
                        delete updates.base64Urn;
                        delete updates._id;
                        delete updates.uploadDate;
                        return [4 /*yield*/, Model_1.default.findByIdAndUpdate(id, updates, { new: true })];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, res.status(404).json({
                                    error: "Modelo não encontrado",
                                })];
                        }
                        res.json({
                            success: true,
                            data: model,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Erro ao atualizar modelo:", error_4);
                        res.status(500).json({
                            error: "Erro ao atualizar modelo",
                            message: error_4 instanceof Error ? error_4.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Deletar modelo
    ModelsController.prototype.deleteModel = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, model, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, Model_1.default.findByIdAndDelete(id)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, res.status(404).json({
                                    error: "Modelo não encontrado",
                                })];
                        }
                        res.json({
                            success: true,
                            message: "Modelo deletado com sucesso",
                            deletedModel: {
                                id: model._id,
                                name: model.name,
                                fileName: model.fileName,
                            },
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Erro ao deletar modelo:", error_5);
                        res.status(500).json({
                            error: "Erro ao deletar modelo",
                            message: error_5 instanceof Error ? error_5.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Status de tradução de modelo específico
    ModelsController.prototype.getModelStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, model, statusInfo, hasChanges, forgeError_1, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("��� INICIANDO getModelStatus para ID:", req.params.id);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        id = req.params.id;
                        return [4 /*yield*/, Model_1.default.findById(id)];
                    case 2:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, res.status(404).json({
                                    error: "Modelo não encontrado",
                                })];
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, modelDerivativeService_1.default.getDetailedStatus(model.base64Urn)];
                    case 4:
                        statusInfo = _a.sent();
                        hasChanges = false;
                        if (statusInfo.mappedStatus !== model.status) {
                            model.status = statusInfo.mappedStatus;
                            hasChanges = true;
                        }
                        if (statusInfo.mappedProgress !== model.progress) {
                            model.progress = statusInfo.mappedProgress;
                            hasChanges = true;
                        }
                        if (statusInfo.hasDerivatives && !model.metadata.hasProperties) {
                            model.metadata.hasProperties = statusInfo.hasDerivatives;
                            hasChanges = true;
                        }
                        if (!hasChanges) return [3 /*break*/, 6];
                        return [4 /*yield*/, model.save()];
                    case 5:
                        _a.sent();
                        console.log("\u2705 Status atualizado para modelo ".concat(model.name, ": ").concat(model.status, " (").concat(model.progress, ")"));
                        _a.label = 6;
                    case 6:
                        res.json({
                            success: true,
                            data: {
                                id: model._id,
                                name: model.name,
                                fileName: model.fileName,
                                status: model.status,
                                progress: model.progress,
                                canVisualize: statusInfo.canVisualize,
                                hasDerivatives: statusInfo.hasDerivatives,
                                lastChecked: new Date().toISOString(),
                                forgeManifest: statusInfo.forgeStatus,
                            },
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        forgeError_1 = _a.sent();
                        console.warn("\u26A0\uFE0F  Erro ao verificar status no Forge para modelo ".concat(model.name, ":"), forgeError_1);
                        // Retornar status do banco se houver erro no Forge
                        res.json({
                            success: true,
                            data: {
                                id: model._id,
                                name: model.name,
                                fileName: model.fileName,
                                status: model.status,
                                progress: model.progress,
                                canVisualize: model.status === "success",
                                hasDerivatives: model.metadata.hasProperties || false,
                                lastChecked: new Date().toISOString(),
                                error: "Erro ao verificar status no Forge - usando dados locais",
                            },
                        });
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_6 = _a.sent();
                        console.error("Erro ao obter status:", error_6);
                        res.status(500).json({
                            error: "Erro ao obter status do modelo",
                            message: error_6 instanceof Error ? error_6.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // Sincronizar status de todos os modelos com Forge
    ModelsController.prototype.syncAllModels = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var models, results, syncedCount, errorCount, _i, models_1, model, statusInfo, hasChanges, oldStatus, oldProgress, modelError_1, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, Model_1.default.find({})];
                    case 1:
                        models = _a.sent();
                        results = [];
                        syncedCount = 0;
                        errorCount = 0;
                        console.log("\uD83D\uDD04 Iniciando sincroniza\u00E7\u00E3o de ".concat(models.length, " modelos..."));
                        _i = 0, models_1 = models;
                        _a.label = 2;
                    case 2:
                        if (!(_i < models_1.length)) return [3 /*break*/, 9];
                        model = models_1[_i];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, modelDerivativeService_1.default.getDetailedStatus(model.base64Urn)];
                    case 4:
                        statusInfo = _a.sent();
                        hasChanges = false;
                        oldStatus = model.status;
                        oldProgress = model.progress;
                        if (statusInfo.mappedStatus !== model.status) {
                            model.status = statusInfo.mappedStatus;
                            hasChanges = true;
                        }
                        if (statusInfo.mappedProgress !== model.progress) {
                            model.progress = statusInfo.mappedProgress;
                            hasChanges = true;
                        }
                        if (statusInfo.hasDerivatives && !model.metadata.hasProperties) {
                            model.metadata.hasProperties = statusInfo.hasDerivatives;
                            hasChanges = true;
                        }
                        if (!hasChanges) return [3 /*break*/, 6];
                        return [4 /*yield*/, model.save()];
                    case 5:
                        _a.sent();
                        syncedCount++;
                        console.log("\u2705 ".concat(model.name, ": ").concat(oldStatus, "\u2192").concat(model.status, " (").concat(oldProgress, "\u2192").concat(model.progress, ")"));
                        _a.label = 6;
                    case 6:
                        results.push({
                            id: model._id,
                            name: model.name,
                            fileName: model.fileName,
                            oldStatus: oldStatus,
                            newStatus: model.status,
                            oldProgress: oldProgress,
                            newProgress: model.progress,
                            canVisualize: statusInfo.canVisualize,
                            updated: hasChanges,
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        modelError_1 = _a.sent();
                        console.warn("\u26A0\uFE0F  Erro ao sincronizar modelo ".concat(model.name, ":"), modelError_1);
                        errorCount++;
                        results.push({
                            id: model._id,
                            name: model.name,
                            fileName: model.fileName,
                            error: "Erro na sincronização",
                            updated: false,
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9:
                        console.log("\uD83C\uDFAF Sincroniza\u00E7\u00E3o conclu\u00EDda: ".concat(syncedCount, " atualizados, ").concat(errorCount, " erros"));
                        res.json({
                            success: true,
                            message: "Sincroniza\u00E7\u00E3o conclu\u00EDda",
                            summary: {
                                totalModels: models.length,
                                syncedModels: syncedCount,
                                errorsCount: errorCount,
                                lastSync: new Date().toISOString(),
                            },
                            results: results,
                        });
                        return [3 /*break*/, 11];
                    case 10:
                        error_7 = _a.sent();
                        console.error("Erro na sincronização em massa:", error_7);
                        res.status(500).json({
                            error: "Erro na sincronização em massa",
                            message: error_7 instanceof Error ? error_7.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // Propriedades de modelo específico
    ModelsController.prototype.getModelProperties = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, model, properties, propertiesError_1, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        id = req.params.id;
                        return [4 /*yield*/, Model_1.default.findById(id)];
                    case 1:
                        model = _a.sent();
                        if (!model) {
                            return [2 /*return*/, res.status(404).json({
                                    error: "Modelo não encontrado",
                                })];
                        }
                        if (model.status !== "success") {
                            return [2 /*return*/, res.status(400).json({
                                    error: "Modelo ainda não processado completamente",
                                    status: model.status,
                                    progress: model.progress,
                                })];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, modelPropertiesService_1.default.getModelProperties(model.urn)];
                    case 3:
                        properties = _a.sent();
                        res.json({
                            success: true,
                            modelId: model._id,
                            modelName: model.name,
                            fileName: model.fileName,
                            data: properties,
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        propertiesError_1 = _a.sent();
                        res.status(500).json({
                            error: "Erro ao obter propriedades do modelo",
                            message: "O modelo foi processado mas as propriedades não estão disponíveis",
                        });
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_8 = _a.sent();
                        console.error("Erro ao obter propriedades:", error_8);
                        res.status(500).json({
                            error: "Erro ao obter propriedades do modelo",
                            message: error_8 instanceof Error ? error_8.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Estatísticas dos modelos
    ModelsController.prototype.getStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var stats, totalModels, totalSize, error_9;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, Model_1.default.aggregate([
                                {
                                    $group: {
                                        _id: "$status",
                                        count: { $sum: 1 },
                                        totalSize: { $sum: "$fileSize" },
                                    },
                                },
                            ])];
                    case 1:
                        stats = _b.sent();
                        return [4 /*yield*/, Model_1.default.countDocuments()];
                    case 2:
                        totalModels = _b.sent();
                        return [4 /*yield*/, Model_1.default.aggregate([
                                { $group: { _id: null, total: { $sum: "$fileSize" } } },
                            ])];
                    case 3:
                        totalSize = _b.sent();
                        res.json({
                            success: true,
                            data: {
                                totalModels: totalModels,
                                totalSize: ((_a = totalSize[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
                                byStatus: stats,
                            },
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _b.sent();
                        console.error("Erro ao obter estatísticas:", error_9);
                        res.status(500).json({
                            error: "Erro ao obter estatísticas",
                            message: error_9 instanceof Error ? error_9.message : "Erro desconhecido",
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return ModelsController;
}());
exports.ModelsController = ModelsController;
exports.modelsController = new ModelsController();
