import { writeFile } from "fs";
import { logger } from "./log.mjs"

export function generateFile(fileName, content) {
    writeFile(`./dist/${fileName}.yaml`, content, function (info) {
        logger.info("writeFile - info", info);
    });
}