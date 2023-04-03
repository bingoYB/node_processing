import { clashList } from "./resource/clash.mjs";
import { v2rayList } from "./resource/v2ray.mjs";
import {
  generateClashConf,
  getClashNodesByContent,
  mergeClashNodes,
} from "./src/clash.mjs";
import { logger } from "./src/log.mjs";
import { getNodeFreeOrg } from "./src/nodefreeOrg.mjs";
import { generateFile } from "./src/output.mjs";
import { testSpeed } from "./src/speedTest.mjs";
import { batchV2rayToClashNodes } from "./src/v2ray.mjs";
import uuidValidate from 'uuid-validate';

async function task1() {
  const nodeList = await mergeClashNodes(clashList);

  const freeNodeContent = await getNodeFreeOrg(0, "yaml");

  const freeNode = await getClashNodesByContent(
    freeNodeContent.replaceAll("!<str>", "")
  );

  const v2rayToClashNodes = await batchV2rayToClashNodes(v2rayList);

  let allNodes = [...nodeList, ...freeNode, ...v2rayToClashNodes];
  // for (let i = 0; i < allNodes.length; i++) {
  //    const proxy = allNodes[i];
  //    console.log(proxy);
  //    await testSpeed(proxy).then(rs=>{
  //       console.log(rs);
  //    })
  // }

  const configContent = generateClashConf(
    allNodes
      .filter((node) => node)
      .filter((node) => !node.name.includes("中国"))
      .filter((node) => !String(node.password).includes("<"))
      // 过滤不支持的vless协议
      .filter((node) => node.type !== "vless")
      .filter((node) => !node.name.includes("🇨🇳 CN"))
      .filter((node) => uuidValidate(node.uuid))
  );

  const comments = `# 更新时间 ${new Date().toISOString()}
`;

  generateFile("clashMerge", comments + configContent);
}

task1();
