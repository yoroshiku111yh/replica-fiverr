import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs-extra';
const sharp = require('sharp');
import generateRandomString from 'ultil/function/randomString';
import removeNonAlphanumeric from 'ultil/function/removeNonAlphanumeric';


export interface ImageCompressed {
  path : string,
  format : string,
  width : number,
  height : number,
  channels : number,
  premultiplied : boolean,
  size : number,
  filename : string
}

//process.cwd()

@Injectable()
export class CompressImagePipe implements PipeTransform {
  constructor(@Inject("UPLOAD_PATH") private readonly pathUpload: string) {
    this.pathUpload = pathUpload
  }
  async transform(image: Express.Multer.File | Express.Multer.File[] | undefined):Promise<ImageCompressed[]> {
    if (image === undefined) {
      return null;
    }
    const files = Array.isArray(image) ? image : [image];
    const processedFiles = await Promise.allSettled(
      files.map(file => {
        return compressImage(file, this.pathUpload);
      })
    )
    return processedFiles.map(fileUploaded => fileUploaded.status === "fulfilled" && fileUploaded.value);
  }
}

const compressImage = async (file, pathUrl: string) => {
  const originalName = removeNonAlphanumeric(path.parse(file.originalname).name);
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const filename = Date.now() + '-' + generateRandomString(4) + '-' + originalName;
  let fileCompressed: any;
  const folderPath = path.join(process.cwd() + "/public/", pathUrl);
  const checkFolderExist = await fs.pathExists(folderPath);
  if(!checkFolderExist){
    await fs.ensureDir(folderPath);
  }
  switch (fileExtension) {
    case ".jpg":
    case ".jpeg":
      fileCompressed = await sharp(file.buffer)
        .jpeg({ quality: 75 })
      break;
    case '.png':
      fileCompressed = await sharp(file.buffer)
        .png({ quality: 75 })
      break;
    case '.webp':
      fileCompressed = await sharp(file.buffer)
        .webp({ quality: 75 })
      break;
    default:
      fileCompressed = await sharp(file.buffer)
      break;
  }
  const fileSaved = await fileCompressed.toFile(path.join(folderPath, filename + fileExtension));
  return {
    path: pathUrl + "/" + filename + fileExtension,
    filename: filename,
    ...fileSaved
  }
}