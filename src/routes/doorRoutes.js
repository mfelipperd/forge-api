"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var doorController_1 = require("../controllers/doorController");
/**
 * Rotas para gerenciar portas
 * Baseado exatamente no repositório original
 */
exports.default = (function (app) {
    var router = (0, express_1.Router)();
    // Buscar todas as portas
    router.get("/", doorController_1.default.getAll);
    // Adicionar uma porta
    router.post("/add", doorController_1.default.saveOne);
    // Salvar múltiplas portas
    router.post("/batch", doorController_1.default.batchSave);
    // Atualizar uma porta
    router.patch("/update", doorController_1.default.updateOne);
    // Deletar uma porta
    router.delete("/delete", doorController_1.default.delete);
    // Registrar rotas
    app.use("/api/doors", router);
});
