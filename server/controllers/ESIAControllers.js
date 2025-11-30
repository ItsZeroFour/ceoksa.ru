import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { CONFIG } from "../config/config.mjs";
import { nowTimestamp } from "../utils/timestamp.mjs";
import { generateCodeVerifier, gostCodeChallenge } from "../utils/pkce.mjs";
import { signPKCS7Detached } from "../utils/esiaSigner.mjs";

export const authUser = async (req, res) => {
  try {
    const state = uuidv4();
    const verifier = generateCodeVerifier();
    const challenge = await gostCodeChallenge(verifier);

    req.session.state = state;
    req.session.verifier = verifier;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CONFIG.CLIENT_ID,
      redirect_uri: CONFIG.REDIRECT_URI,
      scope: "openid",
      state,
      timestamp: nowTimestamp(),
      display: "popup",
      code_challenge_method: "GOST3411",
      code_challenge: challenge,
    });

    res.redirect(`${CONFIG.ESIA_BASE}/aas/oauth2/v2/ac?${params.toString()}`);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизироваться",
    });
  }
};

export const ESIACallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || state !== req.session.state) {
      return res.status(400).send("State mismatch");
    }

    const timestamp = nowTimestamp();
    const scope = "openid";
    const scope_org = "";

    const concat =
      CONFIG.CLIENT_ID +
      scope +
      scope_org +
      timestamp +
      state +
      CONFIG.REDIRECT_URI +
      code;

    const signature = await signPKCS7Detached(concat);

    const body = new URLSearchParams({
      client_id: CONFIG.CLIENT_ID,
      scope,
      scope_org,
      timestamp,
      state,
      redirect_uri: CONFIG.REDIRECT_URI,
      code,
      client_certificate_hash: CONFIG.CERT_HASH,
      client_secret: signature,
      code_verifier: req.session.verifier,
    });

    const url = `${CONFIG.ESIA_BASE}/aas/oauth2/v3/te`;
    const resp = await axios.post(url, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    res.json(resp.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизироваться",
    });
  }
};
