const Imposto = require('../models/Imposto');
const Venda = require('../models/Venda');
const Compra = require('../models/Compra');
const ItemVenda = require('../models/ItemVenda');
const Produto = require('../models/Produto');
const Receita = require('../models/Receita');
const moment = require('moment');

class DashboardController {
  async index(req, res) {
    return res.render("menu/dashboard", { title: 'Dashboard' });
  }

  async start(req, res) {
    req.session.destroy()

    return res.render("menu/start", { title: 'Início' });
  }

  async listarDashboard(req, res) {
    //Data Inicial e Final para filtro
    var dataInicial = new Date();
    var dataFinal = new Date()
    dataInicial.setDate(dataInicial.getDate() - 30)

    dataInicial = formataData(dataInicial)
    dataFinal = formataData(dataFinal)

    //Impostos 
    const date = new Date();
    const date30 = new Date()
    date30.setDate(date30.getDate() - 30);
    const dtInicialMoment = moment(date30, "DD/MM/YYYY");
    const dtFinalMoment = moment(date, "DD/MM/YYYY H:mm:ss");

    //Vendas
    try {
      var vendas = await Venda.aggregate([
        {
          $match: {
            data: { $gte: dtInicialMoment._d, $lt: dtFinalMoment._d }
          }
        },
        {
          $group: {
            _id: "$data",
            "data": { $first: "$data" },
            totalVenda: { $sum: "$valorTotal" }
          }
        },
        { $sort: { _id: 1 } }
      ])
      // return res.render('menu/dashboard', { vendas, title: 'Dashboard' })
    } catch (erro1) {
      console.error(erro1);
      res.sendStatus(500).end();
    }

    //Compras
    try {
      var compras = await Compra.aggregate([
        {
          $match: {
            data: { $gte: dtInicialMoment._d, $lt: dtFinalMoment._d }
          }
        },
        {
          $group: {
            _id: "$data",
            "data": { $first: "$data" },
            totalCompra: { $sum: "$valorTotal" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    } catch (erro2) {
      console.error(erro2);
      res.sendStatus(500).end();
    }

    //Produtos mais vendidos
    try {
      let VetProdutos = []

      var vendasProduto = await Venda.find({
        data: {
          $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
        }
      })

      for (let i = 0; i < vendasProduto.length; i++) {
        var itemVendas = await ItemVenda.find({
          venda: vendasProduto[i]
        })


        for (let j = 0; j < itemVendas.length; j++) {
          var objVenda = {}
          if (VetProdutos.length <= 0) {
            objVenda.id = itemVendas[j].produto
            objVenda.quantidade = itemVendas[j].quantidade
            VetProdutos.push(objVenda)
          } else {
            let achou = false
            for (let k = 0; k < VetProdutos.length; k++) {
              if (itemVendas[j].produto.toString() == VetProdutos[k].id.toString()) {
                achou = true
                VetProdutos[k].quantidade += itemVendas[j].quantidade
              }
            }

            if (!achou) {
              objVenda.id = itemVendas[j].produto
              objVenda.quantidade = itemVendas[j].quantidade
              VetProdutos.push(objVenda)
            }
          }
        }
      }

      //Ordenação decrescente
      VetProdutos.sort(function (a, b) {
        return b.quantidade - a.quantidade
      })

      for (let i = 0; i < VetProdutos.length; i++) {
        const produto = await Produto.findById(VetProdutos[i].id)
        const receita = await Receita.findById(produto.receita)

        if (receita) {
          VetProdutos[i].receita = receita.nome
        }
      }

      //Pega 5 itens
      var VetProdutosAux = []
      for (let i = 0; i < 5; i++) {
        if (i < VetProdutos.length) {
          VetProdutosAux.push(VetProdutos[i])
        }
      }

    } catch (erro3) {
      console.error(erro3);
      res.sendStatus(500).end();
    }

    try {
      const impostos = await Imposto.aggregate([
        {
          $match: {
            dataPgto: { $gte: dtInicialMoment._d, $lt: dtFinalMoment._d }
          }
        },
        {
          $group: {
            _id: "$dataPgto",
            "dataPgto": { $first: "$dataPgto" },
            total: { $sum: "$valorTotal" }
          }
        },
        { $sort: { _id: 1 } }
      ])

      // const usuario = req.session.usuario.nome
      console.log('Sessão')
      console.log(req.session)
      // console.log(req.session.usuario)
      // console.log(req.session.usuario.nome)


      const usuarioNome = 'Teste'// req.session.usuario.nome
      return res.render('menu/dashboard', { impostos, vendas, compras, dataInicial, dataFinal, usuarioNome, receitas: JSON.stringify(VetProdutosAux), title: 'Dashboard' })
    } catch (erro4) {
      console.error(erro4);
      res.sendStatus(500).end();
    }
  }

  async indexFilter(req, res) {
    var { dataInicial, dataFinal } = req.body;
    const dtInicialMoment = moment(dataInicial, "DD/MM/YYYY");
    const dtFinalMoment = moment(dataFinal, "DD/MM/YYYY H:mm:ss");

    //Vendas
    try {
      var vendas = await Venda.aggregate([
        {
          $match: {
            data: { $gte: dtInicialMoment._d, $lt: dtFinalMoment._d }
          }
        },
        {
          $group: {
            _id: "$data",
            "data": { $first: "$data" },
            totalVenda: { $sum: "$valorTotal" }
          }
        },
        { $sort: { _id: 1 } }
      ])

    } catch (erro1) {
      console.error(erro1);
      res.sendStatus(500).end();
    }

    //Compras
    try {
      var compras = await Compra.aggregate([
        {
          $match: {
            data: { $gte: dtInicialMoment._d, $lt: dtFinalMoment._d }
          }
        },
        {
          $group: {
            _id: "$data",
            "data": { $first: "$data" },
            totalCompra: { $sum: "$valorTotal" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    } catch (erro2) {
      console.error(erro2);
      res.sendStatus(500).end();
    }

    //Produtos mais vendidos
    try {
      let VetProdutos = []

      var vendasProduto = await Venda.find({
        data: {
          $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
        }
      })

      for (let i = 0; i < vendasProduto.length; i++) {
        var itemVendas = await ItemVenda.find({
          venda: vendasProduto[i]
        })


        for (let j = 0; j < itemVendas.length; j++) {
          var objVenda = {}
          if (VetProdutos.length <= 0) {
            objVenda.id = itemVendas[j].produto
            objVenda.quantidade = itemVendas[j].quantidade
            VetProdutos.push(objVenda)
          } else {
            let achou = false
            for (let k = 0; k < VetProdutos.length; k++) {
              if (itemVendas[j].produto.toString() == VetProdutos[k].id.toString()) {
                achou = true
                VetProdutos[k].quantidade += itemVendas[j].quantidade
              }
            }

            if (!achou) {
              objVenda.id = itemVendas[j].produto
              objVenda.quantidade = itemVendas[j].quantidade
              VetProdutos.push(objVenda)
            }
          }
        }
      }

      //Ordenação decrescente
      VetProdutos.sort(function (a, b) {
        return b.quantidade - a.quantidade
      })

      for (let i = 0; i < VetProdutos.length; i++) {
        const produto = await Produto.findById(VetProdutos[i].id)
        const receita = await Receita.findById(produto.receita)

        if (receita) {
          VetProdutos[i].receita = receita.nome
        }
      }

      //Pega 5 itens
      var VetProdutosAux = []
      for (let i = 0; i < 5; i++) {
        if (i < VetProdutos.length) {
          VetProdutosAux.push(VetProdutos[i])
        }
      }

    } catch (erro3) {
      console.error(erro3);
      res.sendStatus(500).end();
    }

    try {
      const impostos = await Imposto.aggregate([
        {
          $match: {
            dataPgto: { $gte: dtInicialMoment._d, $lt: dtFinalMoment._d }
          }
        },
        {
          $group: {
            _id: "$dataPgto",
            "dataPgto": { $first: "$dataPgto" },
            total: { $sum: "$valorTotal" }
          }
        },
        { $sort: { _id: 1 } }
      ])

      const usuario = req.session.usuario.nome
      console.log('Sessão')
      console.log(req.session)
      return res.render('menu/dashboard', { impostos, vendas, compras, dataInicial, dataFinal, usuario, receitas: JSON.stringify(VetProdutosAux), title: 'Dashboard' })
    } catch (erro4) {
      console.error(erro4);
      res.sendStatus(500).end();
    }
  }

}

function formataData(data) {
  var dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
  var mes = data.getMonth() + 1;
  mes = mes < 10 ? '0' + mes : mes;
  var ano = data.getFullYear();
  return dia + '/' + mes + '/' + ano
}

module.exports = new DashboardController();
