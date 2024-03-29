import express, { json } from "express";
import chalk from "chalk";
import cors from "cors";
import dotenv from "dotenv";

import categoriesRouter from "../routers/categoriesRouter.js";
import gamesRouter from "../routers/gamesRouter.js";
import customersRouter from "../routers/customersRouter.js";
import rentalsRouter from "../routers/rentalsRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(json());

app.use(categoriesRouter);
app.use(gamesRouter);
app.use(customersRouter);
app.use(rentalsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    chalk.green.bold(`Server is running on port http://localhost:${PORT}`)
  );
});