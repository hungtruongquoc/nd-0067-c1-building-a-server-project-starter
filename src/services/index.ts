import { Response } from "express";
import fs, { promises as fsPromises } from "fs";
import sharp from "sharp";
import path from "path";
import config from "../config";
import {FileParam} from "../routes";

const { thumbFolder, imagesFolder } = config;

export function loadCachedImage(fileParam: FileParam, res: Response): void {
  const { name, width, height, extension } = fileParam;
  const imagePath = path.resolve(
    path.join(thumbFolder, `${name}_${width}_${height}.${extension}`)
  );
  const readStream = fs.createReadStream(imagePath, { flags: "r+" });
  readStream.pipe(res);
}

export async function processImageFile(
  fileParam: FileParam,
  res: Response
): Promise<boolean> {
  const { name, width, height, extension } = fileParam;
  const sourcePath = path.resolve(
    path.join(imagesFolder, `${name}.${extension}`)
  );

  try {
    await fsPromises.stat(sourcePath);
    const readFileStream = fs.createReadStream(sourcePath);

    readFileStream.on("error", (err: Error) => {
      return res.status(500).send({
        message: err.message,
      });
    });

    const transform = sharp().resize(width, height);

    const targetPath = path.resolve(
      path.join(thumbFolder, `${name}_${width}_${height}.${extension}`)
    );
    const cacheFileStream = fs.createWriteStream(targetPath, { flags: "w+" });
    readFileStream.pipe(transform).pipe(cacheFileStream);

    cacheFileStream.on("finish", () => {
      loadCachedImage({ name, width, height, extension }, res);
    });

    return true;
  } catch (error) {
    console.error("No source file found");
    return false;
  }
}
