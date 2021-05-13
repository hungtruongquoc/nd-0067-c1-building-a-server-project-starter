import {Response} from "express";
import fs, {promises as fsPromises} from "fs";
import sharp from "sharp";
import path from 'path';
import config from '../config'

const {thumbFolder, imagesFolder} = config;

export function loadCachedImage(fileParam: any, res: Response) {
  const {name, width, height, extension} = fileParam;
  const imagePath = path.resolve(path.join(thumbFolder, `${name}_${width}_${height}.${extension}`));
  const readStream = fs.createReadStream(imagePath, {flags: "r+"});
  readStream.pipe(res);
}

export async function processImageFile(fileParam: any, res: Response): Promise<boolean> {
  const {name, width, height, extension} = fileParam;
  const sourcePath = path.resolve(path.join(imagesFolder, `${name}.${extension}`));

  try {
    await fsPromises.stat(sourcePath);
    const readFileStream = fs.createReadStream(sourcePath);

    readFileStream.on("error", (err: Error) => {
      return res.status(500).send({
        message: err.message,
      });
    });

    const transform = sharp().resize(parseInt(width), parseInt(height));

    const targetPath = path.resolve(path.join(thumbFolder, `${name}_${width}_${height}.${extension}`));
    const cacheFileStream = fs.createWriteStream(targetPath, {flags: "w+"});
    readFileStream.pipe(transform).pipe(cacheFileStream);

    cacheFileStream.on("finish", () => {
      loadCachedImage({name, width, height, extension}, res);
    });

    return true;
  }
  catch(error) {
    console.error('No source file found');
    return false;
  }
}
