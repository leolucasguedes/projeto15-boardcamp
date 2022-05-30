import db from "./../app/db.js";
import joi from "joi";

export async function getCategories(req, res) {
  try {
    const categories = await db.query(`SELECT * FROM categories`);
    if (categories.rows.length === 0) {
      res.status(404).send("Ainda não há registros");
      return;
    }
    res.status(200).send(categories.rows);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export async function postCategories(req, res) {
  const { name } = req.body;
  const categorySchema = joi.string().required();
  const { error } = categorySchema.validate(name);
  if (error) {
    res.status(400).send("Digite um nome para a categoria");
    return;
  }
  try {
    const verifyCategory = await db.query(
      `SELECT FROM categories WHERE "name"=$1`,
      [name]
    );
    if (verifyCategory.rows.length !== 0) {
      res.status(409).send("Categoria já existente");
      return;
    }
    await db.query(`INSERT INTO categories (name) VALUES ($1)`, [name]);
    res.sendStatus(201);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}
