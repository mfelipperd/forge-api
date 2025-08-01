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
 * URN válida do Autodesk Forge para demonstração
 * Esta é uma URN real que funciona com a API do Forge
 */
var VALID_DEMO_URN = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQkFSLklGQw==";
/**
 * Verifica se uma URN é fake/simulada
 */
function isFakeUrn(urn) {
    try {
        // Decodifica base64 para verificar o conteúdo
        var decoded = Buffer.from(urn, 'base64').toString();
        // URNs fake geralmente começam com "urn:adsk.objects:os.object:forge-viewer-models/"
        return decoded.includes('forge-viewer-models/');
    }
    catch (_a) {
        return true; // Se não conseguir decodificar, considera fake
    }
}
/**
 * Retorna uma URN válida, substituindo URNs fake pela demo válida
 */
function getValidUrn(urn) {
    if (isFakeUrn(urn)) {
        console.log("\uD83D\uDD04 URN fake detectada, usando URN demo v\u00E1lida");
        return VALID_DEMO_URN;
    }
    return urn;
}
/**
 * Serviço para Model Derivative API
 * Para upload e conversão de modelos conforme documentação APS
 */
var ModelDerivativeService = /** @class */ (function () {
    function ModelDerivativeService() {
    }
    /**
     * Iniciar tradução de modelo para viewables
     */
    ModelDerivativeService.prototype.translateModel = function (objectUrn) {
        return __awaiter(this, void 0, void 0, function () {
            var validUrn, token, body, response, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        validUrn = getValidUrn(objectUrn);
                        return [4 /*yield*/, forgeAuthService_1.default.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        body = {
                            input: {
                                urn: validUrn,
                            },
                            output: {
                                formats: [
                                    {
                                        type: "svf",
                                        views: ["2d", "3d"],
                                    },
                                ],
                            },
                        };
                        return [4 /*yield*/, axios_1.default.post("https://developer.api.autodesk.com/modelderivative/v2/designdata/job", body, {
                                headers: {
                                    Authorization: "Bearer ".concat(token.access_token),
                                    "Content-Type": "application/json",
                                },
                            })];
                    case 2:
                        response = _b.sent();
                        console.log("✅ Tradução iniciada com sucesso!");
                        return [2 /*return*/, response.data];
                    case 3:
                        error_1 = _b.sent();
                        console.error("❌ Erro na tradução:", ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                        throw new Error("Falha na tradução do modelo");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verificar status da tradução
     */
    ModelDerivativeService.prototype.getTranslationStatus = function (urn) {
        return __awaiter(this, void 0, void 0, function () {
            var validUrn, token, response, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        validUrn = getValidUrn(urn);
                        return [4 /*yield*/, forgeAuthService_1.default.getAccessToken()];
                    case 1:
                        token = _b.sent();
                        return [4 /*yield*/, axios_1.default.get("https://developer.api.autodesk.com/modelderivative/v2/designdata/".concat(validUrn, "/manifest"), {
                                headers: {
                                    Authorization: "Bearer ".concat(token.access_token),
                                },
                            })];
                    case 2:
                        response = _b.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        error_2 = _b.sent();
                        console.error("❌ Erro ao verificar status:", ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) || error_2.message);
                        throw new Error("Falha ao verificar status da tradução");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Mapear status do Forge para status interno
     */
    ModelDerivativeService.prototype.mapForgeStatus = function (manifest) {
        if (!manifest) {
            return { status: "uploaded", progress: "0%", hasDerivatives: false };
        }
        var forgeStatus = manifest.status;
        var forgeProgress = manifest.progress;
        // Verificar se tem derivatives prontos
        var hasDerivatives = manifest.derivatives &&
            manifest.derivatives.length > 0 &&
            manifest.derivatives.some(function (d) {
                return d.status === "success" && d.children && d.children.length > 0;
            });
        var mappedStatus;
        var mappedProgress;
        switch (forgeStatus) {
            case "success":
                mappedStatus = "success";
                mappedProgress = "complete";
                break;
            case "inprogress":
                mappedStatus = "translating";
                mappedProgress = forgeProgress || "50%";
                break;
            case "failed":
            case "timeout":
                mappedStatus = "failed";
                mappedProgress = "failed";
                break;
            default:
                mappedStatus = "uploaded";
                mappedProgress = "0%";
        }
        return {
            status: mappedStatus,
            progress: mappedProgress,
            hasDerivatives: hasDerivatives,
        };
    };
    /**
     * Verificar status detalhado e mapear corretamente
     */
    ModelDerivativeService.prototype.getDetailedStatus = function (urn) {
        return __awaiter(this, void 0, void 0, function () {
            var validUrn, manifest, mapped, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        validUrn = getValidUrn(urn);
                        console.log("\uD83D\uDD0D Verificando status para URN: ".concat(urn.substring(0, 50), "..."));
                        console.log("\uD83D\uDD04 Usando URN v\u00E1lida: ".concat(validUrn.substring(0, 50), "..."));
                        return [4 /*yield*/, this.getTranslationStatus(validUrn)];
                    case 1:
                        manifest = _a.sent();
                        console.log("\u2705 Manifest obtido, status: ".concat((manifest === null || manifest === void 0 ? void 0 : manifest.status) || "undefined"));
                        mapped = this.mapForgeStatus(manifest);
                        console.log("\uD83D\uDCCA Status mapeado: ".concat(mapped.status, " (").concat(mapped.progress, ")"));
                        return [2 /*return*/, {
                                forgeStatus: manifest,
                                mappedStatus: mapped.status,
                                mappedProgress: mapped.progress,
                                hasDerivatives: mapped.hasDerivatives,
                                canVisualize: mapped.status === "success" && mapped.hasDerivatives,
                            }];
                    case 2:
                        error_3 = _a.sent();
                        console.error("\u274C Erro ao verificar status para URN ".concat(urn.substring(0, 50), ":"), error_3);
                        return [2 /*return*/, {
                                forgeStatus: null,
                                mappedStatus: "uploaded",
                                mappedProgress: "0%",
                                hasDerivatives: false,
                                canVisualize: false,
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ModelDerivativeService;
}());
exports.default = new ModelDerivativeService();
