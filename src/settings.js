import jsonBase from "./config/appsettings.json";
import jsonDevelopment from "./config/appsettings.Development.json";
import jsonProduction from "./config/appsettings.Production.json";

const env = process.env.NODE_ENV || "production";
const jsonEnv = env === "development" ? jsonDevelopment : jsonProduction;
console.log("ENVIRONMENT", env);

export default {
  ...jsonBase,
  ...jsonEnv,
};
