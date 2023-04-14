const express = require('express');
const bodyParser = require('body-parser');
const requisicao = require('fs').promises;
const { join } = require('path');

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
  const talkerss = talkers.find((talker) => talker.id === Number(id));
  if (!talkerss) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  return res.status(HTTP_OK_STATUS).json(talkerss);
});

app.listen(PORT, () => {
  console.log('Online');
});
