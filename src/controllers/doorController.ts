import { Request, Response } from "express";
import db from "../models";
import DoorModel, { IDoor } from "../models/doorModel";

/**
 * Controller para gerenciar operações com portas
 * Baseado exatamente no repositório original
 */
class DoorsController {
  /**
   * Salvar uma porta individual
   */
  saveOne = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log("Insert One");

      const doorData: Partial<IDoor> = {
        _id: req.body.UniqueId,
        FamilyType: req.body.FamilyType,
        Mark: req.body.Mark,
        DoorFinish: req.body.DoorFinish,
      };

      const door = await DoorModel.create(doorData);
      return res.json(door);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao salvar porta" });
    }
  };

  /**
   * Buscar todas as portas
   */
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log("Get All");

      const doors = await DoorModel.find({});
      return res.json(doors);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar portas" });
    }
  };

  /**
   * Salvar múltiplas portas (batch)
   */
  batchSave = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log("Insert Batch");

      const count = await DoorModel.countDocuments({});

      if (count === 0) {
        console.log("Found No Records");

        const doors = await DoorModel.insertMany(req.body);
        return res.json(doors);
      } else {
        console.log("Found Records : " + count);

        const writeOperations = req.body.map((door: any) => ({
          updateOne: {
            filter: { _id: door._id },
            update: { DoorFinish: door.DoorFinish, Mark: door.Mark },
          },
        }));

        const result = await DoorModel.bulkWrite(writeOperations);
        return res.json(result);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao salvar portas em lote" });
    }
  };

  /**
   * Atualizar uma porta
   */
  updateOne = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log("Update One");

      const id = req.body._id;
      const result = await DoorModel.updateOne(
        { _id: id },
        { $set: { DoorFinish: req.body.DoorFinish } }
      );

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar porta" });
    }
  };

  /**
   * Deletar uma porta
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log("Delete One");

      const id = req.body._id;
      const result = await DoorModel.deleteOne({ _id: id });

      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar porta" });
    }
  };
}

export default new DoorsController();
