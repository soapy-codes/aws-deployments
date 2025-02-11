import * as path from "path";
import * as fs from "fs";

const findRootEnv = (searchPath: string): string => {
  if (searchPath === "/") {
    throw new Error("No .env file found");
  }
  if (fs.readdirSync(searchPath).find((file) => file === ".env")) {
    return searchPath;
  }
  return findRootEnv(path.join(searchPath, "../"));
};

export const projectRootPath = findRootEnv(__dirname);
export const projectEnvPath = path.join(projectRootPath, ".env");
export const lambdasDirPath = path.join(projectRootPath, "packages/lambda");
export const lambdaLayersDirPath = path.join(
  projectRootPath,
  "packages/lambda-layers"
);
export const frontendDirPath = path.join(projectRootPath, "frontend/dist");
