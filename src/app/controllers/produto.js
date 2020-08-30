const Produto = require('../models/Produto');
const Receita = require('../models/Receita');
const ItemVenda = require('../models/ItemVenda');

class produtoController {

    async index(req, res) {
        const receitas = await Receita.find().sort({ nome: 'asc' })
        return res.render('produto/cadastro', { receitas, title: 'Cadastro de Produto' })
    }

    async novo(req, res) {
        try {
            const produtos = await Produto.find()
            let achou = false
            if (produtos.length > 0) {
                for (let i = 0; i < produtos.length; i++) {
                    if (req.body.receita == produtos[i].receita) {
                        achou = true
                        break
                    }
                }
            }

            if (!achou) {
                let precoAux = req.body.preco.replace(/\./, '');
                let preco = parseFloat(precoAux.replace(/\,/, '.'))

                if (parseFloat(req.body.preco) != '') {
                    await Produto.create({ receita: req.body.receita, preco: preco });
                    return res.redirect('/produto/listar');
                } else {
                    req.flash('error', 'Informe um preço válido')
                    return res.redirect('/produto/cadastro')
                }
            } else {
                req.flash('error', 'Receita escolhida já possui produto criado')
                return res.redirect('/produto/cadastro')
            }

        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async listar(req, res) {
        try {
            const produtos = await Produto.find()
                .populate('receita');
            return res.render('produto/listagem', { produtos, title: 'Listagem de Produto' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const produto = await Produto.findById(id);
            if (produto) {
                res.send(produto);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const produto = await Produto.findOne({ _id: req.params.id });
        const receitas = await Receita.find().sort({ nome: 'asc' });

        if (produto) {
            return res.render('produto/editar', { produto, receitas, receitaPoduto: produto.receita, precoReceita: produto.preco, controle: 1, title: 'Edição de Produto' })
        } else {
            console.error('Produto não encontrado')
        }

    }

    async atualizar(req, res) {
        try {
            const id = req.params.id;
            const produtoReceita = await Produto.findById(id)
            const produtos = await Produto.find()

            let achou = false
            if (produtos.length > 0) {
                for (let i = 0; i < produtos.length; i++) {
                    if (req.body.receita == produtos[i].receita && req.body.receita != produtoReceita.receita) {
                        achou = true
                        break
                    }
                }
            }

            if (!achou) {

                let preco = req.body.preco.replace(/,/g, ".")

                if (parseFloat(req.body.preco) > 0) {
                    const produto = await Produto.findByIdAndUpdate(id, { receita: req.body.receita, preco: preco });
                    return res.redirect('/produto/listar');
                } else {
                    req.flash('error', 'Informe um preço válido')
                    return res.redirect(`/produto/editar/${id}`)
                }
            } else {
                req.flash('error', 'Receita escolhida já possui produto criado')
                return res.redirect(`/produto/editar/${id}`)
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
        const itemVenda = await ItemVenda.find({ produto: id })
        const produto = await Produto.findById(id)
        const receita = await Receita.findById(produto.receita)

        if (itemVenda.length > 0) {
            podeExcluir = false
            vetError.push(receita.nome + ' possui vendas, não é possível ser deletado(a)')
        }

        if (!podeExcluir) {
            req.flash('error', vetError)
            return res.redirect('/produto/listar');
        } else {
            try {
                const produto = await Produto.findByIdAndDelete(id);
                if (produto) {
                    res.redirect('/produto/listar');
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

module.exports = new produtoController;