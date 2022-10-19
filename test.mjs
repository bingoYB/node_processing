// import { readFileSync, write, writeFile } from "fs"
// import yaml from "js-yaml"
// import { Base64 } from "./utils.mjs"

// const content  = yaml.dump(yaml.load(readFileSync("./compare.yaml")))

// // writeFile("./dist/compare.yaml", content, ()=>{
// //     console.log("ok")
// // })

// const test = decodeURI("ss://Y2hhY2hhMjAtaWV0Zi1wb2x5MTMwNTo5N09uREVaWUdqYTQ@178.18.244.2:443#github.com/freefq%20-%20%E5%BE%B7%E5%9B%BD%20%2012=")
// console.log("test", test)

import fetch from "node-fetch";

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
      console.log("nodefree fetch error:",e);
      return getNodeFreeOrg(day - 1);
    });
}

getNodeFreeOrg();

fetch("https://nodefree.org/dy/202209/20220928.txt").then((res) => {
  console.log(res.status);
});
