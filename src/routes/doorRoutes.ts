import { Express } from "express";
import { Router } from "express";
import DoorsController from "../controllers/doorController";

/**
 * Rotas para gerenciar portas
 * Baseado exatamente no repositório original
 */
export default (app: Express): void => {
  const router = Router();

  // Buscar todas as portas
  router.get("/", DoorsController.getAll);

  // Adicionar uma porta
  router.post("/add", DoorsController.saveOne);

  // Salvar múltiplas portas
  router.post("/batch", DoorsController.batchSave);

  // Atualizar uma porta
  router.patch("/update", DoorsController.updateOne);

  // Deletar uma porta
  router.delete("/delete", DoorsController.delete);

  // Registrar rotas
  app.use("/api/doors", router);
};
