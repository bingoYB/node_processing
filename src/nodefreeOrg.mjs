// nodefree.org‘s resource get function
import fetch from "node-fetch";
import { logger } from "./log.mjs";

/**
 * get latest resource url
 * @param {number} diffDay  Specify to get resources from a few days ago
 * @param {“txt”|“yaml”} fileType Specify to get resources type
 * @returns {string} resource url
 */
export function getNodeFreeOrgUrl(diffDay = 0, fileType = "txt") {
    const diffTime = diffDay * 24 * 60 * 60 * 1000;
    const date = new Date(Date.now() + diffTime);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let day = date.getDate();
    day = day < 10 ? "0" + day : day;
    return `https://nodefree.org/dy/${year}/${month}/${year}${month}${day}.${fileType}`;
}

/**
 * fetch resource raw-text
 * @param {number} day 
 * @returns {Promise<string>}
 */
export async function getNodeFreeOrg(day = 0, type="txt") {
    return fetch(getNodeFreeOrgUrl(day, type))
        .then((res) => {
            if (res.status == 404) {
                return getNodeFreeOrg(day - 1, type);
            }
            return res.text();
        })
        .catch((e) => {
            console.log("nodefree fetch error:", e);
            return getNodeFreeOrg(day - 1, type);
        });
}