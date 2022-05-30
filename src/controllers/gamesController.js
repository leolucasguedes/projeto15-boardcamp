import db from "./../app/db.js";
import joi from "joi";

export async function getGames(req, res) {
  const { name } = req.query;
  try {
    if (name) {
      const games = await db.query(
        `SELECT * FROM games WHERE name ILIKE '${name}%'`
      );
      if (games.rows.length !== 0) {
        res.status(200).send(games.rows);
        return;
      } else if (games.rows.length === 0) {
        res.status(404).send("Não há jogo com esses dados");
        return;
      }
    } else {
      const games =
        await db.query(`SELECT games.*, categories.name as "categoryName" FROM games
            JOIN categories 
            ON games."categoryId" = categories.id`);
      if (games.rows.length === 0) {
        res.status(404).send("Ainda não há registros");
        return;
      }
      res.status(200).send(games.rows);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export async function postGames(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string().uri().required(),
    stockTotal: joi.number().integer().min(1).required(),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().integer().min(1).required(),
  });
  const { error } = gameSchema.validate({
    name,
    image,
    stockTotal,
    categoryId,
    pricePerDay,
  });
  if (error) {
    console.log(error);
    res.status(403).send("Insira os dados corretamente");
    return;
  }
  try {
    const verifyCathegorie = await db.query(
      `SELECT FROM categories WHERE id=$1`,
      [categoryId]
    );
    if (verifyCathegorie.rows.length === 0) {
      res.status(409).send("Categoria inexistente");
      return;
    }
    const verifyGame = await db.query(
      `SELECT FROM games WHERE name ILIKE '${name}%'`
    );
    if (verifyGame.rows.length !== 0) {
      res.status(409).send("Game já existente");
      return;
    }
    await db.query(
      `INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1,$2,$3,$4,$5)`,
      [name, image, stockTotal, categoryId, pricePerDay]
    );
    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}
