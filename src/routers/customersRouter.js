import express from "express";

import {
  getCustomers,
  getCustomerById,
  postCustomers,
  putCustomers,
} from "../controllers/customersController.js";

const customerRouter = express.Router();

customerRouter.get("/customers", getCustomers);
customerRouter.get("/customers/:id", getCustomerById);
customerRouter.post("/customers", postCustomers);
customerRouter.put("/customers/:id", putCustomers);

export default customerRouter;
