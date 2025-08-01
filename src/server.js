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
// Carregar variáveis de ambiente PRIMEIRO
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var cors_1 = require("cors");
var path_1 = require("path");
var models_1 = require("./models");
var doorRoutes_1 = require("./routes/doorRoutes");
var modelRoutes_1 = require("./routes/modelRoutes");
var modelsRoutes_1 = require("./routes/modelsRoutes");
var forgeAuthService_1 = require("./services/forgeAuthService");
var app = (0, express_1.default)();
// Configurações de CORS
var corsOptions = {
    origin: "*",
};
// Middlewares
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    console.log("\uFFFD\uFFFD\uFFFD ".concat(req.method, " ").concat(req.path));
    next();
});
// Configuração do banco de dados
var useCloud = process.env.NODE_ENV === "production";
var PORT = process.env.PORT || 8080;
// Conectar ao MongoDB com error handling robusto
models_1.default.mongoose
    .connect(useCloud ? models_1.default.cloudUrl : models_1.default.localUrl)
    .then(function () {
    console.log("✅ Conectado ao banco de dados!");
})
    .catch(function (err) {
    console.log("❌ Não foi possível conectar ao banco de dados!", err.message);
    console.log("🔧 Continuando em modo desenvolvimento...");
    // Não sair do processo em desenvolvimento para permitir debugging
    if (process.env.NODE_ENV === "production") {
        process.exit();
    }
});
// Registrar modelos
require("./models/doorModel");
// Registrar rotas
(0, doorRoutes_1.default)(app);
(0, modelRoutes_1.default)(app);
// Rotas REST para múltiplos modelos
app.use("/api/models", modelsRoutes_1.default);
/**
 * Endpoint para obter token do Forge
 * Baseado exatamente no repositório original
 */
app.get("/token", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, forgeAuthService_1.default.getAccessToken()];
            case 1:
                token = _a.sent();
                res.json(token);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Erro ao obter token:", error_1);
                res.status(500).json({ error: "Falha na autenticação" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Endpoint para obter URN válida para visualização
 * Detecta URNs fake e retorna URN válida para o Forge Viewer
 */
app.get("/api/models/:id/viewer-urn", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    // Função para detectar URN fake (mesma lógica do service)
    function isFakeUrn(urn) {
        try {
            var decoded = Buffer.from(urn, 'base64').toString();
            return decoded.includes('forge-viewer-models/');
        }
        catch (_a) {
            return true;
        }
    }
    var id, Model, model, VALID_DEMO_URN, validUrn, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                Model = require("./models/Model").default;
                return [4 /*yield*/, Model.findById(id)];
            case 1:
                model = _a.sent();
                if (!model) {
                    return [2 /*return*/, res.status(404).json({ error: "Modelo não encontrado" })];
                }
                VALID_DEMO_URN = "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQkFSLklGQw==";
                validUrn = isFakeUrn(model.base64Urn) ? VALID_DEMO_URN : model.base64Urn;
                console.log("\uD83D\uDD0D URN original do modelo ".concat(model.name, ": ").concat(model.base64Urn.substring(0, 50), "..."));
                console.log("\u2705 URN v\u00E1lida retornada: ".concat(validUrn.substring(0, 50), "..."));
                res.json({
                    success: true,
                    data: {
                        id: model._id,
                        name: model.name,
                        fileName: model.fileName,
                        originalUrn: model.base64Urn,
                        validUrn: validUrn,
                        isFake: isFakeUrn(model.base64Urn),
                        status: model.status
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error("Erro ao obter URN válida:", error_2);
                res.status(500).json({ error: "Erro interno do servidor" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Configuração para produção
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.join(__dirname, "../client/build")));
    app.get("*", function (req, res) {
        res.sendFile(path_1.default.join(__dirname, "../client", "build", "index.html"));
    });
}
// Rota raiz
app.get("/", function (req, res) {
    res.json({
        message: "🚀 Forge API Server - URN Generation & Model Management",
        version: "1.0.0",
        endpoints: {
            token: "/token",
            doors: "/api/doors",
        },
    });
});
// Iniciar servidor
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Servidor rodando na porta ".concat(PORT));
    console.log("\uD83D\uDCCD http://localhost:".concat(PORT));
});
exports.default = app;
