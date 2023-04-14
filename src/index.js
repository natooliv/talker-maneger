const express = require('express');
const bodyParser = require('body-parser');
const requisicao = require('fs').promises;
const { join } = require('path');
const crypto = require('crypto');
 const { VALIDADE_EMAIL, VALIDADE_SENHA } = require('./middleware/validation');
 const {
  novoUsuario,
    validandoToken,
    validandoNome,
    validandoIdadeUsuario,
    validandoTalk,
    validandoDate,
    validandoRate,
} = require('./middleware/validationNomeToken');

const app = express();
app.use(express.json());
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = process.env.PORT || '3001';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// A requisição deve retornar o status 200 e um array com todas as pessoas palestrantes cadastradas.
const talkerPath = './talker.json';
const talkersPath = join(__dirname, talkerPath);

const handleUser = async () => {
    const talkers = await requisicao.readFile(talkersPath, 'utf-8');
    return JSON.parse(talkers);
  };
app.get('/talker', async (_req, _res) => {
  const talkers = await handleUser();
  if (talkers.length === 0) return _res.status(HTTP_OK_STATUS).json([]);
  return _res.status(HTTP_OK_STATUS).json(talkers);
});

// A requisição deve retornar o status 200 e uma pessoa palestrante com base no id da rota.
 app.get('/talker/:id', async (req, res) => {
  const talkers = await handleUser();
  const { id } = req.params;
  const talker = talkers.find((e) => e.id === Number(id));
  if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return res.status(HTTP_OK_STATUS).json(talker);
});

app.listen(PORT, () => {
  console.log('Online');
});

// O endpoint deverá receber no corpo da requisição os campos email e password e retornar um token aleatório de 16 caracteres
app.post('/login', VALIDADE_EMAIL, VALIDADE_SENHA, (_req, res) => {
  const tokens = crypto.randomBytes(8).toString('hex');
  const response = { token: tokens };
  res.status(HTTP_OK_STATUS).json(response);
});

app.post('/talker', validandoToken, validandoNome,
 validandoIdadeUsuario, validandoTalk, 
 validandoDate, validandoRate, async (req, res) => {
  const { name, age, talk, watchedAt, rate } = req.body;
  const adcionando = await novoUsuario(name, age, talk, watchedAt, rate);
  res.status(201).json(adcionando);
});
