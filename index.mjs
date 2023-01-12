import { clashList } from "./resource/clash.mjs"
import { generateClashConf, getClashNodesByContent, mergeClashNodes } from "./src/clash.mjs"
import { logger } from "./src/log.mjs";
import { getNodeFreeOrg } from "./src/nodefreeOrg.mjs";
import { generateFile } from "./src/output.mjs";

async function task1(){
   const nodeList = await mergeClashNodes(clashList);

   const freeNodeContent = await getNodeFreeOrg(0, "yaml");
   
   const freeNode = await getClashNodesByContent(freeNodeContent);
   console.log(freeNode);

   
   const configContent = generateClashConf([...nodeList, ...freeNode]);

   generateFile("clashMerge", configContent);
}

task1();