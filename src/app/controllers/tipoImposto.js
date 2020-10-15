const TipoImposto = require('../models/TipoImposto');
const Imposto = require('../models/Imposto');

class tipoImpostoController {

    async index(req, res) {
        return res.render('tipoImposto/cadastro', { title: 'Cadastro de Tipo de Imposto' })
    }

    async novo(req, res) {
        try {
            if (req.body.descricao) {
                const tiposImposto = await TipoImposto.find()

                var achouNome = false
                for (let i = 0; i < tiposImposto.length; i++) {
                    if (req.body.descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') == tiposImposto[i].descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
                        achouNome = true
                    }
                }

                if (!achouNome) {
                    await TipoImposto.create(req.body);
                    return res.redirect('/tipoImposto/listar');
                } else {
                    req.flash('error', 'Já existe um tipo de imposto com esse nome, digite outro nome')
                    return res.redirect('/tipoImposto/cadastro');
                }
            } else {
                res.sendStatus(404).end();
                console.error('Ocorreu um erro ao cadastrar o Tipo de imposto')
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listar(req, res) {
        try {
            const tiposImposto = await TipoImposto.find()
            return res.render('tipoImposto/listagem', { tiposImposto, title: 'Listagem de Tipo de Imposto' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const tipoImposto = await TipoImposto.findById(id);
            if (tipoImposto) {
                res.send(tipoImposto);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const tipoImposto = await TipoImposto.findOne({ _id: req.params.id });

        if (tipoImposto) {
            return res.render('tipoImposto/editar', { tipoImposto, title: 'Edição de Tipo de Imposto' })
        } else {
            console.error('Tipo de Imposto não encontrado')
        }
    }

    async atualizar(req, res) {
        try {
            if (req.body.descricao) {
                const id = req.params.id;
                const tiposImposto = await TipoImposto.find()
                const tipoEditado = await TipoImposto.findById(id)

                var achouNome = false

                for (let i = 0; i < tiposImposto.length; i++) {
                    if (tiposImposto[i]._id.toString() != tipoEditado._id.toString()) {
                        if (req.body.descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') == tiposImposto[i].descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') && req.body.descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') != tipoEditado.descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
                            achouNome = true
                        }
                    }
                }

                if (!achouNome) {
                    const tipoImposto = await TipoImposto.findByIdAndUpdate(id, req.body);
                    res.redirect('/tipoImposto/listar')
                } else {
                    req.flash('error', 'Já existe um insumo com esse nome, digite outro nome')
                    return res.redirect(`/tipoImposto/editar/${id}`);
                }
            } else {
                req.flash('error', 'Informe a descrição')
                return res.redirect('/tipoImposto/cadastro')
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
        const imposto = await Imposto.find({ tipoImposto: id })
        const tipoImposto = await TipoImposto.findById(id)

        if (imposto.length > 0) {
            podeExcluir = false
            vetError.push(tipoImposto.descricao + ' possui impostos, não é possível ser deletado(a)')
        }

        if (!podeExcluir) {
            req.flash('error', vetError)
            return res.redirect('/tipoImposto/listar');
        } else {
            try {
                const tipoImposto = await TipoImposto.findByIdAndDelete(id);
                if (tipoImposto) {
                    res.redirect('/tipoImposto/listar');
                } else {
                    res.sendStatus(404).end();
                }
            } catch (erro) {
                console.error(erro);
                res.sendStatus(500);
            }
        }
    }
}
module.exports = new tipoImpostoController;