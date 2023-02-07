import { writeFile } from "fs";
import _ from "lodash";
import fetch from "node-fetch";
import { generateClashConf, parseV2ray } from "./utils.mjs";

const freeNodeList = [
  "https://raw.fastgit.org/freefq/free/master/v2",
  // # "https://raw.fastgit.org/v2ray-links/v2ray-free/master/v2ray",
  // "https://jiang.netlify.app",
  //   "https://shadowshare.v2cross.com/publicserver/servers/temp/SF4xoNf8GUjrHcPb",
  // # "https://raw.fastgit.org/ssrsub/ssr/raw/master/V2Ray"
];

export function getNodeFreeOrgUrl(diffDay = 0) {
  const diffTime = diffDay * 24 * 60 * 60 * 1000;
  const date = new Date(Date.now() + diffTime);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month < 10 ? "0" + month : month;
  let day = date.getDate();
  day = day < 10 ? "0" + day : day;

  return `https://nodefree.org/dy/${year}${month}/${year}${month}${day}.txt`;
}

async function getNodeFreeOrg(day = 0) {
  return fetch(getNodeFreeOrgUrl(day))
    .then((res) => {
      if (res.status == 404) {
        return getNodeFreeOrg(day - 1);
      }
      return res.text();
    })
    .catch((e) => {
      console.log("nodefree fetch error:", e);
      return getNodeFreeOrg(day - 1);
    });
}
async function parseAllFreeNodeList() {
  const batch = freeNodeList.map((url) =>
    fetch(url)
      .then((res) => res.text())
      .then((content) => parseV2ray(content))
  );

  const nodeSet = await Promise.all([
    ...batch,
    getNodeFreeOrg().then((content) => parseV2ray(content)),
  ]);
  console.log("parseAllFreeNodeList - nodeSet", nodeSet);
  const conf = generateClashConf(_.flatten(nodeSet));
  const comments = `
    # 更新时间 ${new Date().toISOString()}

`
  writeFile("./dist/all.yaml", comments + conf, function (info) {
    console.log("writeFile - info", info);
  });
  //   console.log("parseAllFreeNodeList - nodeSet", _.flatten(nodeSet)[8])
}

async function main() {
  parseAllFreeNodeList();
}

main();
