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
  res.status(200).json(response);
});

app.post('/talker', validandoToken, validandoNome,
 validandoIdadeUsuario, validandoTalk, 
 validandoDate, validandoRate, async (req, res) => {
  const { name, age, talk } = req.body;
  const adcionando = await novoUsuario(name, age, talk);
  res.status(201).json(adcionando);
});

// O endpoint deverá receber no corpo da requisição os campos name, age e talk e atualizar a pessoa palestrante com o id informado na rota.
// const atualizacaoUsuario = async (id, body) => {
//   const { name, age, talk } = body;
//   const talkers = await handleUser();
//   let talker = talkers.some((usuario) => usuario.id === Number(id));
//   const removerTalker = talkers.findIndex((usuario) => usuario.id === Number(id));
//   talkers[removerTalker] = { name, age, id: Number(id), talk };
//   await requisicao.writeFile(talkersPath, JSON.stringify(talkers));

//   return talker;
// };

 app.put('/talker/:id', validandoToken, validandoNome, 
 validandoIdadeUsuario, validandoTalk, 
 validandoDate, validandoRate, async (req, res) => {
  const { name, age, talk } = req.body;
  const talkers = await handleUser();
  const { id } = req.params;
  const talker = talkers.some((usuario) => usuario.id === Number(id));
  const removerTalker = talkers.findIndex((usuario) => usuario.id === Number(id));
  talkers[removerTalker] = { name, age, id: Number(id), talk };
  if (!talker) {
 return res.status(404)
  .json({ message: 'Pessoa palestrante não encontrada' }); 
}
  await requisicao.writeFile(talkersPath, JSON.stringify(talkers));
 return res.status(200).json(talkers[removerTalker]);
});
// O endpoint deverá deletar a pessoa palestrante com o id informado na rota.
// A requisição deve ter o token de autenticação nos headers, no campo authorization.
const deletarUsuario = async (id) => {
  const talkers = await handleUser();
  const removerTalker = talkers.filter((usuario) => usuario.id !== Number(id));
  await requisicao.writeFile(talkersPath, JSON.stringify(removerTalker));
  return removerTalker;
};
const validandoId = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: 'Token não encontrado' });
  if (token.length !== 16) return res.status(401).json({ message: 'Token inválido' });
  next();
};
app.delete('/talker/:id', validandoId, async (req, res) => {
  const { id } = req.params;
  await deletarUsuario(id);
  return res.status(204).json();
});