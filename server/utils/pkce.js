import { subtle } from "gost-crypto";

export function generateCodeVerifier() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let out = "";
    for (let i = 0; i < 43; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}

export async function gostCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const hash = await subtle.digest({ name: "GOST R 34.11" }, data);

    const b64 = Buffer.from(hash).toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
