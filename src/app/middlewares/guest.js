module.exports = (req, res, next) => {

  console.log('GUEST')
  console.log(req.session)
  console.log('Usuário Sessão')
  console.log(req.session.usuario)

  if (req.session && !req.session.usuario) {
    return next();
  }

  return res.redirect('../app/dashboard')
}