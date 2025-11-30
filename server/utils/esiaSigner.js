import fs from "fs";
import { execFile } from "child_process";
import { CONFIG } from "../config/config.js";

export function signPKCS7Detached(str) {
  return new Promise((resolve, reject) => {
    const tmpIn = `/tmp/esia_sign_${Date.now()}.txt`;
    const tmpOut = `/tmp/esia_sig_${Date.now()}.bin`;

    fs.writeFileSync(tmpIn, str, "utf8");

    const args = [
      "--in",
      tmpIn,
      "--out",
      tmpOut,
      "--detached",
      "--cert",
      CONFIG.CERT_PATH,
      "--key",
      CONFIG.KEY_PATH,
    ];

    execFile(CONFIG.SIGN_TOOL, args, (err) => {
      if (err) return reject(err);

      const raw = fs.readFileSync(tmpOut);
      const b64 = raw.toString("base64");
      const url = b64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      resolve(url);
    });
  });
}
