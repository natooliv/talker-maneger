
const VALIDADE_EMAIL = (req, res, next) => {


  const { email } = req.body;
  
  if (!email) {
    return res.status(400)
    .json({ message: 'O campo "email" é obrigatório' });
  }

  const formatoEmail = email.match(/^[a-z0-9.]+@[a-z0-9]+\.[a-z]/i);
  
  if (!formatoEmail) {
    return res.status(400)
    .json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

 next();
};

const VALIDADE_SENHA = (req, res, next) => {
  const { password} = req.body;

  if (!password || password.trim() === '') {
    return res.status(400)
    .json({
      message: 'O campo "password" é obrigatório',
    });
  }

  if (password.length > 0 && password.length < 6) {
    return res.status(400)
    .json({
      message: 'O "password" deve ter pelo menos 6 caracteres',
    });
  }

   next();
};

module.exports = { 
  VALIDADE_EMAIL,
  VALIDADE_SENHA,
};
