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
var kysely_1 = require("kysely");
var dotenv_1 = require("dotenv");
var argon_js_1 = require("../src/lib/argon.js");
var better_sqlite3_1 = require("better-sqlite3");
// Load environment variables from .env
(0, dotenv_1.config)();
function createAdmin() {
    return __awaiter(this, void 0, void 0, function () {
        var adminUsername, adminPassword, dbPath, db, existingAdmin, hashedPassword, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    adminUsername = process.env.ADMIN_USERNAME;
                    adminPassword = process.env.ADMIN_PASSWORD;
                    dbPath = process.env.SQLITE_PATH;
                    if (!adminUsername || !adminPassword || !dbPath) {
                        console.error('Error: ADMIN_USERNAME, ADMIN_PASSWORD, and SQLITE_PATH must be set in .env');
                        process.exit(1);
                    }
                    db = new kysely_1.Kysely({
                        dialect: new kysely_1.SqliteDialect({
                            database: new better_sqlite3_1.default(dbPath),
                        }),
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 8]);
                    return [4 /*yield*/, db
                            .selectFrom('user')
                            .select('id')
                            .where('name', '=', adminUsername)
                            .executeTakeFirst()];
                case 2:
                    existingAdmin = _a.sent();
                    if (existingAdmin) {
                        console.log("Admin user \"".concat(adminUsername, "\" already exists."));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, argon_js_1.hashPassword)(adminPassword)];
                case 3:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, db
                            .insertInto('user')
                            .values({
                            name: adminUsername,
                            password: hashedPassword,
                            type: 1, // Admin type
                        })
                            .execute()];
                case 4:
                    _a.sent();
                    console.log("Admin user \"".concat(adminUsername, "\" created successfully."));
                    return [3 /*break*/, 8];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error creating admin user:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, db.destroy()];
                case 7:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
createAdmin().catch(console.error);
