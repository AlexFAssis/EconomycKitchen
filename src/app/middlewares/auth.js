module.exports = (req, res, next) => {
  console.log('AUTH')
  console.log(req.session)
  console.log('Usuário Sessão Auth')
  console.log(req.session.usuario)
  if (req.session && req.session.usuario) {
    /*
      res.locals.user = Faz com que todas as páginas do nunjucks
      possam acessar as propriedades da variavel user
    */

    //usado em todos arquivos .njk
    res.locals.usuario = req.session.usuario;

    return next();
  }

  return res.redirect('/usuario/login')
}