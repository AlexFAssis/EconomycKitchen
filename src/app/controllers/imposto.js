const Imposto = require('../models/Imposto');
const TipoImposto = require('../models/TipoImposto');
const Usuario = require('../models/Usuario');
const moment = require('moment');

class impostoController {

    async index(req, res) {
        const tiposImposto = await TipoImposto.find().sort({ descricao: 'asc' })
        const usuarios = await Usuario.find().sort({ nome: 'asc' })
        var data = new Date();
        var dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
        var mes = data.getMonth() + 1;
        mes = mes < 10 ? '0' + mes : mes;
        var ano = data.getFullYear();
        var dataPagto = dia + '/' + mes + '/' + ano

        return res.render('imposto/cadastro', { tiposImposto, usuarios, dataPagto, title: 'Cadastro de Imposto' })
    }

    async novo(req, res) {
        try {
            let vetError = [];
            let passou = false;

            if (req.body.dataPgto) {
                var data = moment(formatDate(req.body.dataPgto))
            } else {
                passou = true;
                vetError.push('Informe uma data de pagamento')
            }

            if (passou) {
                req.flash('error', vetError)
                return res.redirect('/imposto/cadastro')
            } else {
                // let valorAux = parseFloat(req.body.valor)
                let valor = req.body.valor.replace(/,/g, ".")
                let valorTotal = req.body.valorTotal.replace(/,/g, ".")
                await Imposto.create({
                    dataPgto: data,
                    valor: valor,
                    tipoImposto: req.body.tipoImposto,
                    qtde: req.body.qtde,
                    itemImposto: req.body.itemImposto,
                    usuario: req.body.usuario,
                    valorTotal: valorTotal
                });

                return res.redirect('/imposto/listar');
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listar(req, res) {
        try {
            const impostos = await Imposto.find()
                .populate('tipoImposto').sort({ dataPgto: 'desc' })

            return res.render('imposto/listagem', { impostos, title: 'Listagem de Imposto' })
            // res.send(impostos);
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const imposto = await Imposto.findById(id);
            if (imposto) {
                res.send(imposto);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const imposto = await Imposto.findOne({ _id: req.params.id });
        const tiposImposto = await TipoImposto.find().sort({ descricao: 'asc' })
        const dataPgto = formataData(imposto.dataPgto);
        const usuarios = await Usuario.find().sort({ nome: 'asc' })

        if (imposto) {
            return res.render('imposto/editar', { imposto, tiposImposto, dataPgto, usuariosStr: JSON.stringify(usuarios), itStr: JSON.stringify(tiposImposto), title: 'Edição de Imposto' })
        } else {
            console.error('Imposto não encontrado')
        }

    }

    async atualizar(req, res) {

        const id = req.params.id;

        try {
            const data = moment(formatDate(req.body.dataPgto))
            let valor = req.body.valor.replace(/,/g, ".")
            let valorTotal = req.body.valorTotal.replace(/,/g, ".")
            const imposto = await Imposto.findByIdAndUpdate(id, { dataPgto: data, valor: valor, tipoImposto: req.body.tipoImposto, qtde: req.body.qtde, itemImposto: req.body.itemImposto, usuario: req.body.usuario, valorTotal: valorTotal });

            if (imposto) {
                res.redirect('/imposto/listar')
            } else {
                res.sendStatus(404).end();
                console.error('Imposto não atualizado')
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async excluir(req, res) {
        const id = req.params.id;
        try {
            const imposto = await Imposto.findByIdAndDelete(id);
            if (imposto) {
                res.redirect('/imposto/listar');
            } else {
                res.sendStatus(404).end();
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500);
        }
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

module.exports = new impostoController;