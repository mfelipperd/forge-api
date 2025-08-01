import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface para o modelo de URN personalizada
 * Para gerenciar modelos enviados pelo usuário
 */
export interface ICustomModel extends Document {
  _id: string;
  name: string;
  fileName?: string;
  urn: string;
  description?: string;
  status: "processing" | "ready" | "error";
  uploadedAt: Date;
  metadata?: {
    fileSize?: number;
    software?: string;
    version?: string;
    elements?: {
      doors?: number;
      walls?: number;
      windows?: number;
      total?: number;
    };
  };
}

/**
 * Schema do modelo personalizado
 * Para gerenciar URNs enviadas via POST
 */
const CustomModelSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    urn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "error"],
      default: "processing",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      fileSize: Number,
      software: String,
      version: String,
      elements: {
        doors: { type: Number, default: 0 },
        walls: { type: Number, default: 0 },
        windows: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    },
  },
  {
    collection: "CustomModels",
    versionKey: false,
    _id: false,
    timestamps: true,
  }
);

export default mongoose.model<ICustomModel>("CustomModels", CustomModelSchema);
