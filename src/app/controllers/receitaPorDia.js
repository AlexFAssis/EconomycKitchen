const ReceitaPorDia = require('../models/ReceitaPorDia');
const ItemReceitaPorDia = require('../models/ItemReceitaPorDia');
const Receita = require('../models/Receita');
const ItensReceita = require('../models/ItemReceita');
const Insumo = require('../models/Insumo');
const Estoque = require('../models/Estoque');
const moment = require('moment');
const Produto = require('../models/Produto');
const { compare } = require('bcryptjs');

class receitaPorDiaController {

    async index(req, res) {
        const produtos = await Produto.find().populate('receita')
        var data = new Date();
        var dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
        var mes = data.getMonth() + 1;
        mes = mes < 10 ? '0' + mes : mes;
        var ano = data.getFullYear();
        var dataReceita = dia + '/' + mes + '/' + ano

        return res.render('receitaPorDia/cadastro', { produtos, dataReceita, title: 'Cadastro de Receitas Por Dia' })
    }

    async novo(req, res) {
        try {
            let vetError = [];
            let passou = false;
            let criou = false;

            if (req.body.data) {
                var data = moment(formatDate(req.body.data))
            } else {
                passou = true;
                vetError.push('Informe a data da receita');
            }

            if (req.body.quantidade == undefined) {
                passou = true;
                vetError.push('Nenhum item inserido, insira um item');
            } else {
                if (typeof req.body.quantidade != 'object' && typeof req.body.quantidade != 'string') {
                    passou = true;
                    vetError.push('Informe a quantidade para o item');
                } else {
                    if (typeof req.body.quantidade != 'string') {
                        for (let i = 0; i < req.body.quantidade.length; i++) {
                            if (req.body.quantidade[i] <= 0) {
                                passou = true;
                                vetError.push('Informe a quantidade para o item: ' + i);
                            }
                        }
                    } else {
                        if (req.body.quantidade == '0') {
                            passou = true;
                            vetError.push('Informe a quantidade para o item: ' + i);
                        }
                    }
                }
            }

            if (passou) {
                req.flash('error', vetError)
                return res.redirect('/receitaPorDia/cadastro');
            } else {
                await ReceitaPorDia.create({ data: data._d }, async function (err, newObj) {
                    var receitaCriadaId = newObj;
                    if (err) {
                        throw err;
                    } else if (!newObj) {
                        throw new Error("Objeto não encontrado")
                    } else {
                        //Verifica se tem estoque de insumos para fazer as receitas
                        var temEstoque = true
                        // var vetReceita = []
                        var vetAcmEstoque = []

                        if (typeof req.body.quantidade != 'object') {
                            var vetReceita = []
                            const itensReceita = await ItensReceita.find({ receita: req.body.receita })
                            var receita = await Receita.findById(req.body.receita)
                            var achou = false

                            for (let i = 0; i < itensReceita.length; i++) {
                                if (temEstoque) {
                                    var objReceitaPorDiaEstoque = {}
                                    let qtdeIngrediente = req.body.quantidade
                                    let medida = itensReceita[i].medida
                                    let insumoReceita = itensReceita[i].insumo
                                    let qtdeInsumo = 0
                                    let qtdeIngredienteReceita = itensReceita[i].qtdeInsumo

                                    const insumo = await Insumo.findById(itensReceita[i].insumo)

                                    switch (medida) {
                                        case 'L':
                                        case 'KG':
                                            qtdeInsumo = parseFloat(qtdeIngrediente * 1000) * qtdeIngredienteReceita;
                                            break;
                                        case 'MG':
                                            qtdeInsumo = parseFloat(qtdeIngrediente / 1000) * qtdeIngredienteReceita;
                                            break;
                                        case 'G':
                                        case 'Unidade':
                                        case 'ML':
                                            qtdeInsumo = parseFloat(qtdeIngrediente) * qtdeIngredienteReceita;
                                            break;
                                        case 'Colher Sopa':
                                            qtdeInsumo = parseFloat(qtdeIngrediente * 15) * qtdeIngredienteReceita;
                                            break;
                                        case 'Colher Cha':
                                            qtdeInsumo = parseFloat(qtdeIngrediente * 5) * qtdeIngredienteReceita;
                                            break;
                                        case 'Xicara':
                                            qtdeInsumo = parseFloat(qtdeIngrediente * 250) * qtdeIngredienteReceita;
                                            break;
                                        case 'Duzia':
                                            qtdeInsumo = parseFloat(qtdeIngrediente * 12) * qtdeIngredienteReceita;
                                            break;
                                        case 'Copo':
                                            qtdeInsumo = parseFloat(qtdeIngrediente * 200) * qtdeIngredienteReceita;
                                            break;
                                    }

                                    //Acumula itens da receita
                                    if (vetAcmEstoque.length <= 0) {
                                        objReceitaPorDiaEstoque.insumoId = insumoReceita
                                        objReceitaPorDiaEstoque.qtdeInsumo = qtdeInsumo
                                        objReceitaPorDiaEstoque.receita = receita.nome
                                        objReceitaPorDiaEstoque.nomeInsumo = insumo.nome
                                        vetAcmEstoque.push(objReceitaPorDiaEstoque)
                                        achou = true
                                    } else {
                                        achou = false
                                        for (let k = 0; k < vetAcmEstoque.length; k++) {
                                            if (insumoReceita.toString() == vetAcmEstoque[k].insumoId.toString()) {
                                                achou = true
                                                vetAcmEstoque[k].qtdeInsumo += parseFloat(qtdeInsumo)
                                            }
                                        }
                                    }

                                    if (!achou) {
                                        objReceitaPorDiaEstoque.insumoId = insumoReceita
                                        objReceitaPorDiaEstoque.qtdeInsumo = qtdeInsumo
                                        objReceitaPorDiaEstoque.receita = receita.nome
                                        objReceitaPorDiaEstoque.nomeInsumo = insumo.nome
                                        vetAcmEstoque.push(objReceitaPorDiaEstoque)
                                    }
                                } else {
                                    break
                                }
                            }

                            console.log('--------------------------')
                            console.log(vetAcmEstoque)
                            console.log('--------------------------')


                            for (let i = 0; i < vetAcmEstoque.length; i++) {
                                const insumo = await Insumo.findById(vetAcmEstoque[i].insumoId)

                                if (insumo.qtdeEstoque < vetAcmEstoque[i].qtdeInsumo) {
                                    let objetoMsg = {}

                                    objetoMsg.idInsumo = vetAcmEstoque[i].insumoId
                                    objetoMsg.receita = vetAcmEstoque[i].receita
                                    objetoMsg.nomeInsumo = insumo.nome
                                    vetReceita.push(objetoMsg)

                                    temEstoque = false

                                    console.log('Insumo: ' + insumo.nome + ' tem estoque de: ' + insumo.qtdeEstoque + ' e a receita tem: ' + vetAcmEstoque[i].qtdeInsumo)
                                }
                            }

                        } else {
                            var vetReceita = []
                            var totalItemReceita = req.body.quantidade.length;
                            var vetReceitaPorDiaItens = []

                            //Acumula itens das receitas para verificação de estoque
                            for (let x = 0; x < totalItemReceita; x++) {
                                const itensReceita = await ItensReceita.find({ receita: req.body.receita[x] })
                                var receita = await Receita.findById(req.body.receita[x])

                                for (let i = 0; i < itensReceita.length; i++) {
                                    var achou = false;
                                    var objReceitaPorDia = {}
                                    const insumo = await Insumo.findById(itensReceita[i].insumo)

                                    if (vetReceitaPorDiaItens.length <= 0) {
                                        objReceitaPorDia.idInsumo = itensReceita[i].insumo
                                        objReceitaPorDia.insumoNome = insumo.nome
                                        objReceitaPorDia.receita = receita.nome
                                        objReceitaPorDia.quantidadeReceita = calculaQtdeInsumo(itensReceita[i].medida, itensReceita[i].qtdeInsumo, req.body.quantidade[x])
                                        vetReceitaPorDiaItens.push(objReceitaPorDia)
                                        achou = true
                                    } else {
                                        achou = false
                                        for (let k = 0; k < vetReceitaPorDiaItens.length; k++) {
                                            if (itensReceita[i].insumo.toString() == vetReceitaPorDiaItens[k].idInsumo.toString()) {
                                                achou = true
                                                vetReceitaPorDiaItens[k].quantidadeReceita += calculaQtdeInsumo(itensReceita[i].medida, itensReceita[i].qtdeInsumo, req.body.quantidade[x])
                                            }
                                        }
                                    }

                                    if (!achou) {
                                        objReceitaPorDia.idInsumo = itensReceita[i].insumo
                                        objReceitaPorDia.insumoNome = insumo.nome
                                        objReceitaPorDia.receita = receita.nome
                                        objReceitaPorDia.quantidadeReceita = calculaQtdeInsumo(itensReceita[i].medida, itensReceita[i].qtdeInsumo, req.body.quantidade[x])
                                        vetReceitaPorDiaItens.push(objReceitaPorDia)
                                    }
                                }
                            }

                            console.log('Start------------vetReceitaPorDiaItens------------')
                            console.log(vetReceitaPorDiaItens)
                            console.log('End------------vetReceitaPorDiaItens-----------')

                            //Monta msg de erro de estoque de insumo para cada receita
                            for (let l = 0; l < vetReceitaPorDiaItens.length; l++) {
                                const insumo = await Insumo.findById(vetReceitaPorDiaItens[l].idInsumo)

                                if (insumo.qtdeEstoque < vetReceitaPorDiaItens[l].quantidadeReceita) {
                                    let objetoNomeReceita = {}

                                    if (vetReceita.length <= 0) {
                                        objetoNomeReceita.idInsumo = vetReceitaPorDiaItens[l].idInsumo
                                        objetoNomeReceita.receita = vetReceitaPorDiaItens[l].receita
                                        objetoNomeReceita.nomeInsumo = insumo.nome
                                        vetReceita.push(objetoNomeReceita)
                                        achou = true
                                    } else {
                                        achou = false
                                        for (let k = 0; k < vetReceita.length; k++) {
                                            if (insumo._id.toString() == vetReceita[k].idInsumo.toString() && vetReceitaPorDiaItens[l].receita == vetReceita[k].receita) {
                                                achou = true
                                            }
                                        }
                                    }

                                    if (!achou) {
                                        objetoNomeReceita.idInsumo = vetReceitaPorDiaItens[l].idInsumo
                                        objetoNomeReceita.receita = vetReceitaPorDiaItens[l].receita
                                        objetoNomeReceita.nomeInsumo = insumo.nome
                                        vetReceita.push(objetoNomeReceita)
                                    }

                                    // vetReceita.push(insumo.nome)
                                    // vetReceita.push(vetReceitaPorDiaItens[l].receita)
                                    temEstoque = false
                                }
                            }

                            console.log('Start------------vetReceita-----------')
                            console.log(vetReceita)
                            console.log('End------------vetReceita-----------')
                        }


                        //Parte Final
                        if (temEstoque) {
                            if (req.body.quantidade != undefined) {
                                //         //Somente um item na ReceitaPorDia
                                if (typeof req.body.quantidade != 'object') {
                                    try {
                                        await ItemReceitaPorDia.create({ quantidade: req.body.quantidade, receita: req.body.receita, receitaPorDia: newObj._id });
                                        const ItemReceitaDia = await ItemReceitaPorDia.find({ receitaPorDia: newObj._id })
                                        const estoque = await Estoque.find({ receita: req.body.receita })
                                        const receita = await Receita.findById(req.body.receita)

                                        // Verfica ou Cria estoque de Produtos feitos
                                        if (estoque.length > 0) {
                                            for (let j = 0; j < estoque.length; j++) {
                                                if (estoque[j].receita.toString() == ItemReceitaDia[0].receita.toString()) {
                                                    let estoqueUpdate = parseFloat(req.body.quantidade) * receita.qtdeRendimento + parseFloat(estoque[j].quantidade)
                                                    await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })
                                                    break;
                                                }
                                            }
                                        } else {
                                            let qtdeAux = parseFloat(req.body.quantidade) * receita.qtdeRendimento
                                            await Estoque.create({ quantidade: qtdeAux, receita: req.body.receita });
                                        }

                                        criou = true;
                                        const itensReceita = await ItensReceita.find({ receita: req.body.receita });

                                        console.log('Length' + itensReceita.length)

                                        for (let i = 0; i < itensReceita.length; i++) {
                                            let medida = itensReceita[i].medida;
                                            let qtdeInsumo = itensReceita[i].qtdeInsumo;
                                            const insumoOld = await Insumo.findById(itensReceita[i].insumo);
                                            let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                                            let valorEstoque = 0
                                            let precoMedio = parseFloat(insumoOld.precoMedio);

                                            switch (medida) {
                                                case 'L':
                                                case 'KG':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo * 1000) * req.body.quantidade;
                                                    break;
                                                case 'MG':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo / 1000) * req.body.quantidade;
                                                    break;
                                                case 'G':
                                                case 'ML':
                                                case 'Unidade':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo) * req.body.quantidade;
                                                    break;
                                                case 'Colher Sopa':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo * 15) * req.body.quantidade;
                                                    break;
                                                case 'Colher Cha':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo * 5) * req.body.quantidade;
                                                    break;
                                                case 'Xicara':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo * 250) * req.body.quantidade;
                                                    break;
                                                case 'Duzia':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo * 12) * req.body.quantidade;
                                                    break;
                                                case 'Copo':
                                                    qtdeEstoque -= parseFloat(qtdeInsumo * 200) * req.body.quantidade;
                                                    break;
                                            }

                                            console.log('------------')
                                            console.log('medida: ' + medida)
                                            console.log('qtdeEstoque: ' + qtdeEstoque)
                                            console.log('qtde: ' + req.body.quantidade)
                                            console.log('insumoOld: ' + insumoOld.nome)
                                            console.log('qtdeInsumo: ' + qtdeInsumo)

                                            //Atualiza Estoque e preço médio
                                            valorEstoque = qtdeEstoque * precoMedio;
                                            valorEstoque = valorEstoque.toFixed(2)
                                            // if (qtdeEstoque > 0) {
                                            //     valorEstoque = qtdeEstoque * precoMedio
                                            // } else {
                                            //     precoMedio = 0;
                                            //     valorEstoque = 0;
                                            // }

                                            if (insumoOld) {
                                                try {
                                                    await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                                                    criou = true;
                                                } catch (erro) {
                                                    criou = false;
                                                    console.error(erro)
                                                    res.sendStatus(500).end();
                                                }
                                            }
                                        }
                                    } catch (erro) {
                                        console.error(erro);
                                        res.sendStatus(500).end();
                                    }

                                    if (criou) {
                                        return res.redirect('/receitaPorDia/listar');
                                    } else {
                                        req.flash('error', 'Ocorreu um erro ao cadastrar a receita')
                                        return res.redirect('/receitaPorDia/cadastro')
                                    }
                                } else {
                                    var total = req.body.quantidade.length;

                                    for (let i = 0; i < total; i++) {
                                        try {
                                            await ItemReceitaPorDia.create({ quantidade: req.body.quantidade[i], receita: req.body.receita[i], receitaPorDia: newObj._id });
                                            const ItemReceitaDia = await ItemReceitaPorDia.find({ receitaPorDia: newObj._id })
                                            const estoque = await Estoque.find({ receita: req.body.receita[i] })
                                            const receita = await Receita.findById(req.body.receita[i])

                                            if (estoque.length > 0) {
                                                for (let j = 0; j < estoque.length; j++) {
                                                    if (estoque[j].receita.toString() == ItemReceitaDia[i].receita.toString()) {
                                                        const estoqueUpdate = parseFloat(estoque[j].quantidade) + (parseFloat(req.body.quantidade[i] * receita.qtdeRendimento))
                                                        // let qtdeAux = estoqueUpdate * receita.qtdeRendimento
                                                        await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })
                                                        break;
                                                    }
                                                }
                                            } else {
                                                let qtdeAux = parseFloat(req.body.quantidade[i]) * receita.qtdeRendimento
                                                await Estoque.create({ quantidade: qtdeAux, receita: req.body.receita[i] });
                                            }

                                            criou = true;
                                            const itensReceita = await ItensReceita.find({ receita: req.body.receita[i] });
                                            if (itensReceita) {
                                                for (let j = 0; j < itensReceita.length; j++) {
                                                    let medida = itensReceita[j].medida;
                                                    let qtdeInsumo = itensReceita[j].qtdeInsumo;
                                                    const insumoOld = await Insumo.findById(itensReceita[j].insumo);
                                                    let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                                                    let valorEstoque = 0
                                                    let precoMedio = parseFloat(insumoOld.precoMedio);

                                                    switch (medida) {
                                                        case 'L':
                                                        case 'KG':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo * 1000) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                        case 'MG':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo / 1000) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                        case 'ML':
                                                        case 'G':
                                                        case 'Unidade':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                        case 'Colher Sopa':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo * 15) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                        case 'Colher Cha':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo * 5) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                        case 'Xicara':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo * 250) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                        case 'Duzia':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo * 12) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                        case 'Copo':
                                                            qtdeEstoque -= parseFloat(qtdeInsumo * 200) * req.body.quantidade[i].toString().replace(/\,/, '.');
                                                            break;
                                                    }

                                                    console.log('------------')
                                                    console.log('medida: ' + medida)
                                                    console.log('qtdeEstoque: ' + qtdeEstoque)
                                                    console.log('qtde: ' + req.body.quantidade[i])
                                                    console.log('insumoOld: ' + insumoOld.nome)
                                                    console.log('qtdeInsumo: ' + qtdeInsumo)


                                                    valorEstoque = qtdeEstoque * precoMedio;
                                                    valorEstoque = valorEstoque.toFixed(2)
                                                    // if (qtdeEstoque > 0) {
                                                    //     valorEstoque = qtdeEstoque * precoMedio
                                                    // } else {
                                                    //     precoMedio = 0;
                                                    //     valorEstoque = 0;
                                                    // }

                                                    if (insumoOld) {
                                                        try {
                                                            await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                                                            criou = true;
                                                        } catch (erro) {
                                                            criou = false;
                                                            console.error(erro)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        catch (erro) {
                                            console.error(erro);
                                            res.sendStatus(500).end();
                                        }
                                    }

                                    if (criou) {
                                        return res.redirect('/receitaPorDia/listar');
                                    } else {
                                        if (receitaCriadaId != ' ') {
                                            await ReceitaPorDia.findByIdAndDelete(receitaCriadaId)
                                        }
                                        req.flash('error', 'Ocorreu um erro ao cadastrar a receita')
                                        return res.redirect('/receitaPorDia/cadastro')
                                    }
                                }
                            }
                        } else {
                            if (receitaCriadaId != ' ') {
                                await ReceitaPorDia.findByIdAndDelete(receitaCriadaId)
                            }

                            //msg de erro
                            for (let i = 0; i < vetReceita.length; i++) {
                                req.flash('error', 'Não há estoque para a receita: ' + vetReceita[i].receita + ', insumo: ' + vetReceita[i].nomeInsumo)
                            }

                            return res.redirect('/receitaPorDia/cadastro')
                        }
                    }
                });
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listar(req, res) {
        try {
            const receitasPorDia = await ReceitaPorDia.find()
                .populate('receita')//.sort({ data: 'desc' })

            return res.render('receitaPorDia/listagem', { receitasPorDia, title: 'Listagem de Receitas Por Dia' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const receitaPorDia = await ReceitaPorDia.findById(id);
            if (receitaPorDia) {
                res.send(receitaPorDia);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const receitaPorDia = await ReceitaPorDia.findOne({ _id: req.params.id })
        const receitasPorDiaItem = await ItemReceitaPorDia.find({ receitaPorDia: req.params.id })
        const receitas = await Receita.find()
        const produtos = await Produto.find().populate('receita')
        const dataReceita = formataData(receitaPorDia.data)
        const vetIdReceitaPorDiaItens = []

        for (let i = 0; i < receitasPorDiaItem.length; i++) {
            let receitaItem = new Object()
            receitaItem.id = receitasPorDiaItem[i].receita
            let quantidade = receitasPorDiaItem[i].quantidade
            const receita = await Receita.findById(receitaItem.id)
            receitaItem.qtdeRendimento = receita.qtdeRendimento * quantidade
            vetIdReceitaPorDiaItens.push(receitaItem)
        }

        if (receitaPorDia) {
            return res.render('receitaPorDia/editar', { receitaPorDia, receitas, produtos, dataReceita, receitasPorDiaItem, vetIdReceitaPorDiaItens, controle: 1, title: 'Edição de Receita Por Dia' })
        } else {
            console.error('Receita Por Dia não encontrada')
        }

    }

    async atualizar(req, res) {
        const id = req.params.id;

        try {
            const data = moment(formatDate(req.body.data))
            const receitasPorDia = await ReceitaPorDia.findByIdAndUpdate(id, { data: data });
            const itensReceitaPorDia = await ItemReceitaPorDia.find({ receitaPorDia: receitasPorDia._id })

            var vetEstoqueItens = []
            var achou = false

            //Acumula estoque de produtos para debitar ou creditar **
            if (itensReceitaPorDia.length > 0) {
                for (let i = 0; i < itensReceitaPorDia.length; i++) {
                    var objVenda = {}
                    let receita = await Receita.findById(itensReceitaPorDia[i].receita)

                    if (vetEstoqueItens.length <= 0) {
                        objVenda.id = itensReceitaPorDia[i].receita
                        objVenda.quantidade = itensReceitaPorDia[i].quantidade * receita.qtdeRendimento
                        vetEstoqueItens.push(objVenda)
                        achou = true
                    } else {
                        achou = false
                        for (let j = 0; j < vetEstoqueItens.length; j++) {
                            if (itensReceitaPorDia[i].receita.toString() == vetEstoqueItens[j].id.toString()) {
                                achou = true
                                vetEstoqueItens[j].quantidade += itensReceitaPorDia[i].quantidade * receita.qtdeRendimento
                            }
                        }
                    }

                    if (!achou) {
                        objVenda.id = itensReceitaPorDia[i].receita
                        objVenda.quantidade = itensReceitaPorDia[i].quantidade * receita.qtdeRendimento
                        vetEstoqueItens.push(objVenda)
                    }
                }
            }

            //Acumula estoque de insumos
            var vetInsumosOld = []
            var achou = false
            if (itensReceitaPorDia) {
                for (let i = 0; i < itensReceitaPorDia.length; i++) {
                    const itensReceita = await ItensReceita.find({ receita: itensReceitaPorDia[i].receita });

                    if (itensReceita) {
                        for (let j = 0; j < itensReceita.length; j++) {
                            var objInsumoOld = {}
                            const insumoOld = await Insumo.findById(itensReceita[j].insumo);

                            let teste = insumoOld.nome

                            if (vetInsumosOld.length <= 0) {
                                objInsumoOld.id = insumoOld._id
                                objInsumoOld.qtdeEstoque = insumoOld.qtdeEstoque
                                objInsumoOld.precoMedio = insumoOld.precoMedio
                                vetInsumosOld.push(objInsumoOld)
                                achou = true
                            } else {
                                achou = false
                                for (let k = 0; k < vetInsumosOld.length; k++) {
                                    if (insumoOld._id.toString() == vetInsumosOld[k].id.toString()) {
                                        achou = true
                                        //vetInsumosOld[j].qtdeEstoque = parseFloat(vetInsumosOld[j].qtdeEstoque) + 0
                                    }
                                }
                            }

                            if (!achou) {
                                objInsumoOld.id = insumoOld._id
                                objInsumoOld.qtdeEstoque = insumoOld.qtdeEstoque
                                objInsumoOld.precoMedio = insumoOld.precoMedio
                                vetInsumosOld.push(objInsumoOld)
                            }
                        }
                    }
                }
            }

            console.log('$$$$$$$$$$$$ - vetInsumosOld')
            console.log(vetInsumosOld)
            console.log('$$$$$$$$$$$ - vetInsumosOld')

            console.log('@@@@@@@@@@@@@@@@@@')

            //Verifica qtde atual e atualiza estoque (volta estoque)
            if (itensReceitaPorDia) {
                for (let i = 0; i < itensReceitaPorDia.length; i++) {
                    const itensReceita = await ItensReceita.find({ receita: itensReceitaPorDia[i].receita });

                    if (itensReceita) {
                        for (let j = 0; j < itensReceita.length; j++) {
                            let medida = itensReceita[j].medida;
                            let qtdeInsumo = itensReceita[j].qtdeInsumo;
                            const insumoOld = await Insumo.findById(itensReceita[j].insumo);
                            let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                            let valorEstoque = 0;
                            let precoMedio = parseFloat(insumoOld.precoMedio);

                            switch (medida) {
                                case 'L':
                                case 'KG':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 1000) * itensReceitaPorDia[i].quantidade;
                                    break;
                                case 'MG':
                                    qtdeEstoque += parseFloat(qtdeInsumo / 1000) * itensReceitaPorDia[i].quantidade;
                                    break;
                                case 'G':
                                case 'ML':
                                case 'Unidade':
                                    qtdeEstoque += parseFloat(qtdeInsumo) * itensReceitaPorDia[i].quantidade;
                                    break;
                                case 'Colher Sopa':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 15) * itensReceitaPorDia[i].quantidade;
                                    break;
                                case 'Colher Cha':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 5) * itensReceitaPorDia[i].quantidade;
                                    break;
                                case 'Xicara':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 250) * itensReceitaPorDia[i].quantidade;
                                    break;
                                case 'Duzia':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 12) * itensReceitaPorDia[i].quantidade;
                                    break;
                                case 'Copo':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 200) * itensReceitaPorDia[i].quantidade;
                                    break;
                            }

                            valorEstoque = qtdeEstoque * precoMedio;
                            valorEstoque = valorEstoque.toFixed(2)
                            if (insumoOld) {
                                await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, precoMedio: precoMedio, valorEstoque: valorEstoque });
                            }
                        }
                    }
                }
            }

            if (req.body.quantidade != undefined) {
                var temEstoque = true
                var vetItensReceita = []
                var vetReceita = []
                //Veririca se há apenas um item na receitaPorDia
                if (typeof req.body.quantidade != 'object') {

                    //Verifica se há estoque de insumos
                    const itensReceita = await ItensReceita.find({ receita: req.body.receita })
                    var receita = await Receita.findById(req.body.receita)
                    var vetReceita = []
                    var achou = false

                    for (let i = 0; i < itensReceita.length; i++) {
                        // if (temEstoque) {
                        let qtdeIngrediente = req.body.quantidade
                        let medida = itensReceita[i].medida
                        let insumoReceita = itensReceita[i].insumo
                        let qtdeInsumo = 0
                        let qtdeIngredienteReceita = itensReceita[i].qtdeInsumo

                        switch (medida) {
                            case 'L':
                            case 'KG':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 1000) * qtdeIngredienteReceita;
                                break;
                            case 'MG':
                                qtdeInsumo = parseFloat(qtdeIngrediente / 1000) * qtdeIngredienteReceita;
                                break;
                            case 'G':
                            case 'Unidade':
                            case 'ML':
                                qtdeInsumo = parseFloat(qtdeIngrediente) * qtdeIngredienteReceita;
                                break;
                            case 'Colher Sopa':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 15) * qtdeIngredienteReceita;
                                break;
                            case 'Colher Cha':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 5) * qtdeIngredienteReceita;
                                break;
                            case 'Xicara':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 250) * qtdeIngredienteReceita;
                                break;
                            case 'Duzia':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 12) * qtdeIngredienteReceita;
                                break;
                            case 'Copo':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 200) * qtdeIngredienteReceita;
                                break;
                        }

                        const insumo = await Insumo.findById(itensReceita[i].insumo)

                        //acumula itens da receita
                        if (vetItensReceita.length <= 0) {
                            let itemReceitaObj = {}
                            itemReceitaObj.idInsumo = insumoReceita
                            itemReceitaObj.nomeInsumo = insumo.nome
                            itemReceitaObj.qtdeInsumo = qtdeInsumo
                            itemReceitaObj.receita = receita.nome
                            vetItensReceita.push(itemReceitaObj)
                            achou = true
                        } else {
                            for (let j = 0; j < vetItensReceita.length; j++) {
                                if (insumoReceita.toString() == vetItensReceita[j].idInsumo.toString()) {
                                    vetItensReceita[j] += qtdeInsumo
                                    achou = true
                                }
                            }
                        }

                        if (!achou) {
                            let itemReceitaObj = {}
                            itemReceitaObj.idInsumo = insumoReceita
                            itemReceitaObj.nomeInsumo = insumo.nome
                            itemReceitaObj.qtdeInsumo = qtdeInsumo
                            itemReceitaObj.receita = receita.nome
                            vetItensReceita.push(itemReceitaObj)
                        }

                    }

                    //monta msg de erro de estoque
                    for (let j = 0; j < vetItensReceita.length; j++) {
                        const insumo = await Insumo.findById(vetItensReceita[j].idInsumo)
                        let qtdeInsumo = vetItensReceita[j].qtdeInsumo

                        if (insumo.qtdeEstoque < qtdeInsumo) {
                            let itemReceitaObj = {}
                            itemReceitaObj.idInsumo = vetItensReceita[j].idInsumo
                            itemReceitaObj.receita = vetItensReceita[j].receita
                            itemReceitaObj.nomeInsumo = insumo.nome
                            vetReceita.push(itemReceitaObj)
                            temEstoque = false
                        }

                    }


                    if (temEstoque) {
                        //Remove Itens e preço médio
                        await ItemReceitaPorDia.remove({ receitaPorDia: receitasPorDia._id })

                        await ItemReceitaPorDia.create({ quantidade: req.body.quantidade, receita: req.body.receita, receitaPorDia: receitasPorDia._id, sobra: req.body.sobra });
                        const itensReceita = await ItensReceita.find({ receita: req.body.receita });
                        const estoque = await Estoque.find({ receita: req.body.receita })
                        var estoqueUpdate = 0
                        var diferencaEstoque = 0

                        if (estoque.length > 0) {
                            //capturar valor antigo da venda e calcular
                            for (let i = 0; i < vetEstoqueItens.length; i++) {
                                if (req.body.receita.toString() == vetEstoqueItens[i].id.toString()) {
                                    // diferencaEstoque = req.body.quantidade - vetEstoqueItens[i].quantidade
                                    diferencaEstoque = req.body.rendimento - vetEstoqueItens[i].quantidade
                                    vetEstoqueItens[i].quantidade = 0;
                                    estoqueUpdate = estoque[0].quantidade + diferencaEstoque
                                    break
                                }
                            }
                        } else {
                            if (req.body.receita.toString() == estoque[0].receita.toString()) {
                                // estoqueUpdate = estoque[0].quantidade - req.body.quantidade * parseFloat(req.body.rendimento)
                                estoqueUpdate = estoque[0].quantidade - parseFloat(req.body.rendimento)
                            } else {
                                /////Ver se é realmente possível no final dos testes
                                // let qtdeAux = parseFloat(req.body.quantidade) * parseFloat(req.body.rendimento)
                                let qtdeAux = parseFloat(req.body.rendimento)
                                await Estoque.create({ quantidade: qtdeAux * -1, receita: req.body.receita });
                            }
                        }

                        // let qtdeAux = estoqueUpdate * parseFloat(req.body.rendimento)
                        await Estoque.findByIdAndUpdate(estoque[0]._id, { quantidade: estoqueUpdate })

                        for (let i = 0; i < itensReceita.length; i++) {
                            let medida = itensReceita[i].medida;
                            let qtdeInsumo = itensReceita[i].qtdeInsumo;
                            const insumoOld = await Insumo.findById(itensReceita[i].insumo);
                            let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                            let valorEstoque = 0
                            let precoMedio = parseFloat(insumoOld.precoMedio);

                            switch (medida) {
                                case 'L':
                                case 'KG':
                                    qtdeEstoque -= parseFloat(qtdeInsumo * 1000) * req.body.quantidade;
                                    break;
                                case 'MG':
                                    qtdeEstoque -= parseFloat(qtdeInsumo / 1000) * req.body.quantidade;
                                    break;
                                case 'ML':
                                case 'G':
                                case 'Unidade':
                                    qtdeEstoque -= parseFloat(qtdeInsumo) * req.body.quantidade;
                                    break;
                                case 'Colher Sopa':
                                    qtdeEstoque -= parseFloat(qtdeInsumo * 15) * req.body.quantidade;
                                    break;
                                case 'Colher Cha':
                                    qtdeEstoque -= parseFloat(qtdeInsumo * 5) * req.body.quantidade;
                                    break;
                                case 'Xicara':
                                    qtdeEstoque -= parseFloat(qtdeInsumo * 250) * req.body.quantidade;
                                    break;
                                case 'Duzia':
                                    qtdeEstoque -= parseFloat(qtdeInsumo * 12) * req.body.quantidade;
                                    break;
                                case 'Copo':
                                    qtdeEstoque -= parseFloat(qtdeInsumo * 200) * req.body.quantidade;
                                    break;
                            }

                            valorEstoque = qtdeEstoque * precoMedio;
                            valorEstoque = valorEstoque.toFixed(2)
                            if (insumoOld) {
                                await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                            }
                        }
                    } else {
                        //Em caso de erro retornar o estoque de insumos
                        const insumos = await Insumo.find()

                        for (let i = 0; i < vetInsumosOld.length; i++) {
                            for (let k = 0; k < insumos.length; k++) {
                                if (insumos[k]._id.toString() == vetInsumosOld[i].id.toString()) {
                                    //let diferencaEstoque = estoque[k].quantidade - vetInsumosOld[i].quantidade

                                    let valorEstoque = vetInsumosOld[i].qtdeEstoque * vetInsumosOld[i].precoMedio;
                                    valorEstoque = valorEstoque.toFixed(2)
                                    await Insumo.findByIdAndUpdate(insumos[k]._id, { qtdeEstoque: vetInsumosOld[i].qtdeEstoque, precoMedio: vetInsumosOld[i].precoMedio, valorEstoque })
                                    break
                                }
                            }
                        }

                        for (let i = 0; i < vetReceita.length; i++) {
                            req.flash('error', 'Não há estoque para a receita: ' + vetReceita[i].receita + ', insumo: ' + vetReceita[i].nomeInsumo)
                        }

                        // for (let i = 0; i < vetReceita.length; i++) {
                        // req.flash('error', 'Não há estoque para a receita ' + vetReceita[i])
                        // }

                        return res.redirect(`/receitaPorDia/editar/${id}`)
                    }
                } else {
                    //Se houver mais que um item na receitaPorDia é um objeto
                    var totalItemReceita = req.body.quantidade.length;
                    var vetReceitaPorDiaItens = []

                    for (let x = 0; x < totalItemReceita; x++) {
                        const itensReceita = await ItensReceita.find({ receita: req.body.receita[x] })
                        var receita = await Receita.findById(req.body.receita[x])

                        for (let i = 0; i < itensReceita.length; i++) {
                            var achou = false;

                            // for (let j = 0; j < total; j++) {

                            var objReceitaPorDia = {}

                            if (vetReceitaPorDiaItens.length <= 0) {
                                objReceitaPorDia.idInsumo = req.body.receita[x]
                                objReceitaPorDia.receita = receita.nome
                                objReceitaPorDia.quantidade = parseFloat(req.body.quantidade[x])
                                objReceitaPorDia.medida = itensReceita[i].medida
                                objReceitaPorDia.insumo = itensReceita[i].insumo
                                objReceitaPorDia.qtdeIngredienteReceita = itensReceita[i].qtdeInsumo
                                vetReceitaPorDiaItens.push(objReceitaPorDia)
                                achou = true
                            } else {
                                achou = false
                                for (let k = 0; k < vetReceitaPorDiaItens.length; k++) {
                                    objReceitaPorDia.insumo = itensReceita[i].insumo

                                    if (req.body.receita[x].toString() == vetReceitaPorDiaItens[k].idInsumo.toString() && itensReceita[i].insumo.toString() == vetReceitaPorDiaItens[k].insumo.toString()) {
                                        achou = true
                                        vetReceitaPorDiaItens[k].quantidade += parseFloat(req.body.quantidade[x])
                                    }
                                }
                            }

                            if (!achou) {
                                objReceitaPorDia.idInsumo = req.body.receita[x]
                                objReceitaPorDia.receita = receita.nome
                                objReceitaPorDia.quantidade = parseFloat(req.body.quantidade[x])
                                objReceitaPorDia.medida = itensReceita[i].medida
                                objReceitaPorDia.insumo = itensReceita[i].insumo
                                objReceitaPorDia.qtdeIngredienteReceita = itensReceita[i].qtdeInsumo
                                vetReceitaPorDiaItens.push(objReceitaPorDia)
                            }
                            // }
                        }
                    }

                    //Monta msg de erro de estoque de insumo para cada receita
                    for (let l = 0; l < vetReceitaPorDiaItens.length; l++) {
                        let qtdeIngrediente = vetReceitaPorDiaItens[l].quantidade
                        let medida = vetReceitaPorDiaItens[l].medida
                        var insumoReceita = vetReceitaPorDiaItens[l].insumo
                        var qtdeInsumo = 0
                        let qtdeIngredienteReceita = vetReceitaPorDiaItens[l].qtdeIngredienteReceita

                        switch (medida) {
                            case 'L':
                            case 'KG':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 1000) * qtdeIngredienteReceita;
                                break;
                            case 'MG':
                                qtdeInsumo = parseFloat(qtdeIngrediente / 1000) * qtdeIngredienteReceita;
                                break;
                            case 'G':
                            case 'Unidade':
                            case 'ML':
                                qtdeInsumo = parseFloat(qtdeIngrediente) * qtdeIngredienteReceita;
                                break;
                            case 'Colher Sopa':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 15) * qtdeIngredienteReceita;
                                break;
                            case 'Colher Cha':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 5) * qtdeIngredienteReceita;
                                break;
                            case 'Xicara':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 250) * qtdeIngredienteReceita;
                                break;
                            case 'Duzia':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 12) * qtdeIngredienteReceita;
                                break;
                            case 'Copo':
                                qtdeInsumo = parseFloat(qtdeIngrediente * 200) * qtdeIngredienteReceita;
                                break;
                        }

                        const insumo = await Insumo.findById(insumoReceita)

                        if (insumo.qtdeEstoque < qtdeInsumo) {
                            let objetoNomeReceita = {}

                            if (vetReceita.length <= 0) {
                                objetoNomeReceita.idInsumo = vetReceitaPorDiaItens[l].insumo
                                objetoNomeReceita.receita = vetReceitaPorDiaItens[l].receita
                                objetoNomeReceita.nomeInsumo = insumo.nome
                                vetReceita.push(objetoNomeReceita)
                                achou = true
                            } else {
                                achou = false
                                for (let k = 0; k < vetReceita.length; k++) {
                                    if (insumo._id.toString() == vetReceita[k].idInsumo.toString() && vetReceitaPorDiaItens[l].receita == vetReceita[k].receita) {
                                        achou = true
                                    }
                                }
                            }

                            if (!achou) {
                                objetoNomeReceita.idInsumo = vetReceitaPorDiaItens[l].insumo
                                objetoNomeReceita.receita = vetReceitaPorDiaItens[l].receita
                                objetoNomeReceita.nomeInsumo = insumo.nome
                                vetReceita.push(objetoNomeReceita)
                            }

                            temEstoque = false
                        }
                    }

                    if (temEstoque) {
                        var total = req.body.quantidade.length;
                        await ItemReceitaPorDia.remove({ receitaPorDia: receitasPorDia._id })

                        for (let i = 0; i < total; i++) {
                            try {
                                //Remove Itens e preço médio

                                await ItemReceitaPorDia.create({ quantidade: req.body.quantidade[i], receita: req.body.receita[i], receitaPorDia: receitasPorDia._id, sobra: req.body.sobra[i] });
                                const itensReceita = await ItensReceita.find({ receita: req.body.receita[i] });
                                const receita = await Receita.findById(req.body.receita[i])

                                if (itensReceita) {
                                    const estoque = await Estoque.find({ receita: req.body.receita[i] })
                                    var estoqueUpdate = 0
                                    var diferencaEstoque = 0

                                    if (estoque.length > 0) {
                                        //capturar valor antigo da venda e calcular
                                        let achouItemNoVetor = false;
                                        for (let j = 0; j < vetEstoqueItens.length; j++) {
                                            if (req.body.receita[i].toString() == vetEstoqueItens[j].id.toString()) {
                                                achouItemNoVetor = true
                                                // diferencaEstoque = req.body.quantidade[i] - vetEstoqueItens[j].quantidade
                                                diferencaEstoque = req.body.rendimento[i] - vetEstoqueItens[j].quantidade
                                                vetEstoqueItens[j].quantidade = 0;
                                                estoqueUpdate = estoque[0].quantidade + diferencaEstoque
                                                break
                                            }
                                        }

                                        if (!achouItemNoVetor) {
                                            estoqueUpdate = parseFloat(estoque[0].quantidade) + parseFloat(req.body.rendimento[i])
                                        }
                                    } else {
                                        if (req.body.receita.toString() == estoque[0].receita.toString()) {
                                            estoqueUpdate = estoque[0].quantidade - req.body.quantidade[i] * req.body.rendimento[i]
                                        } else {
                                            /////Ver se é realmente possível no final dos testes
                                            await Estoque.create({ quantidade: parseFloat(req.body.rendimento[i]) * -1, receita: req.body.receita[i] });
                                            // await Estoque.create({ quantidade: parseFloat(req.body.quantidade[i]) * -1, receita: req.body.receita[i] });
                                        }
                                    }

                                    // let qtdeAux = receita.qtdeRendimento * estoqueUpdate
                                    await Estoque.findByIdAndUpdate(estoque[0]._id, { quantidade: estoqueUpdate })


                                    for (let j = 0; j < itensReceita.length; j++) {
                                        let medida = itensReceita[j].medida;
                                        let qtdeInsumo = itensReceita[j].qtdeInsumo;
                                        const insumoOld = await Insumo.findById(itensReceita[j].insumo);
                                        let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                                        let valorEstoque = 0
                                        let precoMedio = parseFloat(insumoOld.precoMedio);

                                        // let teste = req.body.quantidade[i]

                                        switch (medida) {
                                            case 'L':
                                            case 'KG':
                                                qtdeEstoque -= parseFloat(qtdeInsumo * 1000) * req.body.quantidade[i];
                                                break;
                                            case 'MG':
                                                qtdeEstoque -= parseFloat(qtdeInsumo / 1000) * req.body.quantidade[i];
                                                break;
                                            case 'G':
                                            case 'ML':
                                            case 'Unidade':
                                                qtdeEstoque -= parseFloat(qtdeInsumo) * req.body.quantidade[i];
                                                break;
                                            case 'Colher Sopa':
                                                qtdeEstoque -= parseFloat(qtdeInsumo * 15) * req.body.quantidade[i];
                                                break;
                                            case 'Colher Chá':
                                                qtdeEstoque -= parseFloat(qtdeInsumo * 5) * req.body.quantidade[i];
                                                break;
                                            case 'Xicara':
                                                qtdeEstoque -= parseFloat(qtdeInsumo * 250) * req.body.quantidade[i];
                                                break;
                                            case 'Duzia':
                                                qtdeEstoque -= parseFloat(qtdeInsumo * 12) * req.body.quantidade[i];
                                                break;
                                            case 'Copo':
                                                qtdeEstoque -= parseFloat(qtdeInsumo * 200) * req.body.quantidade[i];
                                                break;
                                        }

                                        //Atualiza Estoque e preço médio
                                        valorEstoque = qtdeEstoque * precoMedio;
                                        valorEstoque = valorEstoque.toFixed(2)
                                        if (insumoOld) {
                                            await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                                        }
                                    }
                                }
                            }
                            catch (erro) {
                                console.error(erro);
                                res.sendStatus(500).end();
                            }
                        }
                    } else {
                        //Em caso de erro o estoque de produtos retorna ao que era antes
                        // const estoque = await Estoque.find()

                        // for (let i = 0; i < vetEstoqueItens.length; i++) {
                        //     for (let k = 0; k < estoque.length; k++) {

                        //         let teste = estoque[k].receita.toString()
                        //         let teste2 = vetEstoqueItens[i].id.toString()

                        //         if (estoque[k].receita.toString() == vetEstoqueItens[i].id.toString()) {
                        //             let diferencaEstoque = estoque[k].quantidade - vetEstoqueItens[i].quantidade
                        //             await Estoque.findByIdAndUpdate(estoque[k]._id, { quantidade: diferencaEstoque })
                        //         }
                        //     }
                        // }

                        console.log('Start------------vetReceita-----------')
                        console.log(vetReceita)
                        console.log('End------------vetReceita-----------')

                        //Em caso de erro retornar o estoque de insumos
                        const insumos = await Insumo.find()

                        for (let i = 0; i < vetInsumosOld.length; i++) {
                            for (let k = 0; k < insumos.length; k++) {
                                if (insumos[k]._id.toString() == vetInsumosOld[i].id.toString()) {
                                    //let diferencaEstoque = estoque[k].quantidade - vetInsumosOld[i].quantidade

                                    let valorEstoque = vetInsumosOld[i].qtdeEstoque * vetInsumosOld[i].precoMedio;
                                    valorEstoque = valorEstoque.toFixed(2)
                                    await Insumo.findByIdAndUpdate(insumos[k]._id, { qtdeEstoque: vetInsumosOld[i].qtdeEstoque, precoMedio: vetInsumosOld[i].precoMedio, valorEstoque })
                                    break
                                }
                            }
                        }

                        // //Aqui só vai listar 1 receita pq não vai chegar na segunda
                        // for (let i = 0; i < vetReceita.length; i++) {
                        //     req.flash('error', 'Não há estoque para a receita ' + vetReceita[i])
                        // }

                        for (let i = 0; i < vetReceita.length; i++) {
                            req.flash('error', 'Não há estoque para a receita: ' + vetReceita[i].receita + ', insumo: ' + vetReceita[i].nomeInsumo)
                        }

                        return res.redirect(`/receitaPorDia/editar/${id}`)
                    }
                }
            }

            if (receitasPorDia) {
                res.redirect('/receitaPorDia/listar')
            } else {
                res.sendStatus(404).end();
                console.error('Receita por dia não atualizada')
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async excluir(req, res) {
        const id = req.params.id;
        try {
            const receitaPorDia = await ReceitaPorDia.findById(id);
            const itensReceitaPorDia = await ItemReceitaPorDia.find({ receitaPorDia: receitaPorDia._id });

            //Atualiza Estoque
            if (itensReceitaPorDia) {
                for (let i = 0; i < itensReceitaPorDia.length; i++) {
                    const itensReceita = await ItensReceita.find({ receita: itensReceitaPorDia[i].receita });

                    const estoque = await Estoque.find({ receita: itensReceitaPorDia[i].receita })
                    const receita = await Receita.findById(itensReceitaPorDia[i].receita)

                    if (estoque.length > 0) {
                        for (let j = 0; j < estoque.length; j++) {
                            if (estoque[j].receita.toString() == itensReceitaPorDia[i].receita.toString()) {
                                const estoqueUpdate = estoque[j].quantidade - itensReceitaPorDia[i].quantidade * receita.qtdeRendimento
                                // let qtdeAux = estoqueUpdate * receita.qtdeRendimento
                                await Estoque.findByIdAndUpdate(estoque[j]._id, { quantidade: estoqueUpdate })
                                break;
                            }
                        }
                    }

                    if (itensReceita) {
                        for (let j = 0; j < itensReceita.length; j++) {
                            let medida = itensReceita[j].medida;
                            let qtdeInsumo = itensReceita[j].qtdeInsumo;
                            const insumoOld = await Insumo.findById(itensReceita[j].insumo);
                            let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                            let valorEstoque = 0
                            let precoMedio = parseFloat(insumoOld.precoMedio);

                            switch (medida) {
                                case 'L':
                                case 'KG':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 1000) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                                case 'MG':
                                    qtdeEstoque += parseFloat(qtdeInsumo / 1000) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                                case 'ML':
                                case 'G':
                                case 'Unidade':
                                    qtdeEstoque += parseFloat(qtdeInsumo) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                                case 'Colher Sopa':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 15) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                                case 'Colher Cha':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 5) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                                case 'Xicara':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 250) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                                case 'Duzia':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 12) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                                case 'Copo':
                                    qtdeEstoque += parseFloat(qtdeInsumo * 200) * itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.');
                                    break;
                            }

                            console.log('------------')
                            console.log('medida: ' + medida)
                            console.log('qtdeEstoque: ' + qtdeEstoque)
                            console.log('qtde: ' + itensReceitaPorDia[i].quantidade.toString().replace(/\,/, '.'))
                            console.log('insumoOld: ' + insumoOld.nome)
                            console.log('qtdeEstoque: ' + qtdeEstoque)
                            console.log('qtdeInsumo: ' + qtdeInsumo)

                            valorEstoque = precoMedio * qtdeEstoque;
                            valorEstoque = valorEstoque.toFixed(2)
                            if (insumoOld) {
                                await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                            }
                        }
                    }
                }

                await ItemReceitaPorDia.remove({ receitaPorDia: receitaPorDia._id })
                await ReceitaPorDia.findByIdAndDelete(id);
            }

            if (receitaPorDia) {
                res.redirect('/receitaPorDia/listar');
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
        let receitasPorDia = {}

        if (dtInicial && dtFinal) {
            var dtInicialMoment = moment(dtInicial, "DD/MM/YYYY");
            var dtFinalMoment = moment(dtFinal, "DD/MM/YYYY");

            receitasPorDia = await ReceitaPorDia.find({
                data: {
                    $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
                }
            })
        } else {
            data = await ReceitaPorDia.find()
        }

        return res.render('receitaPorDia/listagem', { receitasPorDia, dtInicial, dtFinal })
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

function calculaQtdeInsumo(medida, quantidadeInsumo, quantidadeReceitasFeitas) {
    let qtdeInsumo = 0

    switch (medida) {
        case 'L':
        case 'KG':
            qtdeInsumo = parseFloat(quantidadeInsumo * 1000) * quantidadeReceitasFeitas;
            break;
        case 'MG':
            qtdeInsumo = parseFloat(quantidadeInsumo / 1000) * quantidadeReceitasFeitas;
            break;
        case 'G':
        case 'Unidade':
        case 'ML':
            qtdeInsumo = parseFloat(quantidadeInsumo) * quantidadeReceitasFeitas;
            break;
        case 'Colher Sopa':
            qtdeInsumo = parseFloat(quantidadeInsumo * 15) * quantidadeReceitasFeitas;
            break;
        case 'Colher Cha':
            qtdeInsumo = parseFloat(quantidadeInsumo * 5) * quantidadeReceitasFeitas;
            break;
        case 'Xicara':
            qtdeInsumo = parseFloat(quantidadeInsumo * 250) * quantidadeReceitasFeitas;
            break;
        case 'Duzia':
            qtdeInsumo = parseFloat(quantidadeInsumo * 12) * quantidadeReceitasFeitas;
            break;
        case 'Copo':
            qtdeInsumo = parseFloat(quantidadeInsumo * 200) * quantidadeReceitasFeitas;
            break;
    }

    return qtdeInsumo
}

module.exports = new receitaPorDiaController;