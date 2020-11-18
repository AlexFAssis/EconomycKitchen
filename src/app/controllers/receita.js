const Receita = require('../models/Receita');
const CategoriaReceita = require('../models/CategoriaReceita');
const Insumo = require('../models/Insumo');
const ItemReceita = require('../models/ItemReceita');
const HistoricoReceita = require('../models/HistoricoReceita');
const moment = require('moment');
const Imposto = require("../models/Imposto")
const ReceitaPorDia = require("../models/ReceitaPorDia")
const ItensReceitaPorDia = require("../models/ItemReceitaPorDia")
const Produto = require("../models/Produto");
const ItemReceitaPorDia = require('../models/ItemReceitaPorDia');
const Estoque = require('../models/Estoque');


class receitaController {

    async index(req, res) {
        const categoriasReceita = await CategoriaReceita.find().sort({ categoria: 'asc' })
        const insumos = await Insumo.find()
        return res.render('receita/cadastro', { categoriasReceita, insumos, title: 'Cadastro de Receita' })
    }

    async novo(req, res) {
        try {
            let vetError = [];
            let passou = false;
            var criou = false;

            if (!req.body.nome) {
                passou = true;
                vetError.push('Informe um nome para a receita')
            }

            if (!req.body.modoPreparo) {
                passou = true;
                vetError.push('Informe o modo de preparo')
            }

            if (!req.body.qtdeRendimento) {
                passou = true;
                vetError.push('Informe a quantidade de rendimento')
            }

            if (!req.body.tempoPreparo) {
                passou = true;
                vetError.push('Informe o tempo de preparo')
            }

            if (typeof req.body.insumo == "undefined") {
                passou = true;
                vetError.push('Informe ingredientes para a receita')
            } else {
                if (typeof req.body.insumo != 'object') {
                    if (req.body.qtdeInsumo <= 0) {
                        passou = true;
                        vetError.push('Informe a quantidade do ingrediente')
                    }
                } else {
                    for (let i = 0; i < req.body.qtdeInsumo.length; i++) {
                        if (req.body.qtdeInsumo[i] <= 0) {
                            passou = true;
                            vetError.push('Informe a quantidade do ingrediente ' + i);
                        }
                    }
                }
            }

            if (passou) {
                req.flash('error', vetError)
                return res.redirect('/receita/cadastro')
            } else {
                if (req.file) {
                    const { filename } = req.file;
                    await Receita.create({ nome: req.body.nome, modoPreparo: req.body.modoPreparo, obs: req.body.obs, qtdeRendimento: req.body.qtdeRendimento, tempoPreparo: req.body.tempoPreparo, categoriaReceita: req.body.categoriaReceita, imgReceita: filename }, async function (err, newObj) {
                        if (err) {
                            throw err;
                        } else if (!newObj) {
                            throw new Error("Objeto não encontrado")
                        } else {
                            var total = req.body.insumo.length;

                            if (typeof req.body.insumo != 'object') {
                                try {
                                    criou = true;
                                    await ItemReceita.create({ qtdeInsumo: req.body.qtdeInsumo, medida: req.body.medida, insumo: req.body.insumo, receita: newObj._id });
                                }
                                catch (erro) {
                                    console.error(erro);
                                    criou = false;
                                    res.sendStatus(500).end();
                                }
                            } else {
                                for (let i = 0; i < total; i++) {
                                    try {
                                        criou = true;
                                        await ItemReceita.create({ qtdeInsumo: req.body.qtdeInsumo[i], medida: req.body.medida[i], insumo: req.body.insumo[i], receita: newObj._id });
                                    }
                                    catch (erro) {
                                        console.error(erro);
                                        criou = false;
                                        res.sendStatus(500).end();
                                    }
                                }
                            }

                            if (criou) {
                                return res.redirect('/receita/listar');
                            } else {
                                req.flash('error', 'Ocorreu um erro ao cadastrar a receita')
                                return res.redirect('/receita/cadastro')
                            }
                        }
                    })
                } else {
                    await Receita.create({ nome: req.body.nome, modoPreparo: req.body.modoPreparo, obs: req.body.obs, qtdeRendimento: req.body.qtdeRendimento, tempoPreparo: req.body.tempoPreparo, categoriaReceita: req.body.categoriaReceita }, async function (err, newObj) {
                        if (err) {
                            throw err;
                        } else if (!newObj) {
                            throw new Error("Objeto não encontrado")
                        } else {

                            var total = req.body.insumo.length;

                            if (typeof req.body.insumo != 'object') {
                                try {
                                    criou = true;
                                    await ItemReceita.create({ qtdeInsumo: req.body.qtdeInsumo, medida: req.body.medida, insumo: req.body.insumo, receita: newObj._id });
                                }
                                catch (erro) {
                                    criou = false;
                                    console.error(erro);
                                    res.sendStatus(500).end();
                                }
                            } else {
                                for (let i = 0; i < total; i++) {
                                    try {
                                        criou = true;
                                        await ItemReceita.create({ qtdeInsumo: req.body.qtdeInsumo[i], medida: req.body.medida[i], insumo: req.body.insumo[i], receita: newObj._id });
                                    }
                                    catch (erro) {
                                        criou = false;
                                        console.error(erro);
                                        res.sendStatus(500).end();
                                    }
                                }
                            }

                            if (criou) {
                                return res.redirect('/receita/listar');
                            } else {
                                req.flash('error', 'Ocorreu um erro ao cadastrar a receita')
                                return res.redirect('/receita/cadastro')
                            }
                        }
                    })
                }
            }

        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listar(req, res) {
        try {
            const filtros = {}

            if (req.query.nome) {
                filtros.nome = new RegExp(req.query.nome, 'i') //i = insensitive
            }

            if (req.query.qtdeRendimento) {
                filtros.qtdeRendimento = {}
                filtros.qtdeRendimento.$gte = req.query.qtdeRendimento
            }

            const receitas = await Receita.paginate({},
                {
                    limit: 12,
                    page: req.query.page || 1,
                    populate: ['categoriaReceita'],
                    sort: '-criadaEm'
                })

            return res.render('receita/listagem', { receitas, title: 'Listagem de Receita' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const receita = await Receita.findById(id);
            if (receita) {
                res.send(receita);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const receita = await Receita.findOne({ _id: req.params.id });
        const categoriasReceita = await CategoriaReceita.find().sort({ categoria: 'asc' })
        const itensReceita = await ItemReceita.find({ receita: req.params.id })
        const insumos = await Insumo.find()

        if (receita.dtCalculoPrecoMedio) {
            var dataReceita = formataData(receita.dtCalculoPrecoMedio)
        }

        let vetIdReceitaItens = []
        for (let i = 0; i < itensReceita.length; i++) {
            vetIdReceitaItens.push(itensReceita[i].insumo)
        }

        if (receita) {
            return res.render('receita/editar', { receita, valorMedioPorcao: receita.valorMedioPorcao.toFixed(2), valorMedio: receita.valorMedio.toFixed(2), categoriasReceita, itensReceita, insumos, vetIdReceitaItens, dataReceita, controle: 1, title: 'Edição de Receita' })
        } else {
            console.error('Receita não encontrada')
        }
    }

    async atualizar(req, res) {
        const id = req.params.id;

        try {
            if (req.file) {
                var { filename } = req.file
            }

            if (req.body.dtCalculoPrecoMedio) {
                const data = moment(formatDate(req.body.dtCalculoPrecoMedio))
                if (req.file) {

                    console.log('---------------filename---')
                    console.log(filename)
                    console.log('--------------------------')

                    var receita = await Receita.findByIdAndUpdate(id, { ...req.body, dtCalculoPrecoMedio: data, imgReceita: filename });
                } else {
                    var receita = await Receita.findByIdAndUpdate(id, { ...req.body, dtCalculoPrecoMedio: data });
                }
            } else {
                if (req.file) {
                    var receita = await Receita.findByIdAndUpdate(id, { ...req.body, imgReceita: filename });
                } else {
                    var receita = await Receita.findByIdAndUpdate(id, { ...req.body });
                }
            }

            await ItemReceita.remove({ receita: receita._id })

            if (req.body.insumo != undefined) {
                var total = req.body.qtdeInsumo.length;

                if (typeof req.body.insumo != 'object') {
                    await ItemReceita.create({ qtdeInsumo: req.body.qtdeInsumo, medida: req.body.medida, insumo: req.body.insumo, receita: receita._id });
                } else {
                    for (let i = 0; i < total; i++) {
                        try {
                            await ItemReceita.create({ qtdeInsumo: req.body.qtdeInsumo[i], medida: req.body.medida[i], insumo: req.body.insumo[i], receita: receita._id });
                        }
                        catch (erro) {
                            console.error(erro);
                            res.sendStatus(500).end();
                        }
                    }
                }
            }

            if (receita) {
                res.redirect('/receita/listar')
            } else {
                res.sendStatus(404).end();
                console.error('Receita não atualizada')
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async excluir(req, res) {
        const id = req.params.id;
        var podeExcluir = true
        let vetError = []
        const itemReceitaDia = await ItemReceitaPorDia.find({ receita: id })
        const produto = await Produto.find({ receita: id })
        const receita = await Receita.findById(id)

        if (itemReceitaDia.length > 0) {
            podeExcluir = false
            vetError.push(receita.nome + ' possui produtos, não é possível ser deletado(a)')
        }

        if (produto.length > 0) {
            podeExcluir = false
            vetError.push(receita.nome + ' possui receitas por dia, não é possível ser deletado(a)')
        }

        if (!podeExcluir) {
            req.flash('error', vetError)
            return res.redirect('/receita/listar');
        } else {
            try {
                const historicoReceita = await HistoricoReceita.find({ receita: id })
                const receita = await Receita.findByIdAndDelete(id);
                const itensReceita = await ItemReceita.find({ receita: receita._id });
                const estoque = await Estoque.find({ receita: receita._id })

                if (historicoReceita.length > 0) {
                    await HistoricoReceita.remove({ receita: id });
                }

                if (itensReceita.length > 0) {
                    await ItemReceita.remove({ receita: receita._id });
                }

                if (estoque.length > 0) {
                    await Estoque.remove({ receita: receita._id });
                }

                if (receita) {
                    res.redirect('/receita/listar');
                } else {
                    res.sendStatus(404).end();
                }
            } catch (erro) {
                console.error(erro);
                res.sendStatus(500);
            }
        }
    }

    async calcularMedia(req, res) {
        const receita = await Receita.findById(req.params.id);
        let nomeReceita = receita.nome;
        let receitaId = receita._id;
        let qtdePorcao = receita.qtdeRendimento;

        let custoPorcao = 0;
        let custoReceita = 0;
        const itensReceita = await ItemReceita.find({ receita: receita._id });

        console.log('itens receita')
        console.log(itensReceita)

        let valorZerado = false;

        if (itensReceita.length > 0) {
            for (let i = 0; i < itensReceita.length; i++) {
                const insumo = await Insumo.findById(itensReceita[i].insumo);
                let precoMedio = 0

                if (insumo) {
                    precoMedio = insumo.precoMedio;
                }

                if (precoMedio <= 0) {
                    valorZerado = true;
                    break;
                }

                let qtdeItemReceita = itensReceita[i].qtdeInsumo;
                let qtdeInsumo = 0
                let medida = itensReceita[i].medida;

                console.log('---------------------------------------')
                console.log('Insumo:' + i)
                console.log(insumo)
                console.log('Medida: ' + medida)
                console.log('preco Medio: ' + precoMedio)
                console.log('qtde Item Receita: ' + qtdeItemReceita)
                console.log('qtdeInsumo I: ' + qtdeInsumo)

                switch (medida) {
                    case 'L':
                    case 'KG':
                        qtdeInsumo = parseFloat(qtdeItemReceita * 1000);
                        break;
                    case 'MG':
                        qtdeInsumo = parseFloat(qtdeItemReceita / 1000);
                        break;
                    case 'G':
                    case 'Unidade':
                    case 'ML':
                        qtdeInsumo = parseFloat(qtdeItemReceita);
                        break;
                    case 'Colher Sopa':
                        qtdeInsumo = parseFloat(qtdeItemReceita * 15);
                        break;
                    case 'Colher Cha':
                        qtdeInsumo = parseFloat(qtdeItemReceita * 5);
                        break;
                    case 'Xicara':
                        qtdeInsumo = parseFloat(qtdeItemReceita * 250);
                        break;
                    case 'Duzia':
                        qtdeInsumo = parseFloat(qtdeItemReceita * 12);
                        break;
                    case 'Copo':
                        qtdeInsumo = parseFloat(qtdeItemReceita * 200);
                        break;
                }

                console.log('qtdeInsumo II: ' + qtdeInsumo)

                if (qtdeInsumo > 0) {
                    custoReceita += parseFloat(precoMedio * qtdeInsumo);
                    if (qtdePorcao > 0) {
                        custoPorcao += parseFloat(precoMedio * qtdeInsumo / qtdePorcao);
                    }
                    let valorx = precoMedio * qtdeInsumo
                    let valorx2 = precoMedio * qtdeInsumo / qtdePorcao
                    console.log('custoReceita: ' + precoMedio + 'x' + qtdeInsumo + '=' + valorx)
                    console.log('custoPorcao: ' + precoMedio + 'x' + qtdeInsumo + '/' + qtdePorcao + '=' + valorx2)
                }

                console.log('---------------------------------------')
            }

            if (valorZerado) {
                res.send('');
            } else {
                let dtInicialCalculoPrecoMedio = new Date();
                dtInicialCalculoPrecoMedio.setHours(0);
                dtInicialCalculoPrecoMedio.setMinutes(0);
                dtInicialCalculoPrecoMedio.setSeconds(0);

                let dtFinalCalculoPrecoMedio = new Date();
                dtFinalCalculoPrecoMedio.setHours(23);
                dtFinalCalculoPrecoMedio.setMinutes(59);
                dtFinalCalculoPrecoMedio.setSeconds(59);

                let dtCalculoPrecoMedio = new Date()

                const dataHistorico = await HistoricoReceita.find({
                    receita: receitaId,
                    dtCalculoPrecoMedio: {
                        $gte: dtInicialCalculoPrecoMedio, $lte: dtFinalCalculoPrecoMedio
                    }
                });

                console.log('dataHistorico.length')
                console.log(dataHistorico.length)
                console.log('dataHistorico')
                console.log(dataHistorico)
                // console.log(dataHistorico[0].dtCalculoPrecoMedio)
                console.log(dtInicialCalculoPrecoMedio)
                console.log(dtFinalCalculoPrecoMedio)

                if (dataHistorico.length == 0) {
                    console.log('Novo Histórico')
                    const historicoReceita = await HistoricoReceita.create({ valorMedio: custoReceita, valorMedioPorcao: custoPorcao, dtCalculoPrecoMedio: dtCalculoPrecoMedio, receita: req.params.id, receitaNome: nomeReceita });
                } else {
                    console.log('Histórico Atualizado')
                    const historicoReceita = await HistoricoReceita.findByIdAndUpdate(dataHistorico[0]._id, { valorMedio: custoReceita, valorMedioPorcao: custoPorcao, dtCalculoPrecoMedio: dtCalculoPrecoMedio, receita: req.params.id, receitaNome: nomeReceita })
                }

                const receita = await Receita.findByIdAndUpdate(req.params.id, { valorMedio: custoReceita, valorMedioPorcao: custoPorcao, dtCalculoPrecoMedio: dtCalculoPrecoMedio });

                res.send(custoReceita.toFixed(2) + '/' + custoPorcao.toFixed(2) + '/' + dtCalculoPrecoMedio);
            }
        } else {
            res.send('Nenhum');
        }
    }

    async calcularMediaLogin(req, res) {
        const receitas = await Receita.find();

        for (let x = 0; x < receitas.length; x++) {
            let nomeReceita = receitas[x].nome;
            let receitaId = receitas[x]._id;
            let qtdePorcao = receitas[x].qtdeRendimento;

            let custoPorcao = 0;
            let custoReceita = 0;

            const itensReceita = await ItemReceita.find({ receita: receitas[x]._id });
            console.log('receita: ' + receitas[x].nome)
            let valorZerado = false;

            if (itensReceita) {
                for (let i = 0; i < itensReceita.length; i++) {

                    const insumo = await Insumo.findById(itensReceita[i].insumo);

                    let precoMedio = 0

                    if (insumo) {
                        precoMedio = insumo.precoMedio;
                    }

                    if (precoMedio <= 0) {
                        valorZerado = true;
                        break;
                    }

                    let qtdeItemReceita = itensReceita[i].qtdeInsumo;
                    let qtdeInsumo = 0
                    let medida = itensReceita[i].medida;

                    switch (medida) {
                        case 'L':
                        case 'KG':
                            qtdeInsumo = parseFloat(qtdeItemReceita * 1000);
                            break;
                        case 'MG':
                            qtdeInsumo = parseFloat(qtdeItemReceita / 1000);
                            break;
                        case 'G':
                        case 'Unidade':
                        case 'ML':
                            qtdeInsumo = parseFloat(qtdeItemReceita);
                            break;
                        case 'Colher Sopa':
                            qtdeInsumo = parseFloat(qtdeItemReceita * 15);
                            break;
                        case 'Colher Cha':
                            qtdeInsumo = parseFloat(qtdeItemReceita * 5);
                            break;
                        case 'Xicara':
                            qtdeInsumo = parseFloat(qtdeItemReceita * 250);
                            break;
                        case 'Duzia':
                            qtdeInsumo = parseFloat(qtdeItemReceita * 12);
                            break;
                        case 'Copo':
                            qtdeInsumo = parseFloat(qtdeItemReceita * 200);
                            break;
                    }


                    if (qtdeInsumo > 0) {
                        custoReceita += parseFloat(precoMedio * qtdeInsumo);
                        if (qtdePorcao > 0) {
                            custoPorcao += parseFloat(precoMedio * qtdeInsumo / qtdePorcao);
                        }
                    }
                }

                console.log('valorZerado')
                console.log(valorZerado)

                if (!valorZerado) {
                    let dtInicialCalculoPrecoMedio = new Date();
                    dtInicialCalculoPrecoMedio.setHours(0);
                    dtInicialCalculoPrecoMedio.setMinutes(0);
                    dtInicialCalculoPrecoMedio.setSeconds(0);

                    let dtFinalCalculoPrecoMedio = new Date();
                    dtFinalCalculoPrecoMedio.setHours(23);
                    dtFinalCalculoPrecoMedio.setMinutes(59);
                    dtFinalCalculoPrecoMedio.setSeconds(59);

                    let dtCalculoPrecoMedio = new Date()

                    const dataHistorico = await HistoricoReceita.find({
                        receita: receitaId,
                        dtCalculoPrecoMedio: {
                            $gte: dtInicialCalculoPrecoMedio, $lte: dtFinalCalculoPrecoMedio
                        }
                    });

                    if (dataHistorico.length == 0) {
                        console.log('Novo Histórico')
                        const historicoReceita = await HistoricoReceita.create({ valorMedio: custoReceita, valorMedioPorcao: custoPorcao, dtCalculoPrecoMedio: dtCalculoPrecoMedio, receita: receitas[x]._id, receitaNome: nomeReceita });
                    } else {
                        console.log('Histórico Atualizado')
                        const historicoReceita = await HistoricoReceita.findByIdAndUpdate(dataHistorico[0]._id, { valorMedio: custoReceita, valorMedioPorcao: custoPorcao, dtCalculoPrecoMedio: dtCalculoPrecoMedio, receita: receitas[x]._id, receitaNome: nomeReceita })
                    }

                    await Receita.findByIdAndUpdate(receitas[x]._id, { valorMedio: custoReceita, valorMedioPorcao: custoPorcao, dtCalculoPrecoMedio: dtCalculoPrecoMedio });
                }
            }
        }
    }

    async historicoPreco(req, res) {
        const receitas = await Receita.find();
        var date = new Date();
        var primeiroDia = formataData(new Date(date.getFullYear(), date.getMonth(), 1));
        var ultimoDia = formataData(new Date(date.getFullYear(), date.getMonth() + 1, 0));
        return res.render('receita/historicoPreco', { receitas, primeiroDia, ultimoDia, title: 'Histório de Preços Receita' });
    }

    async historicoPrecoPorReceita(req, res) {
        /*
            Busca campo dtCalculoPrecoMedio na receita no intervalo informado e mostra o histórico de preços da receita
        */

        let { dtInicial, dtFinal, receita } = req.params;
        let dataString = dtFinal.split('-')
        var dataFinal = new Date(`${dataString[1]} ${dataString[0]} ,${dataString[2]}  20:59:59`);
        var dtInicialMoment = moment(dtInicial, "DD/MM/YYYY");
        var dtFinalMoment = moment(dataFinal, "DD/MM/YYYY H:mm:ss");

        console.log('Dt Inicial:' + dtInicialMoment._id)
        console.log('Dt Final:' + dtFinalMoment._id)

        var historicoReceita = await HistoricoReceita.find({
            receita: receita,
            dtCalculoPrecoMedio: {
                $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
            }
        })

        return res.send(historicoReceita);
    }

    async mediaPrecosReceitaDespesa(req, res) {
        var date = new Date();
        var primeiroDia = formataData(new Date(date.getFullYear(), date.getMonth(), 1));
        var ultimoDia = formataData(new Date(date.getFullYear(), date.getMonth() + 1, 0));
        return res.render('receita/mediaPrecoComDespesas', { primeiroDia, ultimoDia, title: 'Média de Preços Receita' });
    }

    async obterMediaPrecosReceitaDespesa(req, res) {
        /*
            1 - Com o filtro de data o sistema soma todos os valores dos impostos e despesas no período.
            2 - Busca receitas feitas conforme o período selecionado 
            3 - Nas receitas encontradas são acumulados os itens e agrupados por receita
            4 - Para cada receita é feita uma por valores na tabela de de histórico
            5 - É acumulado os valores médios encontrados (o último de cada data)
            6 - É calculado a porcentagem de cada item pela quantiade de receitas
            7 - É realizada soma do valor médio pela porcentagem de impostos pagos
        */

        let { dtInicial, dtFinal } = req.params;
        let dataInicialString = dtInicial.split('-');
        let dataFinalString = dtFinal.split('-');
        var dataInicial = new Date(`${dataInicialString[1]} ${dataInicialString[0]} ,${dataInicialString[2]}`);
        var dataFinal = new Date(`${dataFinalString[1]} ${dataFinalString[0]} ,${dataFinalString[2]}  23:59:59`);
        // dataFinal.setDate(dataFinal.getDate() - 1);
        var dtInicialMoment = moment(dataInicial, "DD/MM/YYYY");
        var dtFinalMoment = moment(dataFinal, "DD/MM/YYYY H:mm:ss");

        var vetFinal = [];

        //Acha preço impostos
        var impostos = await Imposto.find({
            dataPgto: {
                $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
            }
        })

        console.log('Data Inicial: ' + dtInicialMoment._d)
        console.log('Data Final: ' + dtFinalMoment._d)
        console.log('--------------------INICIO-------------------------------')

        var vlTotalImpostos = 0;
        if (impostos.length > 0) {
            for (let i = 0; i < impostos.length; i++) {
                vlTotalImpostos += impostos[i].valorTotal;
            }
            console.log('vlTotal Impostos(var vlTotal): ' + vlTotalImpostos)
        }

        //Acha receitas feitas
        var receitasPorDia = await ReceitaPorDia.find({
            data: {
                $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
            }
        })
        console.log('receitasPorDia')
        console.log(receitasPorDia)

        var vetItemReceitasAcm = [] // 1
        var vetReceitasHistorico = []; //2

        console.log('Length receitasPorDia: ' + receitasPorDia.length)

        if (receitasPorDia.length > 0) {

            for (let i = 0; i < receitasPorDia.length; i++) {

                let receitasPorDiaItem = await ItensReceitaPorDia.find({ receitaPorDia: receitasPorDia[i]._id })

                if (receitasPorDiaItem.length > 0) {
                    // 1 - Acumulando itens (receitas) das receitas feitas por dia
                    for (let x = 0; x < receitasPorDiaItem.length; x++) {
                        var objReceitaAcm = {}
                        var achouReceitaAcm = true
                        if (vetItemReceitasAcm.length == 0) {
                            objReceitaAcm.receitaId = receitasPorDiaItem[x].receita
                            objReceitaAcm.quantidade = parseFloat(receitasPorDiaItem[x].quantidade)
                            vetItemReceitasAcm.push(objReceitaAcm)
                        } else {
                            var achouReceitaAcm = false;
                            for (let y = 0; y < vetItemReceitasAcm.length; y++) {
                                if (vetItemReceitasAcm[y].receitaId.toString() == receitasPorDiaItem[x].receita.toString()) {
                                    achouReceitaAcm = true;
                                    vetItemReceitasAcm[y].quantidade += parseFloat(receitasPorDiaItem[x].quantidade)
                                }
                            }
                        }

                        if (!achouReceitaAcm) {
                            objReceitaAcm.receitaId = receitasPorDiaItem[x].receita
                            objReceitaAcm.quantidade = parseFloat(receitasPorDiaItem[x].quantidade)
                            vetItemReceitasAcm.push(objReceitaAcm)
                        }
                    }
                }
            }

            let varTrue1 = true
            if (varTrue1) {
                console.log('vetItemReceitasAcm')
                console.log('vetor de Receitas Acumuladas')
                console.log(vetItemReceitasAcm)
                console.log('----------------')
                console.log('----------------')
                console.log('')
            }

            //2 - Com o acumulado das receitas é buscado o histórico de cada uma
            for (let i = 0; i < vetItemReceitasAcm.length; i++) {
                console.log('----xxx---')
                console.log(vetItemReceitasAcm[i].receitaId.toString())
                console.log(vetItemReceitasAcm[i].quantidade)
                console.log('')

                var historicoReceitas = await HistoricoReceita.find({
                    dtCalculoPrecoMedio: {
                        $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
                    },
                    receita: vetItemReceitasAcm[i].receitaId
                })//.sort({ data: 'desc' })

                console.log('Length historicoReceitas: ' + historicoReceitas.length)
                // console.log('ID:' + historicoReceitas[i].id)
                // console.log(historicoReceitas[i].receitaNome)
                // console.log(historicoReceitas[i].dtCalculoPrecoMedio)
                // console.log(historicoReceitas[i].valorMedio)
                // console.log(historicoReceitas[i].valorMedioPorcao)
                // console.log('')

                //Acumula valores médios do histórico
                if (historicoReceitas.length > 0) {

                    var objReceitaHistorico = {}
                    objReceitaHistorico.vlMedio = 0


                    for (let j = 0; j < historicoReceitas.length; j++) {
                        console.log('ID:' + historicoReceitas[j].id)
                        console.log(historicoReceitas[j].receitaNome)
                        console.log(historicoReceitas[j].receita.toString())
                        console.log(historicoReceitas[j].valorMedio)
                        console.log(historicoReceitas[j].dtCalculoPrecoMedio)
                        console.log('XXXXXX--XXXXXX')
                        console.log('')

                        objReceitaHistorico.id = historicoReceitas[j].receita
                        objReceitaHistorico.vlMedio = parseFloat(parseFloat(objReceitaHistorico.vlMedio).toFixed(2)) + parseFloat((parseFloat(historicoReceitas[j].valorMedio).toFixed(2)))
                        console.log('FIXEDDDD:' + parseFloat(parseFloat(historicoReceitas[j].valorMedio).toFixed(2)))
                        console.log('objReceitaHistorico.vlMedio:' + objReceitaHistorico.vlMedio)
                        objReceitaHistorico.quantidade = vetItemReceitasAcm[i].quantidade
                        objReceitaHistorico.quantidadeHistórico = historicoReceitas.length
                    }

                    vetReceitasHistorico.push(objReceitaHistorico)
                    console.log('vetReceitasHistorico')
                    for (let h = 0; h < vetReceitasHistorico.length; h++) {
                        console.log('vetReceitasHistorico: ' + h)
                        console.log(vetReceitasHistorico[h].id.toString())
                        console.log(vetReceitasHistorico[h].vlMedio)
                        console.log(vetReceitasHistorico[h].quantidade)
                        console.log('')
                    }
                }
            }

            let varTrue2 = true
            if (varTrue2) {
                console.log('----------------')
                console.log('----------------')
                console.log('vetor de históricos')
                console.log(vetReceitasHistorico)
                console.log('----------------')
                console.log('----------------')
            }

            if (vetReceitasHistorico.length > 0) {
                //Calcula valor Médio de cada item
                for (let i = 0; i < vetReceitasHistorico.length; i++) {
                    let objFinal = {}
                    objFinal.id = vetReceitasHistorico[i].id;
                    objFinal.vlMedio = vetReceitasHistorico[i].vlMedio / vetReceitasHistorico[i].quantidadeHistórico //vetReceitasHistorico[i].quantidade;
                    objFinal.qtde = vetReceitasHistorico[i].quantidade;
                    vetFinal.push(objFinal);
                }

                //Acumulador para calcular porcentagem
                let acmPorcentagem = 0
                for (let i = 0; i < vetFinal.length; i++) {
                    acmPorcentagem += vetFinal[i].qtde

                }

                //Calcula da porcentagem de cada item
                for (let i = 0; i < vetFinal.length; i++) {
                    vetFinal[i].porcentagem = (vetFinal[i].qtde / acmPorcentagem).toFixed(3);
                    console.log('vetFinal[i].porcentagem:' + i)
                    console.log(vetFinal[i].porcentagem)
                }

                //Calcula valor final de cada receita + impostos
                for (let i = 0; i < vetFinal.length; i++) {
                    var receita = await Receita.findById(vetFinal[i].id);
                    vetFinal[i].nomeReceita = receita.nome;
                    vetFinal[i].qtdeRendimento = receita.qtdeRendimento //* vetFinal[i].qtde;
                    console.log('Vl Medio:' + vetFinal[i].vlMedio)
                    console.log('Porcentagem: ' + vetFinal[i].porcentagem)
                    console.log('Total Impostos: ' + vlTotalImpostos)
                    vetFinal[i].vlReceita = vetFinal[i].vlMedio + ((vetFinal[i].porcentagem * vlTotalImpostos) / vetFinal[i].qtde);
                    //vetFinal[i].vlReceita = ((vetFinal[i].porcentagem * vlTotalImpostos) / vetFinal[i].qtde);
                }
            }
            return res.send(vetFinal)
        } else {
            return res.send(vetFinal)
        }

    }
}

function formataData(data) {
    var dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
    var mes = data.getMonth() + 1;
    mes = mes < 10 ? '0' + mes : mes;
    var ano = data.getFullYear();

    dtFormatada = dia + '/' + mes + '/' + ano;

    return dtFormatada;
}

function formatDate(stringData) {
    const dia = stringData.substring(0, 2)
    const mes = stringData.substring(3, 5)
    const ano = stringData.substring(6, 10)

    return ano + '-' + mes + '-' + dia
}

module.exports = new receitaController;