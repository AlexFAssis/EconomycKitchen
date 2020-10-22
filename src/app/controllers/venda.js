const Venda = require('../models/Venda');
const ItemVenda = require('../models/ItemVenda');
const Usuario = require('../models/Usuario');
const Produto = require('../models/Produto');
const Estoque = require('../models/Estoque');
const Receita = require('../models/Receita');
const moment = require('moment');

class vendaController {
    async index(req, res) {
        const usuarios = await Usuario.find()
        const produtos = await Produto.find().populate('receita')

        var data = new Date();
        var dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
        var mes = data.getMonth() + 1;
        mes = mes < 10 ? '0' + mes : mes;
        var ano = data.getFullYear();
        var dataVenda = dia + '/' + mes + '/' + ano

        return res.render('venda/cadastro', { usuarios, produtos, dataVenda, title: 'Cadastro de Venda' })
    }

    async novo(req, res) {
        console.log(req.body)

        try {
            let vetError = [];
            let passou = false;
            let criou = false;

            var data = moment(formatDate(req.body.data))

            if (req.body.valorTotal <= 0) {
                passou = true;
                vetError.push('Valor da venda inválido');
            }

            if (req.body.metodoPagamento == 'Credito' && req.body.qtdeParcelas > 1 && req.body.valorTotal < 50) {
                passou = true;
                vetError.push('Vendas com valor menor que R$50,00 não podem ser parceladas');
            }

            if (req.body.quantidade == undefined) {
                passou = true;
                vetError.push('Informe itens para a venda')
            } else {
                if (typeof req.body.quantidade != 'object') {
                    if (req.body.quantidade <= 0) {
                        passou = true;
                        vetError.push('Informe o quantidade do item')
                    }
                } else {
                    ///
                    ///
                    //Não precisa
                    for (let i = 0; i < req.body.quantidade.length; i++) {
                        if (req.body.quantidade[i] <= 0) {
                            passou = true;
                            vetError.push('Informe a quantidade para o item: ' + i);
                        }
                    }
                }
            }

            if (passou) {
                req.flash('error', vetError)
                return res.redirect('/venda/cadastro');
            } else {
                let descontoAux = 0;
                if (req.body.desconto) {
                    descontoAux = req.body.desconto.replace(/\./, '')
                    descontoAux = descontoAux.replace(/\,/, '.')
                    descontoAux = parseFloat(descontoAux)
                }

                await Venda.create({ valorTotal: req.body.valorTotal, data: data, desconto: descontoAux, usuario: req.body.usuario, metodoPagamento: req.body.metodoPagamento, controle: 0 }, async function (err, newObj) {
                    if (err) {
                        throw err;
                    } else if (!newObj) {
                        throw new Error("Objeto não encontrado")
                    } else {
                        criou = true;
                        var total = req.body.valor.length;

                        if (typeof req.body.produto != 'object') {
                            try {
                                await ItemVenda.create({ valor: req.body.valor, quantidade: req.body.quantidade, produto: req.body.produto, venda: newObj._id });

                                const produto = await Produto.findById(req.body.produto)
                                const receita = await Receita.findById(produto.receita)
                                const estoque = await Estoque.find({ receita: receita._id })

                                var achouEstoque = false

                                if (estoque.length > 0) {
                                    for (let j = 0; j < estoque.length; j++) {
                                        if (estoque[j].receita.toString() == receita.id.toString()) {
                                            achouEstoque = true
                                            if (parseFloat(estoque[j].quantidade) >= parseFloat(req.body.quantidade)) {
                                                const estoqueUpdate = parseFloat(estoque[j].quantidade) - parseFloat(req.body.quantidade)
                                                await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })
                                                break;
                                            } else {
                                                req.flash('error', 'Item não possui estoque')
                                                await Venda.findByIdAndDelete(newObj._id)
                                                await ItemVenda.findOneAndDelete({ venda: newObj._id })
                                                return res.redirect('/venda/cadastro');
                                            }
                                        }
                                    }
                                }

                                if (!achouEstoque) {
                                    req.flash('error', 'Item não possui estoque')
                                    await Venda.findByIdAndDelete(newObj._id)
                                    await ItemVenda.findOneAndDelete({ venda: newObj._id })
                                    return res.redirect('/venda/cadastro');
                                }

                                criou = true;
                            } catch (erro) {
                                criou = false;
                                console.error(erro);
                                res.sendStatus(500).end();
                            }

                            if (criou) {
                                return res.redirect('/venda/listar');
                            } else {
                                req.flash('error', 'Ocorreu um erro ao cadastrar a venda')
                                return res.redirect('/venda/cadastro')
                            }
                        } else {
                            var vetEstoqueItens = []
                            var produtoSemEstoque = false
                            var vetProdutoSemEstoque = []

                            for (let i = 0; i < total; i++) {
                                try {
                                    await ItemVenda.create({ valor: parseFloat(req.body.valor[i]), quantidade: parseInt(req.body.quantidade[i]), produto: req.body.produto[i], venda: newObj._id });
                                    const produto = await Produto.findById(req.body.produto[i])
                                    const receita = await Receita.findById(produto.receita)
                                    const nomeReceita = receita.nome
                                    const estoque = await Estoque.find({ receita: receita._id })

                                    if (estoque.length > 0) {
                                        for (let j = 0; j < estoque.length; j++) {
                                            var objVenda = {}
                                            var achou = false
                                            if (vetEstoqueItens.length <= 0) {
                                                objVenda.id = produto
                                                objVenda.quantidade = req.body.quantidade[i]
                                                objVenda.receita = receita
                                                objVenda.produto = nomeReceita
                                                vetEstoqueItens.push(objVenda)
                                                achou = true
                                            } else {
                                                for (let j = 0; j < vetEstoqueItens.length; j++) {
                                                    if (produto.toString() == vetEstoqueItens[j].id.toString()) {
                                                        achou = true
                                                        vetEstoqueItens[j].quantidade = parseFloat(vetEstoqueItens[j].quantidade) + parseFloat(req.body.quantidade[i])
                                                    }
                                                }
                                            }

                                            if (!achou) {
                                                objVenda.id = produto
                                                objVenda.quantidade = req.body.quantidade[i]
                                                objVenda.receita = receita
                                                objVenda.produto = nomeReceita
                                                vetEstoqueItens.push(objVenda)
                                            }
                                        }
                                    } else {
                                        vetProdutoSemEstoque.push(nomeReceita)
                                        produtoSemEstoque = true
                                    }
                                } catch (erro) {
                                    console.error(erro);
                                    res.sendStatus(500).end();
                                }
                            }

                            //verifica estoque
                            var achouEstoque = true
                            var vetItensSemEstoque = []

                            if (vetEstoqueItens.length > 0) {
                                for (let i = 0; i < vetEstoqueItens.length; i++) {

                                    const estoque = await Estoque.find({ receita: vetEstoqueItens[i].receita })

                                    if (estoque.length > 0) {
                                        for (let j = 0; j < estoque.length; j++) {
                                            if (estoque[j].quantidade < vetEstoqueItens[i].quantidade) {
                                                achouEstoque = false
                                                vetItensSemEstoque.push('O produto ' + vetEstoqueItens[i].produto + ' não possui essa quantidade em estoque')
                                            }
                                        }
                                    } else {
                                        achouEstoque = false
                                        vetItensSemEstoque.push('O produto ' + vetEstoqueItens[i].produto + ' não possui estoque')
                                    }
                                }
                            } else {
                                achouEstoque = false
                                vetItensSemEstoque.push('Os produtos informados não possuem estoque')
                            }

                            if (produtoSemEstoque) {
                                if (vetProdutoSemEstoque.length > 0) {
                                    vetItensSemEstoque = []
                                }

                                for (let i = 0; i < vetProdutoSemEstoque.length; i++) {
                                    vetItensSemEstoque.push('O produto ' + vetProdutoSemEstoque[i] + ' não possui estoque')
                                }
                            }

                            if (!achouEstoque || produtoSemEstoque) {
                                await Venda.findByIdAndDelete(newObj._id)
                                await ItemVenda.remove({ venda: newObj._id })

                                req.flash('error', vetItensSemEstoque)
                                return res.redirect('/venda/cadastro');
                            }

                        }

                        for (let i = 0; i < total; i++) {
                            const produto = await Produto.findById(req.body.produto[i])
                            const receita = await Receita.findById(produto.receita)
                            const estoque = await Estoque.find({ receita: receita._id })

                            for (let j = 0; j < estoque.length; j++) {
                                if (estoque[j].receita.toString() == receita.id.toString()) {
                                    const estoqueUpdate = parseFloat(estoque[j].quantidade) - parseFloat(req.body.quantidade[i])
                                    await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })

                                    criou = true;
                                }
                            }
                        }

                        if (criou) {
                            return res.redirect('/venda/listar');
                        } else {
                            req.flash('error', 'Ocorreu um erro ao cadastrar a venda')
                            return res.redirect('/venda/cadastro')
                        }
                    }
                })
            }

        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listar(req, res) {
        try {
            const vendas = await Venda.find()
                .populate('usuario').sort({ data: 'desc' })

            const tipoUsuario = req.session.usuario.tipo
            console.log(tipoUsuario)
            return res.render('venda/listagem', { vendas, tipoUsuario: tipoUsuario, title: 'Listagem de Venda' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const venda = await Venda.findById(id);
            if (venda) {
                res.send(venda);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const venda = await Venda.findOne({ _id: req.params.id });
        const itensVenda = await ItemVenda.find({ venda: req.params.id })
        const produtos = await Produto.find().populate('receita')
        const dataVenda = formataData(venda.data)
        const usuarios = await Usuario.find()

        const vetIdProdutos = []
        for (let i = 0; i < itensVenda.length; i++) {
            vetIdProdutos.push(itensVenda[i].produto)
        }

        if (venda) {
            return res.render('venda/editar', { venda, dataVenda, usuarios, itensVenda, produtos, vetIdProdutos, controle: 1, title: 'Edição de Venda' })
        } else {
            console.error('Venda não encontrada')
        }

    }

    async atualizar(req, res) {
        const id = req.params.id;
        var criou = false;
        var passou = false;
        var valorTotal = req.body.valorTotal.replace(/,/g, ".")
        var vetError = [];

        try {
            const data = moment(formatDate(req.body.data))

            if (req.body.valorTotal <= 0) {
                passou = true;
                vetError.push('Valor da venda inválido');
            }

            if (req.body.metodoPagamento == 'Credito' && req.body.qtdeParcelas > 1 && valorTotal < 50) {
                passou = true;
                vetError.push('Vendas com valor menor que R$50,00 não podem ser parceladas');
            }

            if (passou) {
                return res.redirect(`/venda/editar/${id}`);
            } else {

                let descontoAux = 0;
                if (req.body.desconto) {
                    descontoAux = req.body.desconto.replace(/\./, '')
                    descontoAux = descontoAux.replace(/\,/, '.')
                    descontoAux = parseFloat(descontoAux)
                }

                const venda = await Venda.findByIdAndUpdate(id, { data: data._d, valorTotal: valorTotal, metodoPagamento: req.body.metodoPagamento, qtdeParcelas: req.body.qtdeParcelas, desconto: descontoAux, usuario: req.body.usuario });
                var estoqueItens = await ItemVenda.find({ venda: venda._id })
                var vetEstoqueItens = []

                if (estoqueItens.length > 0) {
                    for (let i = 0; i < estoqueItens.length; i++) {
                        var achou = false
                        var objVenda = {}

                        if (vetEstoqueItens.length <= 0) {
                            objVenda.id = estoqueItens[i].produto
                            objVenda.quantidade = estoqueItens[i].quantidade
                            vetEstoqueItens.push(objVenda)
                            achou = true
                        } else {
                            for (let j = 0; j < vetEstoqueItens.length; j++) {
                                if (estoqueItens[i].produto.toString() == vetEstoqueItens[j].id.toString()) {
                                    achou = true
                                    vetEstoqueItens[j].quantidade += estoqueItens[i].quantidade
                                }
                            }
                        }

                        if (!achou) {
                            objVenda.id = estoqueItens[i].produto
                            objVenda.quantidade = estoqueItens[i].quantidade
                            vetEstoqueItens.push(objVenda)
                        }
                    }
                }

                // await ItemVenda.remove({ venda: venda._id })

                if (req.body.valor != undefined) {
                    var total = req.body.valor.length;

                    if (typeof req.body.produto != 'object') {
                        try {
                            let valorItem = req.body.valor.replace(/,/g, ".")
                            // await ItemVenda.create({quantidade: req.body.quantidade, produto: req.body.produto, valor: valorItem, venda: venda._id });
                            const produto = await Produto.findById(req.body.produto)
                            const receita = await Receita.findById(produto.receita)
                            const estoque = await Estoque.find({ receita: receita._id })
                            var estoqueUpdate = 0
                            var diferencaEstoque = 0

                            if (estoque.length > 0) {
                                //capturar valor antigo da venda e calcular
                                for (let i = 0; i < vetEstoqueItens.length; i++) {
                                    if (req.body.produto.toString() == vetEstoqueItens[i].id.toString()) {
                                        diferencaEstoque = vetEstoqueItens[i].quantidade - req.body.quantidade
                                        vetEstoqueItens[i].quantidade = 0;
                                        estoqueUpdate = estoque[0].quantidade + diferencaEstoque
                                        break
                                    }
                                }
                            } else {
                                req.flash('error', 'Item não possui estoque')
                                return res.redirect(`/venda/editar/${id}`);
                                // if (req.body.produto.toString() == estoque[0].receita.toString()) {
                                //     estoqueUpdate = estoque[0].quantidade - req.body.quantidade
                                // } else {
                                //     /////Ver se é realmente possível no final dos testes
                                //     await Estoque.create({ quantidade: parseFloat(req.body.quantidade) * -1, receita: req.body.produto });
                                // }
                            }

                            await ItemVenda.remove({ venda: venda._id })
                            await ItemVenda.create({ quantidade: req.body.quantidade, produto: req.body.produto, valor: valorItem, venda: venda._id });
                            await Estoque.findByIdAndUpdate(estoque[0]._id, { quantidade: estoqueUpdate })

                            criou = true;
                        } catch (erro) {
                            criou = false;
                            console.error(erro);
                            res.sendStatus(500).end();
                        }

                        if (criou) {
                            return res.redirect('/venda/listar');
                        } else {
                            req.flash('error', 'Ocorreu um erro ao cadastrar a venda')
                            return res.redirect('/venda/cadastro')
                        }
                    } else {

                        //Acumular itens antigos para dar baixa no estoque
                        const itensVenda = await ItemVenda.find({ venda: venda._id })
                        var vetItensVendaOld = []

                        for (let i = 0; i < itensVenda.length; i++) {
                            const produtoOld = await Produto.findById(itensVenda[i].produto)
                            const receitaOld = await Receita.findById(produtoOld.receita)
                            const produtoNomeOld = receitaOld.nome;

                            var objVendaOld = {}
                            var achou = false

                            if (vetItensVendaOld.length <= 0) {
                                objVendaOld.id = itensVenda[i].produto
                                objVendaOld.quantidade = itensVenda[i].quantidade
                                objVendaOld.receita = receitaOld._id
                                objVendaOld.produto = produtoNomeOld
                                vetItensVendaOld.push(objVendaOld)
                                achou = true
                            } else {
                                for (let j = 0; j < vetItensVendaOld.length; j++) {
                                    if (produtoOld._id.toString() == vetItensVendaOld[j].id.toString()) {
                                        achou = true
                                        vetItensVendaOld[j].quantidade = parseFloat(vetItensVendaOld[j].quantidade) + parseFloat(itensVenda[i].quantidade)
                                    }
                                }
                            }

                            if (!achou) {
                                objVendaOld.id = itensVenda[i].produto
                                objVendaOld.quantidade = itensVenda[i].quantidade
                                objVendaOld.receita = receitaOld._id
                                objVendaOld.produto = produtoNomeOld
                                vetItensVendaOld.push(objVendaOld)
                            }
                        }

                        //Acumula itens do body para verificação de estoque
                        var vetEstoqueItens = []

                        for (let i = 0; i < total; i++) {
                            const produto = await Produto.findById(req.body.produto[i])
                            const receita = await Receita.findById(produto.receita)
                            const produtoNome = receita.nome;

                            var objVenda = {}
                            var achou = false
                            if (vetEstoqueItens.length <= 0) {
                                objVenda.id = produto._id
                                objVenda.quantidade = req.body.quantidade[i]
                                objVenda.receita = receita._id
                                objVenda.produto = produtoNome
                                vetEstoqueItens.push(objVenda)
                                achou = true
                            } else {
                                for (let j = 0; j < vetEstoqueItens.length; j++) {
                                    if (produto._id.toString() == vetEstoqueItens[j].id.toString()) {
                                        achou = true
                                        vetEstoqueItens[j].quantidade = parseFloat(vetEstoqueItens[j].quantidade) + parseFloat(req.body.quantidade[i])
                                    }
                                }
                            }

                            if (!achou) {
                                objVenda.id = produto._id
                                objVenda.quantidade = req.body.quantidade[i]
                                objVenda.receita = receita._id
                                objVenda.produto = produtoNome
                                vetEstoqueItens.push(objVenda)
                            }
                        }

                        //Volta os itens antigos para o estoque
                        for (let j = 0; j < vetItensVendaOld.length; j++) {
                            const estoque = await Estoque.find()

                            for (let k = 0; k < estoque.length; k++) {
                                if (estoque[k].receita.toString() == vetItensVendaOld[j].receita.toString()) {
                                    let diferencaEstoque = estoque[k].quantidade + vetItensVendaOld[j].quantidade
                                    await Estoque.findByIdAndUpdate(estoque[k]._id, { quantidade: diferencaEstoque })
                                }
                            }
                        }

                        //verifica estoque
                        var achouEstoque = true
                        var vetItensSemEstoque = []
                        for (let i = 0; i < vetEstoqueItens.length; i++) {

                            const estoque = await Estoque.find({ receita: vetEstoqueItens[i].receita })

                            if (estoque.length > 0) {
                                for (let j = 0; j < estoque.length; j++) {
                                    if (estoque[j].quantidade < vetEstoqueItens[i].quantidade) {
                                        achouEstoque = false
                                        vetItensSemEstoque.push('O produto ' + vetEstoqueItens[i].produto + ' não possui estoque')
                                    }
                                }
                            } else {
                                achouEstoque = false
                                vetItensSemEstoque.push('O produto ' + vetEstoqueItens[i].produto + ' não possui estoque')
                            }
                        }

                        if (!achouEstoque) {
                            //Em caso de falta de estoque os itens antigos voltam a venda

                            for (let j = 0; j < vetItensVendaOld.length; j++) {
                                const estoque = await Estoque.find()

                                for (let k = 0; k < estoque.length; k++) {
                                    if (estoque[k].receita.toString() == vetItensVendaOld[j].receita.toString()) {
                                        let diferencaEstoque = estoque[k].quantidade - vetItensVendaOld[j].quantidade
                                        await Estoque.findByIdAndUpdate(estoque[k]._id, { quantidade: diferencaEstoque })
                                    }
                                }
                            }

                            req.flash('error', vetItensSemEstoque)
                            return res.redirect(`/venda/editar/${id}`);
                        }

                        await ItemVenda.remove({ venda: venda._id })

                        for (let i = 0; i < total; i++) {
                            try {
                                let valorItem = req.body.valor[i].replace(/,/g, ".")
                                await ItemVenda.create({ valor: valorItem, quantidade: req.body.quantidade[i], produto: req.body.produto[i], venda: venda._id });
                                const produto = await Produto.findById(req.body.produto[i])
                                const receita = await Receita.findById(produto.receita)
                                const estoque = await Estoque.find({ receita: receita._id })
                                var estoqueUpdate = 0

                                if (estoque.length > 0) {
                                    //capturar valor antigo da venda e calcular
                                    var diferencaEstoque = 0

                                    diferencaEstoque = req.body.quantidade[i]
                                    estoqueUpdate = estoque[0].quantidade - diferencaEstoque

                                    await Estoque.findByIdAndUpdate(estoque[0]._id, { quantidade: estoqueUpdate })

                                    criou = true;
                                }

                            }
                            catch (erro) {
                                criou = false;
                                console.error(erro);
                                res.sendStatus(500).end();
                            }

                        }
                    }
                }

                if (venda) {
                    res.redirect('/venda/listar')
                } else {
                    res.sendStatus(404).end();
                    console.error('Venda não atualizada')
                }
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async excluir(req, res) {
        const id = req.params.id;
        try {
            const venda = await Venda.findById(id);
            const itemVenda = await ItemVenda.find({ venda: id });

            if (itemVenda) {
                for (let i = 0; i < itemVenda.length; i++) {
                    const produto = await Produto.findById(itemVenda[i].produto)
                    const receita = await Receita.findById(produto.receita)
                    const estoque = await Estoque.find()

                    if (estoque.length > 0) {
                        for (let j = 0; j < estoque.length; j++) {
                            if (estoque[j].receita.toString() == receita.id.toString()) {
                                const estoqueUpdate = parseFloat(estoque[j].quantidade) + parseFloat(itemVenda[i].quantidade)
                                await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })
                                break;
                            }
                        }
                    }
                }
            }

            await ItemVenda.remove({ venda: venda._id })
            await Venda.findByIdAndDelete(id);
            if (venda) {
                res.redirect('/venda/listar');
            } else {
                res.sendStatus(404).end();
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500);
        }
    }

    async indexFilter(req, res) {
        const { dtInicial, dtFinal } = req.body;
        let vendas = {}

        if (dtInicial && dtFinal) {
            var dtInicialMoment = moment(dtInicial, "DD/MM/YYYY");
            var dtFinalMoment = moment(dtFinal, "DD/MM/YYYY");

            vendas = await Venda.find({
                data: {
                    $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
                }
            })
        } else {
            vendas = await Venda.find()
        }

        return res.render('venda/listagem', { vendas, dtInicial, dtFinal })
    }
}

function formatDate(stringData) {
    const dia = stringData.substring(0, 2)
    const mes = stringData.substring(3, 5)
    const ano = stringData.substring(6, 10)

    return ano + '-' + mes + '-' + dia
}

function formataData(data) {
    var dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
    var mes = data.getMonth() + 1;
    mes = mes < 10 ? '0' + mes : mes;
    var ano = data.getFullYear();

    dtFormatada = dia + '-' + mes + '-' + ano;

    return dtFormatada;
}

module.exports = new vendaController;