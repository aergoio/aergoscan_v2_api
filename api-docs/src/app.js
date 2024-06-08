import express, { json } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import * as path from "path";

const specs = YAML.load(path.join(__dirname, "../swagger/aergoscan-api.yaml"));

const app = express();

app.use(cors({ credentials: true, origin: true }));

const cache = {
    swapData: null,
    swapDataUpdated: null,
};

app.use("/docs/v2", swaggerUi.serve, swaggerUi.setup(specs));

export default app;
