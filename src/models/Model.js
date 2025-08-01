"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ModelSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    urn: { type: String, required: true, unique: true },
    base64Urn: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["uploaded", "translating", "success", "failed"],
        default: "uploaded",
    },
    progress: { type: String, default: "0%" },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    metadata: {
        elements: { type: Number },
        ifcTypes: [{ type: String }],
        hasProperties: { type: Boolean, default: false },
    },
}, {
    timestamps: true,
});
// Índices para otimização
ModelSchema.index({ urn: 1 });
ModelSchema.index({ status: 1 });
ModelSchema.index({ uploadDate: -1 });
ModelSchema.index({ tags: 1 });
exports.default = mongoose_1.default.model("Model", ModelSchema);
