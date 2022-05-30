import db from "../app/db.js";
import joi from "joi";

export async function getCustomers(req, res) {
  const { cpf } = req.query;
  try {
    if (!cpf) {
      const customers = await db.query(`SELECT * FROM customers`);
      if (customers.rows.length === 0) {
        res.status(404).send("Ainda não há clientes");
        return;
      }
      res.send(customers.rows);
    } else {
      const customersCPF = await db.query(
        `SELECT * FROM customers WHERE cpf LIKE '$1%'`,
        [cpf]
      );
      if (customersCPF.rows.length === 0) {
        res.status(404).send("Não há cliente com esse início de CPF");
        return;
      }
      res.send(customersCPF.rows);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export async function getCustomerById(req, res) {
  const id = parseInt(req.params.id);
  try {
    const customer = await db.query(`SELECT * FROM customers WHERE id=$1`, [
      id,
    ]);
    if (customer.rows.length === 0) {
      res.status(404).send("Cliente não encontrado");
      return;
    }
    res.status(200).send(customer.rows[0]);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export async function postCustomers(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const customerSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().min(10).max(11).required(),
    cpf: joi.string().min(11).max(11).required(),
    birthday: joi.string().isoDate().required(),
  });
  const { error } = customerSchema.validate({ name, phone, cpf, birthday });
  if (error) {
    res.status(400).send("Insira dados corretamente");
    return;
  }
  try {
    const verifyCpf = await db.query(`SELECT FROM customers WHERE cpf=$1`, [
      cpf,
    ]);
    if (verifyCpf.rows.length !== 0) {
      res.status(409).send("CPF já cadastrado");
      return;
    }
    await db.query(
      `INSERT INTO customers (name,phone,cpf,birthday) VALUES ($1,$2,$3,$4)`,
      [name, phone, cpf, birthday]
    );
    res.status(201).send("cadastro realizado com sucesso");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

export async function putCustomers(req, res) {
  const id = parseInt(req.params.id);
  const { name, phone, cpf, birthday } = req.body;
  const customerSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().min(10).max(11).required(),
    cpf: joi.string().min(11).max(11).required(),
    birthday: joi.string().isoDate().required(),
  });
  const { error } = customerSchema.validate({ name, phone, cpf, birthday });
  if (error) {
    res.status(400).send("Insira dados corretamente");
    return;
  }
  try {
    const verifyCpf = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [
      cpf,
    ]);
    if (verifyCpf.rows.length !== 0) {
      res.status(409).send("CPF já cadastrado");
      return;
    }
    const updatedCostumer = await db.query(
      `UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5`,
      [name, phone, cpf, birthday, id]
    );
    res.status(200).send("Dados alterados");
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}
