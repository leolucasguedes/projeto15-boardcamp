import express from "express"

import { getRentals, postRentals, finishRental, deleteRental} from "../controllers/rentalsController.js";

const rentalsRouter = express.Router();

rentalsRouter.get('/rentals', getRentals)
rentalsRouter.post('/rentals', postRentals)
rentalsRouter.post('/rentals/:id/return', finishRental)
rentalsRouter.delete('/rentals/:id', deleteRental)

export default rentalsRouter;