import express, {Response} from 'express';
import fs, {promises as fsPromises} from "fs";
import sharp from "sharp";
const path = require('path')

const thumbFolder = "thumb";
const imagesFolder = "images";
const SERVER_PORT = 3000;

const app = express();

function loadCachedImage(fileParam: any, res: Response) {
  const {name, width, height, extension} = fileParam;
  const imagePath = path.resolve(path.join(thumbFolder, `${name}_${width}_${height}.${extension}`));
  const readStream = fs.createReadStream(imagePath, {flags: "r+"});
  readStream.pipe(res);
}

async function processImageFile(fileParam: any, res: Response) {
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

function getFileNameWithSize(originalFileName: string, width: number, height: number) {
  const filename: any = originalFileName;
  const name = filename.split(".")[0];
  const extension = filename.split(".")[1];
  return `${name}_${width}_${height}.${extension}`
}

app.get('/api/images', async (req, res) => {
  let filename: any = null;
  let width: any = null;
  let height: any = null;
  let name = null;
  let extension = null;
  let fileParam = null;

  try {
    filename = req.query["filename"];
    // @ts-ignore
    width= parseInt(req.query["width"], 10);
    // @ts-ignore
    height = parseInt(req.query["height"], 10);
    name = filename.split(".")[0];
    extension = filename.split(".")[1];
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
});

app.listen(SERVER_PORT, () => {
  console.log(`server started at localhost:${SERVER_PORT}`)
});
