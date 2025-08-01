import dbConfig from "../config/dbConfig";
import mongoose from "mongoose";

interface Database {
  mongoose: typeof mongoose;
  localUrl: string;
  cloudUrl: string;
}

const db: Database = {
  mongoose,
  localUrl: dbConfig.localUrl,
  cloudUrl: dbConfig.cloudUrl,
};

export default db;
