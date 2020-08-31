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
                                const estoque = await Estoque.find()

                                if (estoque.length > 0) {
                                    for (let j = 0; j < estoque.length; j++) {
                                        if (estoque[j].receita.toString() == receita.id.toString()) {
                                            if (parseFloat(estoque[j].quantidade) >= parseFloat(req.body.quantidade)) {
                                                const estoqueUpdate = parseFloat(estoque[j].quantidade) - parseFloat(req.body.quantidade)
                                                await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })
                                                break;
                                            } else {
                                                req.flash('error', 'Item não possui estoque')
                                                return res.redirect('/venda/cadastro');
                                            }
                                        }
                                    }
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
                            for (let i = 0; i < total; i++) {
                                try {
                                    await ItemVenda.create({ valor: parseFloat(req.body.valor[i]), quantidade: parseInt(req.body.quantidade[i]), produto: req.body.produto[i], venda: newObj._id });
                                    const produto = await Produto.findById(req.body.produto[i])
                                    const receita = await Receita.findById(produto.receita)
                                    const estoque = await Estoque.find()

                                    if (estoque.length > 0) {
                                        for (let j = 0; j < estoque.length; j++) {
                                            if (estoque[j].receita.toString() == receita.id.toString()) {
                                                if (parseFloat(estoque[j].quantidade) >= parseFloat(req.body.quantidade)) {
                                                    const estoqueUpdate = parseFloat(estoque[j].quantidade) - parseFloat(req.body.quantidade[i])
                                                    await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })
                                                    break;
                                                } else {
                                                    req.flash('error', 'Item não possui estoque')
                                                    return res.redirect('/venda/cadastro');
                                                }
                                            }
                                        }
                                    }

                                    criou = true;
                                } catch (erro) {
                                    criou = false;
                                    console.error(erro);
                                    res.sendStatus(500).end();
                                }
                            }

                            if (criou) {
                                return res.redirect('/venda/listar');
                            } else {
                                req.flash('error', 'Ocorreu um erro ao cadastrar a venda')
                                return res.redirect('/venda/cadastro')
                            }
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

                await ItemVenda.remove({ venda: venda._id })

                if (req.body.valor != undefined) {
                    var total = req.body.valor.length;

                    if (typeof req.body.produto != 'object') {
                        try {
                            let valorItem = req.body.valor.replace(/,/g, ".")
                            await ItemVenda.create({ valor: req.body.valor, quantidade: req.body.quantidade, produto: req.body.produto, valor: valorItem, venda: venda._id });
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
                                if (req.body.produto.toString() == estoque[0].receita.toString()) {
                                    estoqueUpdate = estoque[0].quantidade - req.body.quantidade
                                } else {
                                    /////Ver se é realmente possível no final dos testes
                                    await Estoque.create({ quantidade: parseFloat(req.body.quantidade) * -1, receita: req.body.produto });
                                }
                            }

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

                                    for (let j = 0; j < vetEstoqueItens.length; j++) {

                                        let teste = vetEstoqueItens[j].quantidade
                                        let t2 = req.body.produto[i].toString()
                                        let t3 = vetEstoqueItens[j].id.toString()
                                        let t33 = estoque[0].quantidade

                                        if (req.body.produto[i].toString() == vetEstoqueItens[j].id.toString()) {
                                            diferencaEstoque = req.body.quantidade[i] - vetEstoqueItens[j].quantidade
                                            vetEstoqueItens[j].quantidade = 0;
                                            break
                                        }
                                    }

                                    estoqueUpdate = estoque[0].quantidade - diferencaEstoque
                                    await Estoque.findByIdAndUpdate(estoque[0]._id, { quantidade: estoqueUpdate })
                                } else {
                                    if (req.body.produto.toString() == estoque[0].receita.toString()) {
                                        estoqueUpdate = estoque[0].quantidade - req.body.quantidade[i]
                                    } else {
                                        /////Ver se é realmente possível no final dos testes
                                        await Estoque.create({ quantidade: parseFloat(req.body.quantidade[i]) * -1, receita: req.body.produto });
                                    }
                                }

                                criou = true;
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