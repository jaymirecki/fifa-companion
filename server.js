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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var express = require('express');
var DB = require("./jsserver/database");
var app = express();
var validator = require('validator');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
function cors(response) {
    response.header("Access-Control-Allow-Origin", "*");
    return response;
}
// api
app.post("/new_save", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = cors(res);
                    return [4 /*yield*/, DB.createNewSave(req.body)];
                case 1:
                    id = _a.sent();
                    res.send({ id: id });
                    return [2 /*return*/];
            }
        });
    });
});
app.get("/saves", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var saves;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = cors(res);
                    return [4 /*yield*/, DB.getSaves(req.query.user)];
                case 1:
                    saves = _a.sent();
                    res.send(saves);
                    return [2 /*return*/];
            }
        });
    });
});
app.get("/team_selection", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var games, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = cors(res);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, DB.getNewGameTemplates()];
                case 2:
                    games = _a.sent();
                    res.send(games);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log(e_1);
                    res.send({ success: false, error: e_1 });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
});
// pages
app.get("/load", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            res = cors(res);
            res.sendFile(__dirname + '/public/load.html');
            return [2 /*return*/];
        });
    });
});
app.get("/new", function (req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            res = cors(res);
            res.sendFile(__dirname + '/public/new.html');
            return [2 /*return*/];
        });
    });
});
app.get('/play', function (req, res) {
    res = cors(res);
    res.sendFile(__dirname + '/public/play.html');
});
app.listen(process.env.PORT || 8888);
