const { writeFile } = require('fs').promises;
const path = require('path');

const usersDb = path.resolve(__dirname, '..', 'talker.json');
const { handleUser } = require('../index');

const novoUsuario = async (name, age, talk) => {
  const users = await handleUser();
  const id = Number(users[users.length - 1].id) + 1;
  users.push({
    name,
    age,
    id,
    talk,
  });

  await writeFile(usersDb, JSON.stringify(users, null, 2));
  return { name, age, id, talk };
};

const validandoToken = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'Token não encontrado' });
    }
    if (token.length !== 16) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    next();
  };

const validandoNome = (req, res, next) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'O campo "name" é obrigatório' });
    }
    if (name.length < 3) {
      return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
    }
    next();
  };
  const validandoIdadeUsuario = (req, res, next) => {
    const { age } = req.body;
    if (!age) {
      return res.status(400).json({ message: 'O campo "age" é obrigatório' });
    }
    if (!Number.isInteger(age) || age < 18) {
      return res.status(400)
      .json({ message: 'O campo "age" deve ser um número inteiro igual ou maior que 18' });
    }
    next();
  };
const validandoTalk = (req, res, next) => {
    const { talk } = req.body;
    if (!talk) {
      return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
   }
   return next();
  };

const validandoDate = (req, res, next) => {
  const { watchedAt } = req.body.talk;

  if (!watchedAt) {
    return res.status(400)
    .json({
      message: 'O campo "watchedAt" é obrigatório',
    });
  }
  const dateValidation = watchedAt.match(/^[0-9]{2}[/]{1}[0-9]{2}[/]{1}[0-9]{4}$/g);
  if (!dateValidation) {
    return res.status(400)
    .json({
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
    });
  }
  return next();
};

  module.exports = {
    novoUsuario,
    validandoToken,
    validandoNome,
    validandoIdadeUsuario,
    validandoTalk,
    validandoDate,
    // validandoRate,
  };