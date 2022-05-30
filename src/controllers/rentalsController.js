import db from "./../app/db.js";
import joi from "joi";

export async function getRentals(req, res) {
  const { id, gameId } = req.query;

  try {
    if (id) {
      const rentals = await db.query(`SELECT * FROM rentals WHERE id=$1`, [id]);
      if (rentals.rows.length === 0) {
        res.status(404).send("Usuário não encontrado");
        return;
      }
      res.send(rentals.rows);
      return;
    } else if (gameId) {
      const games = await db.query(`SELECT * FROM rentals WHERE "gameId"=$1`, [
        gameId,
      ]);
      if (games.rows.length === 0) {
        res.status(404).send("Jogo não encontrado");
        return;
      }
      res.send(games.rows);
      return;
    } else {
      const { rows: allRentals } =
        await db.query(`SELECT rentals.*, games.id as "gameId", games.name as "gameName", games."categoryId" as "gameCategoryId", customers.name as "customerName", customers.id as "customerId", categories.id as "categoryId", categories.name as "categoryName" FROM rentals
            JOIN games
            ON rentals."gameId" = games.id
            JOIN customers
            ON rentals."customerId" = customers.id
            JOIN categories
            ON games."categoryId" = categories.id`);
      if (!allRentals.length) {
        res.status(404).send("Ainda não há registros de aluguel");
        return;
      }
      const response = allRentals.map((rentals) => {
        return {
          ...rentals,
          game: {
            id: rentals.gameId,
            name: rentals.gameName,
            categoryId: rentals.categoryId,
            categoryName: rentals.categoryName,
          },
          customer: {
            id: rentals.customerId,
            name: rentals.customerName,
          },
        };
      });
      res.status(200).send(response);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export async function postRentals(req, res) {
  const { customerId, gameId, daysRented } = req.body;

  const rentalSchema = joi.object({
    customerId: joi.number().required(),
    gameId: joi.number().required(),
    daysRented: joi.number().min(1).required(),
  });
  const { error } = rentalSchema.validate({ customerId, gameId, daysRented });
  if (error) {
    res.status(403).send("Insira os dados corretamente");
    return;
  }

  try {
    const verifyClient = await db.query(`SELECT * FROM customers WHERE id=$1`, [
      customerId,
    ]);
    if (verifyClient.rows.length === 0) {
      res.status(400).send("Cliente não registrado");
      return;
    }
    const verifyGame = await db.query(`SELECT * FROM games WHERE id=$1`, [
      gameId,
    ]);
    if (verifyGame.rows.length === 0) {
      res.status(400).send("Jogo não registrado");
      return;
    }
    const verifyGameAvailability = await db.query(
      `SELECT "stockTotal" FROM games WHERE id=$1`,
      [gameId]
    );
    if (verifyGameAvailability.rows[0].stockTotal < 1) {
      res.status(400).send("Não há esse jogo no estoque");
      return;
    }
    const rentDate = new Date();
    const pricePerDay = await db.query(
      `SELECT "pricePerDay" FROM games WHERE id=$1`,
      [gameId]
    );
    const originalPrice = pricePerDay.rows[0].pricePerDay * daysRented;
    await db.query(
      `INSERT INTO rentals ("customerId","gameId","rentDate","daysRented","returnDate","originalPrice","delayFee") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [customerId, gameId, rentDate, daysRented, null, originalPrice, null]
    );
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

export async function finishRental(req, res) {
  const id = parseInt(req.params.id);
  try {
    const verifyRental = await db.query(`SELECT * FROM rentals WHERE id=$1`, [
      id,
    ]);
    if (
      verifyRental.rows.length === 0 ||
      verifyRental.rows[0].returnDate !== null
    ) {
      res.status(400).send("Erro");
      return;
    }
    const verifyGame = await db.query(
      `SELECT rentals.*,games."pricePerDay" FROM rentals
            JOIN games
            ON rentals."gameId" = games.id WHERE rentals.id=$1`,
      [id]
    );

    const rentalData = verifyGame.rows[0];
    const returnDateInUTC = new Date();
    const returnDateInTimestamp = new Date().getTime();

    const dayInMiliseconds = 86400000;
    const realReturnDate =
      rentalData.rentDate.getTime() + rentalData.daysRented * dayInMiliseconds;
    const delayDays = realReturnDate - returnDateInTimestamp;
    const daysDelayed = Math.round(delayDays / dayInMiliseconds);
    const delayFee = daysDelayed * rentalData.pricePerDay;
    await db.query(
      `UPDATE rentals SET "returnDate"=$1 , "delayFee"=$2 WHERE id=$3`,
      [returnDateInUTC, delayFee, id]
    );
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}

export async function deleteRental(req, res) {
  const id = parseInt(req.params.id);
  try {
    const verifyRental = await db.query(`SELECT * FROM rentals WHERE id=$1`, [
      id,
    ]);
    if (
      verifyRental.rows.length === 0 ||
      verifyRental.rows[0].returnDate !== null
    ) {
      res.status(400).send("Aluguel já finalizado ou inexistente");
      return;
    }
    await db.query(`DELETE FROM rentals WHERE id=$1`, [id]);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
}
