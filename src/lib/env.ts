import env from "env-var";
import { IsValidUrl } from "./util";

let shodoEnv: { apiRoute: string; token: string } | null = null;

export const loadShodoEnv = () => {
  if (shodoEnv) {
    return shodoEnv;
  }
  let apiRoute, token;
  try {
    apiRoute = env.get("SHODO_API_ROUTE").required().asString();
  } catch (e) {
    throw new Error("環境変数に SHODO_API_ROUTE が登録されていません");
  }
  if (!IsValidUrl(apiRoute)) {
    throw new Error(`SHODO_API_ROUTEがURLとして正しくありません:${apiRoute}`);
  }
  try {
    token = env.get("SHODO_TOKEN").required().asString();
  } catch (e) {
    throw new Error("環境変数に SHODO_TOKEN が登録されていません");
  }
  shodoEnv = { apiRoute, token };
  return shodoEnv;
};
