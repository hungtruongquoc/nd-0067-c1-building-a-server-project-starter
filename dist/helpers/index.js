"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileNameWithSize = void 0;
function getFileNameWithSize(originalFileName, width, height) {
    var name = originalFileName.split(".")[0];
    var extension = originalFileName.split(".")[1];
    return name + "_" + width + "_" + height + "." + extension;
}
exports.getFileNameWithSize = getFileNameWithSize;
