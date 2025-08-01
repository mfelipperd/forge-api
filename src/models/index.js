"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dbConfig_1 = require("../config/dbConfig");
var mongoose_1 = require("mongoose");
var db = {
    mongoose: mongoose_1.default,
    localUrl: dbConfig_1.default.localUrl,
    cloudUrl: dbConfig_1.default.cloudUrl,
};
exports.default = db;
