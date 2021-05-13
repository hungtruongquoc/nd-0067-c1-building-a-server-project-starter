import express, {Request, Response} from "express";
import path from "path";
import {getFileNameWithSize} from "../helpers";
import {promises as fsPromises} from "fs";
import {loadCachedImage, processImageFile} from "../services";
import config from "../config";
const {thumbFolder} = config;

interface FileParam {
  name?: string;
  width?: number;
  height?: number;
  extension?: string;
}

async function processImageRequest(req: Request, res: Response) {
  let filename: string = '';
  let width: number;
  let height: number;
  let name: string = '';
  let extension: string = '';
  let fileParam: FileParam;

  try {
    filename = String(req.query["filename"]);
    // @ts-ignore
    width= parseInt(req.query["width"], 10);
    // @ts-ignore
    height = parseInt(req.query["height"], 10);
    if (filename) {
      name = filename.split(".")[0];
      extension = filename.split(".")[1];
    }
    fileParam = {name, width, height, extension};
  } catch (error) {
    console.error(error);
    return res.status(500).send({error});
  }

  if (filename && width && height && name && extension && fileParam) {
    try {
      const imagePath = path.resolve(path.join(thumbFolder, `${getFileNameWithSize(filename, width, height)}`));
      await fsPromises.stat(imagePath);
      // A cached image found
      console.log('Found cached image.');
      loadCachedImage(fileParam, res);
      return
    }
    catch (error) {
      if (("ENOENT" === error.code)) {
        console.log('No cached file found');
        // Creates an folder for resized images
        try {
          await fsPromises.stat(thumbFolder);
        }
        catch(error) {
          await fsPromises.mkdir(thumbFolder);
          console.log('Created thumb folder');
        }

        const result = await processImageFile(fileParam, res);
        if (!result) {
          return res.status(500).send({message: 'No source image found'});
        }
      }
    }
  }
  else {
    return res.status(500).send({message: "No input found"});
  }
}

const attachRoutes = (app: express.Application) => {
  app.get('/api/images', processImageRequest);
};

export default attachRoutes;
