const express = require('express');
const routes = express.Router();
const multerConfig = require('./config/multer')
const upload = require('multer')(multerConfig)
// const validate = require('express-validation');

const authMiddleware = require('./app/middlewares/auth');
const guestMiddleware = require('./app/middlewares/guest');

const controllers = require('./app/controllers'); //require-dir
// const validators = require('./app/validators'); //require-dir

routes.use((req, res, next) => {
  res.locals.flashSuccess = req.flash('success')
  res.locals.flashError = req.flash('error')

  return next()
})

//Todas as rotas que comecem com (/...) utilizarão o middleware
routes.use('/categoriaReceita', authMiddleware)
routes.use('/compra', authMiddleware)
routes.use('/imposto', authMiddleware)
routes.use('/tipoImposto', authMiddleware)
routes.use('/insumo', authMiddleware)
routes.use('/produto', authMiddleware)
routes.use('/receita', authMiddleware)
routes.use('/receitaPorDia', authMiddleware)
routes.use('/venda', authMiddleware)
routes.use('/estoque', authMiddleware)
routes.use('/dicas', authMiddleware)

//Verificação de erros
// const  = require('express-async-r');
routes.get('/files/:file', controllers.fileController.mostrar)

routes.get('/categoriaReceita/cadastro', controllers.categoriaReceita.index);
routes.get('/categoriaReceita/listar', controllers.categoriaReceita.listar);
routes.get('/categoriaReceita/:id', controllers.categoriaReceita.obterUm);
routes.post('/categoriaReceita', controllers.categoriaReceita.novo);
routes.get('/categoriaReceita/editar/:id', controllers.categoriaReceita.editar);
routes.post('/categoriaReceita/editar/:id', controllers.categoriaReceita.atualizar);
routes.post('/categoriaReceita/deletar/:id', controllers.categoriaReceita.excluir);

routes.get('/compra/cadastro', controllers.compra.index);
routes.get('/compra/listar', controllers.compra.listar);
routes.get('/compra/:id', controllers.compra.obterUm);
routes.post('/compra', controllers.compra.novo);
routes.get('/compra/editar/:id', controllers.compra.editar);
routes.post('/compra/editar/:id', controllers.compra.atualizar);
routes.post('/compra/deletar/:id', controllers.compra.excluir);
routes.post("/compra/listar", controllers.compra.indexFilter);

routes.get('/imposto/cadastro', controllers.imposto.index);
routes.get('/imposto/listar', controllers.imposto.listar);
routes.get('/imposto/:id', controllers.imposto.obterUm);
routes.post('/imposto', controllers.imposto.novo);
routes.get('/imposto/editar/:id', controllers.imposto.editar);
routes.post('/imposto/editar/:id', controllers.imposto.atualizar);
routes.post('/imposto/deletar/:id', controllers.imposto.excluir);

routes.get('/tipoImposto/cadastro', controllers.tipoImposto.index);
routes.get('/tipoImposto/listar', controllers.tipoImposto.listar);
routes.get('/tipoImposto/:id', controllers.tipoImposto.obterUm);
routes.post('/tipoImposto', controllers.tipoImposto.novo);
routes.get('/tipoImposto/editar/:id', controllers.tipoImposto.editar);
routes.post('/tipoImposto/editar/:id', controllers.tipoImposto.atualizar);
routes.post('/tipoImposto/deletar/:id', controllers.tipoImposto.excluir);

routes.get('/insumo/cadastro', controllers.insumo.index);
routes.get('/insumo/listar', controllers.insumo.listar);
routes.get('/insumo/listarTodos', controllers.insumo.listarTodos);
routes.get('/insumo/:id', controllers.insumo.obterUm);
routes.post('/insumo', controllers.insumo.novo);
routes.get('/insumo/editar/:id', controllers.insumo.editar);
routes.post('/insumo/editar/:id', controllers.insumo.atualizar);
routes.post('/insumo/deletar/:id', controllers.insumo.excluir);

routes.get('/produto/cadastro', controllers.produto.index);
routes.get('/produto/listar', controllers.produto.listar);
routes.get('/produto/:id', controllers.produto.obterUm);
routes.post('/produto', controllers.produto.novo);
routes.get('/produto/editar/:id', controllers.produto.editar);
routes.post('/produto/editar/:id', controllers.produto.atualizar);
routes.post('/produto/deletar/:id', controllers.produto.excluir);

routes.get('/receita/cadastro', controllers.receita.index);
routes.get('/receita/historicoPreco', controllers.receita.historicoPreco);
routes.post('/receita/historicoPreco/:receita&:dtInicial&:dtFinal', controllers.receita.historicoPrecoPorReceita);
routes.get('/receita/mediaPreco', controllers.receita.mediaPrecosReceitaDespesa);
routes.post('/receita/mediaPreco/:dtInicial&:dtFinal', controllers.receita.obterMediaPrecosReceitaDespesa);
routes.get('/receita/calcularMedia/:id', controllers.receita.calcularMedia);
routes.get('/receita/calcularMediaLogin/', controllers.receita.calcularMediaLogin);
routes.get('/receita/listar', controllers.receita.listar);
routes.get('/receita/:id', controllers.receita.obterUm);
routes.post('/receita', upload.single('imgReceita'), controllers.receita.novo);
routes.get('/receita/editar/:id', controllers.receita.editar);
routes.post('/receita/editar/:id', upload.single('imgReceita'), controllers.receita.atualizar);
routes.post('/receita/deletar/:id', controllers.receita.excluir);

routes.get('/receitaPorDia/cadastro', controllers.receitaPorDia.index);
routes.get('/receitaPorDia/listar', controllers.receitaPorDia.listar);
routes.get('/receitaPorDia/:id', controllers.receitaPorDia.obterUm);
routes.post('/receitaPorDia', controllers.receitaPorDia.novo);
routes.get('/receitaPorDia/editar/:id', controllers.receitaPorDia.editar);
routes.post('/receitaPorDia/editar/:id', controllers.receitaPorDia.atualizar);
routes.post('/receitaPorDia/deletar/:id', controllers.receitaPorDia.excluir);
routes.post('/receitaPorDia/listar', controllers.receitaPorDia.indexFilter);

// Sem auth ou guest
// routes.get('/usuario/cadastro', controllers.usuario.cadastro);
// routes.get('/usuario/cadastroLogin', controllers.usuario.cadastroLogin);
// routes.get('/usuario/listar', controllers.usuario.listar);
// routes.get('/usuario/login', controllers.usuario.login);
// routes.post('/usuario/validacao', controllers.usuario.validacao);
// routes.get('/usuario/:id', controllers.usuario.obterUm);
// routes.post('/usuario', controllers.usuario.novo);
// routes.post('/usuarioLogin', controllers.usuario.novoLogin);
// routes.get('/usuario/editar/:id', controllers.usuario.editar);
// routes.post('/usuario/editar/:id', controllers.usuario.atualizar);
// routes.post('/usuario/deletar/:id', controllers.usuario.excluir);

// Com auth e guest
routes.get('/usuario/cadastro', authMiddleware, controllers.usuario.cadastro);
routes.get('/usuario/cadastroLogin', guestMiddleware, controllers.usuario.cadastroLogin);
routes.get('/usuario/listar', authMiddleware, controllers.usuario.listar);
routes.get('/usuario/login', guestMiddleware, controllers.usuario.login);
routes.get('/usuario/logout', controllers.usuario.logout);
routes.post('/usuario/validacao', guestMiddleware, controllers.usuario.validacao);
routes.get('/usuario/:id', authMiddleware, controllers.usuario.obterUm);
routes.post('/usuario', authMiddleware, controllers.usuario.novo);
routes.post('/usuarioLogin', guestMiddleware, controllers.usuario.novoLogin);
routes.get('/usuario/editar/:id', authMiddleware, controllers.usuario.editar);
routes.post('/usuario/editar/:id', authMiddleware, controllers.usuario.atualizar);
routes.post('/usuario/deletar/:id', authMiddleware, controllers.usuario.excluir);

routes.get('/venda/cadastro', controllers.venda.index);
routes.get('/venda/listar', controllers.venda.listar);
routes.get('/venda/:id', controllers.venda.obterUm);
routes.post('/venda', controllers.venda.novo);
routes.get('/venda/editar/:id', controllers.venda.editar);
routes.post('/venda/editar/:id', controllers.venda.atualizar);
routes.post('/venda/deletar/:id', controllers.venda.excluir);
routes.post("/venda/listar", controllers.venda.indexFilter);

// routes.get('/estoque/listar', authMiddleware, controllers.estoque.listar);
// routes.get('/dicas/instrucoes', authMiddleware, controllers.dicas.instrucoes);
routes.get('/estoque/listar', controllers.estoque.listar);
routes.get('/dicas/instrucoes', controllers.dicas.instrucoes);

routes.get("/app/dashboard", authMiddleware, controllers.DashboardController.listarDashboard);
routes.post('/app/dashboard', authMiddleware, controllers.DashboardController.indexFilter);

routes.get("/", guestMiddleware, controllers.DashboardController.start);
//wrong
// routes.get("/", authMiddleware, controllers.DashboardController.start);

routes.get("/app/dashboard", controllers.DashboardController.listarDashboard);
routes.post('/app/dashboard', controllers.DashboardController.indexFilter);
routes.get("/", controllers.DashboardController.start);

module.exports = routes;