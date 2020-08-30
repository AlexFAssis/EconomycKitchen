const Insumo = require('../models/Insumo');
const ItemCompra = require('../models/ItemCompra');
const ItemReceita = require('../models/ItemReceita');

class insumoController {

    async index(req, res) {
        return res.render('insumo/cadastro', { title: 'Cadastro de Insumo' })
    }

    async novo(req, res) {
        try {
            if (req.body.nome) {

                const insumos = await Insumo.find()

                var achouNome = false
                for (let i = 0; i < insumos.length; i++) {
                    if (req.body.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') == insumos[i].nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
                        achouNome = true
                    }
                }

                if (!achouNome) {
                    await Insumo.create(req.body);
                    return res.redirect('/insumo/listar');
                } else {
                    req.flash('error', 'Já existe um insumo com esse nome, digite outro nome')
                    return res.redirect('/insumo/cadastro');
                }
            } else {
                res.sendStatus(404).end();
                console.error('Ocorreu um erro ao cadastrar o Insumo')
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listar(req, res) {
        try {
            const insumos = await Insumo.find()
            return res.render('insumo/listagem', { insumos, title: 'Listagem de Insumo' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listarTodos(req, res) {
        try {
            const insumos = await Insumo.find()
            return res.render('insumo/listagemInsumos', { insumos, title: 'Listagem de Insumos' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const insumo = await Insumo.findById(id);
            if (insumo) {
                res.send(insumo);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const insumo = await Insumo.findOne({ _id: req.params.id });

        if (insumo) {

            if (insumo.valorEstoque == 0) {
                insumo.precoMedio = 0
            }

            return res.render('insumo/editar', { insumo, valorEstoque: insumo.valorEstoque.toFixed(2), precoMedio: insumo.precoMedio.toFixed(4), title: 'Edição de Insumo' })
        } else {
            console.error('Insumo não encontrado')
        }

    }

    async atualizar(req, res) {
        const id = req.params.id;
        const insumos = await Insumo.find()
        const insumosEditado = await Insumo.findById(id)

        var achouNome = false

        for (let i = 0; i < insumos.length; i++) {
            if (insumos[i]._id.toString() != insumosEditado._id.toString()) {
                if (req.body.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') == insumos[i].nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') && req.body.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') != insumosEditado.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) {
                    achouNome = true
                }
            }
        }

        try {
            if (!achouNome) {
                const insumo = await Insumo.findByIdAndUpdate(id, req.body);
                res.redirect('/insumo/listar')
            } else {
                req.flash('error', 'Já existe um insumo com esse nome, digite outro nome')
                return res.redirect(`/insumo/editar/${id}`);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async excluir(req, res) {
        var podeExcluir = true
        let vetError = []
        const id = req.params.id;
        const itemCompra = await ItemCompra.find({ insumo: id })
        const itemReceita = await ItemReceita.find({ insumo: id })
        const insumo = await Insumo.findById(id)

        if (itemCompra.length > 0) {
            podeExcluir = false
            vetError.push(insumo.nome + ' possui compras, não é possível ser deletado(a)')
        }

        if (itemReceita.length > 0) {
            podeExcluir = false
            vetError.push(insumo.nome + ' possui receitas, não é possível ser deletado(a)')
        }

        if (!podeExcluir) {
            req.flash('error', vetError)
            return res.redirect('/insumo/listar');
        } else {
            try {
                const insumo = await Insumo.findByIdAndDelete(id);
                if (insumo) {
                    res.redirect('/insumo/listar');
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
module.exports = new insumoController;