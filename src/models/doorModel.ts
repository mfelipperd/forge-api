import mongoose, { Schema, Document } from "mongoose";

/**
 * Interface para o modelo de Porta
 * Baseado no repositório original
 */
export interface IDoor extends Document {
  _id: string;
  FamilyType: string;
  Mark: string;
  DoorFinish: string;
}

/**
 * Schema do modelo de Porta
 * Exatamente como no repositório original
 */
const DoorSchema: Schema = new Schema(
  {
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
  },
  {
    collection: "Doors",
    versionKey: false,
    _id: false,
  }
);

export default mongoose.model<IDoor>("Doors", DoorSchema);
