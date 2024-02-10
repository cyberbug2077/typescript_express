import { cleanEnv, str, port } from "envalid";

export default function validateEnv() {
  cleanEnv(process.env, {
    DB_CONN_STRING: str(),
    PORT: port(),
  });
}
