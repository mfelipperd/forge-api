"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
/**
 * Schema do modelo de Porta
 * Exatamente como no repositório original
 */
var DoorSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true,
    },
    FamilyType: {
        type: String,
        required: true,
    },
    Mark: {
        type: String,
        required: true,
    },
    DoorFinish: {
        type: String,
        required: true,
        enum: ["Satin", "Varnish", "Veneer", "Gloss"],
        default: "Satin",
    },
}, {
    collection: "Doors",
    versionKey: false,
    _id: false,
});
exports.default = mongoose_1.default.model("Doors", DoorSchema);
