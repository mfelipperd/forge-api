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
var doorModel_1 = require("../models/doorModel");
/**
 * Controller para gerenciar operações com portas
 * Baseado exatamente no repositório original
 */
var DoorsController = /** @class */ (function () {
    function DoorsController() {
        var _this = this;
        /**
         * Salvar uma porta individual
         */
        this.saveOne = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var doorData, door, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Insert One");
                        doorData = {
                            _id: req.body.UniqueId,
                            FamilyType: req.body.FamilyType,
                            Mark: req.body.Mark,
                            DoorFinish: req.body.DoorFinish,
                        };
                        return [4 /*yield*/, doorModel_1.default.create(doorData)];
                    case 1:
                        door = _a.sent();
                        return [2 /*return*/, res.json(door)];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [2 /*return*/, res.status(500).json({ error: "Erro ao salvar porta" })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Buscar todas as portas
         */
        this.getAll = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var doors, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Get All");
                        return [4 /*yield*/, doorModel_1.default.find({})];
                    case 1:
                        doors = _a.sent();
                        return [2 /*return*/, res.json(doors)];
                    case 2:
                        error_2 = _a.sent();
                        console.error(error_2);
                        return [2 /*return*/, res.status(500).json({ error: "Erro ao buscar portas" })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Salvar múltiplas portas (batch)
         */
        this.batchSave = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var count, doors, writeOperations, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        console.log("Insert Batch");
                        return [4 /*yield*/, doorModel_1.default.countDocuments({})];
                    case 1:
                        count = _a.sent();
                        if (!(count === 0)) return [3 /*break*/, 3];
                        console.log("Found No Records");
                        return [4 /*yield*/, doorModel_1.default.insertMany(req.body)];
                    case 2:
                        doors = _a.sent();
                        return [2 /*return*/, res.json(doors)];
                    case 3:
                        console.log("Found Records : " + count);
                        writeOperations = req.body.map(function (door) { return ({
                            updateOne: {
                                filter: { _id: door._id },
                                update: { DoorFinish: door.DoorFinish, Mark: door.Mark },
                            },
                        }); });
                        return [4 /*yield*/, doorModel_1.default.bulkWrite(writeOperations)];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, res.json(result)];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        console.error(error_3);
                        return [2 /*return*/, res.status(500).json({ error: "Erro ao salvar portas em lote" })];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Atualizar uma porta
         */
        this.updateOne = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Update One");
                        id = req.body._id;
                        return [4 /*yield*/, doorModel_1.default.updateOne({ _id: id }, { $set: { DoorFinish: req.body.DoorFinish } })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.json(result)];
                    case 2:
                        error_4 = _a.sent();
                        console.error(error_4);
                        return [2 /*return*/, res.status(500).json({ error: "Erro ao atualizar porta" })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Deletar uma porta
         */
        this.delete = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log("Delete One");
                        id = req.body._id;
                        return [4 /*yield*/, doorModel_1.default.deleteOne({ _id: id })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, res.json(result)];
                    case 2:
                        error_5 = _a.sent();
                        console.error(error_5);
                        return [2 /*return*/, res.status(500).json({ error: "Erro ao deletar porta" })];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return DoorsController;
}());
exports.default = new DoorsController();
