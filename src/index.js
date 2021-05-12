"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = express_1.default();
var port = 3000;
app.get('/api', function (req, res) {
    res.send('Hello, world!');
});
app.listen(port, function () {
    console.log("server started at localhost:" + port);
});
