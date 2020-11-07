const Compra = require('../models/Compra');
const Insumo = require('../models/Insumo');
const ItemCompra = require('../models/ItemCompra');
const moment = require('moment');

class compraController {

    async index(req, res) {
        const insumos = await Insumo.find().sort({ nome: 'asc' })
        var data = new Date();
        var dia = data.getDate() < 10 ? '0' + data.getDate() : data.getDate();
        var mes = data.getMonth() + 1;
        mes = mes < 10 ? '0' + mes : mes;
        var ano = data.getFullYear();
        var dataCompra = dia + '/' + mes + '/' + ano

        return res.render('compra/cadastro', { insumos: insumos, dataCompra, title: 'Cadastro de Compra' })
    }

    // async novo2(req, res) {
    //     try {
    //         const { data, local, valorTotal, itensCompra } = req.body;
    //         const compra = await Compra.create({ data, local, valorTotal })

    //         //Inserindo itens - Com o new não salva automaticamente
    //         await Promisse.all(itensCompra.map(item => {
    //             const itemCompra = new ItemCompra({ ...item, compra: compra._id })

    //             //salva compra nos itens
    //             await itemCompra.save();
    //             compra.itensCompra.push(itemCompra)
    //         }));

    //         //atualiza compra
    //         await compra.save()

    //     } catch (err) {
    //         return res.status(400).send({ error: 'Erro ao criar a compra' })
    //     }
    // }

    // async editar2(req, res) {
    //     try {
    //         const { data, local, valorTotal, itensCompra } = req.body;

    //         const compra = await Compra.findByIdAndUpdate(req.params.id, {
    //             data,
    //             local,
    //             valorTotal
    //         }, { new: true }); //Faz retornar o valor atualizado da Compra

    //         //Deleta todas e recria os itens da compra
    //         compra.itensCompra = [];
    //         await ItemCompra.remove({ compra: compra._id })

    //         //Inserindo itens - Com o new não salva automaticamente
    //         await Promisse.all(itensCompra.map(item => {
    //             const itemCompra = new ItemCompra({ ...item, compra: compra._id })

    //             //salva compra nos itens
    //             await itemCompra.save();
    //             compra.itensCompra.push(itemCompra)
    //         }));

    //         //atualiza compra
    //         await compra.save()

    //     } catch (err) {
    //         return res.status(400).send({ error: 'Erro ao criar a compra' })
    //     }
    // }

    async novo(req, res) {
        try {
            let vetError = [];
            let passou = false;
            let criou = false;
            let atualizou = false;

            if (req.body.data) {
                var data = moment(formatDate(req.body.data))
            } else {
                passou = true;
                vetError.push('Informe a data da compra');
            }

            if (!req.body.local) {
                passou = true;
                vetError.push('Informe o local da compra');
            }

            if (req.body.valorTotal <= 0) {
                passou = true;
                vetError.push('Valor da compra inválido');
            }

            if (typeof req.body.insumo == 'undefined') {
                passou = true;
                vetError.push('Informe itens para a compra')
            } else {
                if (typeof req.body.insumo != 'object') {
                    if (req.body.quantidade <= 0) {
                        passou = true;
                        vetError.push('Informe a quantidade do item')
                    }

                    if (req.body.valor <= 0) {
                        passou = true;
                        vetError.push('Informe o valor do item')
                    }
                } else {
                    for (let i = 0; i < req.body.quantidade.length; i++) {
                        if (req.body.quantidade[i] <= 0) {
                            passou = true;
                            vetError.push('Informe a quantidade para o item: ' + i + 1);
                        }

                        if (req.body.valor[i] <= 0) {
                            passou = true;
                            vetError.push('Informe o valor para o item: ' + i + 1);
                        }
                    }
                }
            }

            if (passou) {
                req.flash('error', vetError)
                return res.redirect('/compra/cadastro');
            } else {
                await Compra.create({ data: data._d, local: req.body.local, valorTotal: req.body.valorTotal }, async function (err, newObj) {
                    if (err) {
                        throw err;
                    } else if (!newObj) {
                        throw new Error("Objeto não encontrado")
                    } else {
                        var total = req.body.insumo.length;

                        //Se houver apenas um item na compra não é objeto
                        if (typeof req.body.insumo != 'object') {
                            try {
                                let valorAux = req.body.valor.replace(/\./, '')
                                valorAux = valorAux.replace(/\,/, '.')

                                await ItemCompra.create({ quantidade: req.body.quantidade, valor: valorAux, marca: req.body.marca, insumo: req.body.insumo, unidadeMedida: req.body.unidadeMedida, compra: newObj._id });
                                criou = true;

                                const insumoOld = await Insumo.findById(req.body.insumo);

                                let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                                let valorEstoque = parseFloat(insumoOld.valorEstoque);
                                var precoMedio = 0

                                if (valorEstoque > 0 || qtdeEstoque > 0) {
                                    var precoMedio = parseFloat(insumoOld.precoMedio);
                                }

                                switch (req.body.unidadeMedida) {
                                    case 'Litro(s)':
                                    case 'KG':
                                        qtdeEstoque += parseFloat(req.body.quantidade) * 1000;
                                        break;
                                    case 'ML':
                                    case 'Grama(s)':
                                    case 'Unidade(s)':
                                        qtdeEstoque += parseFloat(req.body.quantidade);
                                        break;
                                    case 'MG':
                                        qtdeEstoque += parseFloat(req.body.quantidade) / 1000;
                                        break;
                                    case 'Dúzia':
                                        qtdeEstoque += parseFloat(req.body.quantidade) * 12;
                                        break;
                                }

                                //Atualiza estoque e preço médio
                                valorEstoque += parseFloat(req.body.valor.replace(/\,/, '.'))
                                if (qtdeEstoque > 0) {
                                    precoMedio = parseFloat(valorEstoque / qtdeEstoque);
                                } else {
                                    precoMedio = parseFloat(valorEstoque);
                                }

                                if (insumoOld) {
                                    try {
                                        const insumo = await Insumo.findByIdAndUpdate(req.body.insumo, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                                        atualizou = true;
                                    } catch (erro) {
                                        atualizou = false;
                                        console.error(erro)
                                        res.sendStatus(500).end();
                                    }
                                }
                            } catch (erro) {
                                criou = false;
                                console.error(erro)
                                res.sendStatus(500).end();
                            }

                            if (criou && atualizou) {
                                return res.redirect('/compra/listar');
                            } else {
                                req.flash('error', 'Ocorreu um erro ao cadastrar a compra')
                                return res.redirect('/compra/cadastro')
                            }
                        } else {
                            //Mais que um item na compra = Objeto
                            for (let i = 0; i < total; i++) {
                                try {
                                    let valorAux = req.body.valor[i].replace(/\./, '')
                                    valorAux = valorAux.replace(/\,/, '.')
                                    await ItemCompra.create({ quantidade: req.body.quantidade[i], valor: valorAux, marca: req.body.marca[i], insumo: req.body.insumo[i], unidadeMedida: req.body.unidadeMedida[i], compra: newObj._id });
                                    criou = true;
                                    const insumoOld = await Insumo.findById(req.body.insumo[i]);

                                    let qtdeEstoque = parseInt(insumoOld.qtdeEstoque);
                                    let valorEstoque = parseFloat(insumoOld.valorEstoque);
                                    let precoMedio = parseFloat(insumoOld.precoMedio);

                                    switch (req.body.unidadeMedida[i]) {
                                        case 'Litro(s)':
                                        case 'KG':
                                            qtdeEstoque += parseFloat(req.body.quantidade[i]) * 1000;
                                            break;
                                        case 'ML':
                                        case 'Grama(s)':
                                        case 'Unidade(s)':
                                            qtdeEstoque += parseFloat(req.body.quantidade[i]);
                                            break;
                                        case 'MG':
                                            qtdeEstoque += parseFloat(req.body.quantidade[i]) / 1000;
                                            break;
                                        case 'Dúzia':
                                            qtdeEstoque += parseFloat(req.body.quantidade[i]) * 12;
                                            break;
                                    }

                                    //Atualiza estoque e preço médio
                                    valorEstoque += parseFloat(req.body.valor[i].toString().replace(/\,/, '.'));
                                    if (qtdeEstoque > 0) {
                                        precoMedio = parseFloat(valorEstoque / qtdeEstoque);
                                    } else {
                                        precoMedio = parseFloat(valorEstoque);
                                    }

                                    if (insumoOld) {
                                        try {
                                            const insumo = await Insumo.findByIdAndUpdate(req.body.insumo[i], { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                                            atualizou = true;
                                        } catch (erro) {
                                            atualizou = false;
                                            console.error(erro)
                                            res.sendStatus(500).end()
                                        }
                                    }
                                }
                                catch (erro) {
                                    criou = false
                                    console.error(erro);
                                    res.sendStatus(500).end();
                                }
                            }

                            if (criou && atualizou) {
                                return res.redirect('/compra/listar');
                            } else {
                                req.flash('error', 'Ocorreu um erro ao cadastrar a compra')
                                return res.redirect('/compra/cadastro')
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
            const compras = await Compra.find().sort({ data: 'desc' })

            return res.render('compra/listagem', { compras, title: 'Listagem de Compras' })
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async obterUm(req, res) {
        const id = req.params.id;
        try {
            const compra = await Compra.findById(id);
            if (compra) {
                res.send(compra);
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async editar(req, res) {
        const compra = await Compra.findOne({ _id: req.params.id });
        const itensCompra = await ItemCompra.find({ compra: req.params.id });
        const dataCompra = formataData(compra.data);
        const insumos = await Insumo.find().sort({ nome: 'asc' })

        if (compra) {
            return res.render('compra/editar', { compra, dataCompra, itensCompra: itensCompra, insumos: insumos, title: 'Edição de Compras' })
        } else {
            console.error('Compra não encontrada')
        }
    }

    async atualizar(req, res) {
        const id = req.params.id;

        try {
            let valorTotal = req.body.valorTotal.replace(/,/g, ".")
            const data = moment(formatDate(req.body.data))
            const compra = await Compra.findByIdAndUpdate(id, { data: data, local: req.body.local, valorTotal: valorTotal });
            const itemCompra = await ItemCompra.find({ compra: compra._id })

            //Retira a quantidade atual de cada item, depois apaga
            if (itemCompra) {
                for (let i = 0; i < itemCompra.length; i++) {
                    const insumoOld = await Insumo.findById(itemCompra[i].insumo);
                    let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                    let valorEstoque = parseFloat(insumoOld.valorEstoque);
                    let precoMedio = parseFloat(insumoOld.precoMedio);

                    switch (itemCompra[i].unidadeMedida) {
                        case 'Litro(s)':
                        case 'KG':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade) * 1000;
                            break;
                        case 'ML':
                        case 'Grama(s)':
                        case 'Unidade(s)':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade);
                            break;
                        case 'MG':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade) / 1000;
                            break;
                        case 'Dúzia':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade) * 12;
                            break;
                    }

                    //Preço médio
                    console.log('----x----')
                    console.log(valorEstoque)
                    console.log(itemCompra[i].valor)
                    console.log(itemCompra[i].valor.toString())
                    console.log(itemCompra[i].valor.toString().replace(/\,/, '.'))
                    console.log('----x----')

                    valorEstoque -= parseFloat(itemCompra[i].valor.toString().replace(/\,/, '.'));
                    if (qtdeEstoque > 0) {
                        precoMedio = parseFloat(valorEstoque / qtdeEstoque);
                    } else {
                        precoMedio = parseFloat(valorEstoque);
                    }

                    if (insumoOld) {
                        const insumo = await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                    }
                }
                await ItemCompra.remove({ compra: compra._id })
            }

            //Atualiza estoque com a nova quantidade
            if (req.body.insumo != undefined) {
                var total = req.body.insumo.length;

                if (typeof req.body.insumo != 'object') {
                    let valorItem = req.body.valor.replace(/,/g, ".")

                    await ItemCompra.create({ quantidade: req.body.quantidade, valor: valorItem, marca: req.body.marca, insumo: req.body.insumo, unidadeMedida: req.body.unidadeMedida, compra: compra._id });

                    const insumoOld = await Insumo.findById(req.body.insumo);
                    let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                    let valorEstoque = parseFloat(insumoOld.valorEstoque);
                    let precoMedio = parseFloat(insumoOld.precoMedio);

                    switch (req.body.unidadeMedida) {
                        case 'Litro(s)':
                        case 'KG':
                            qtdeEstoque += parseFloat(req.body.quantidade) * 1000;
                            break;
                        case 'ML':
                        case 'Grama(s)':
                        case 'Unidade(s)':
                            qtdeEstoque += parseFloat(req.body.quantidade);
                            break;
                        case 'MG':
                            qtdeEstoque += parseFloat(req.body.quantidade) / 1000;
                            break;
                        case 'Dúzia':
                            qtdeEstoque += parseFloat(req.body.quantidade) * 12;
                            break;
                    }

                    console.log('----x1----')
                    console.log(valorEstoque)
                    console.log(req.body.valor)
                    console.log(req.body.valor.toString())
                    console.log(req.body.valor.toString().replace(/\,/, '.'))
                    console.log('----x1----')

                    //Atualiza Preço Médio
                    valorEstoque += parseFloat(req.body.valor.replace(/\,/, '.'))
                    if (qtdeEstoque > 0) {
                        precoMedio = parseFloat(valorEstoque / qtdeEstoque);
                    } else {
                        precoMedio = parseFloat(valorEstoque);
                    }

                    if (insumoOld) {
                        valorEstoque = valorEstoque.toFixed(2)
                        const insumo = await Insumo.findByIdAndUpdate(req.body.insumo, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                    }

                } else {
                    for (let i = 0; i < total; i++) {
                        try {
                            let valorItem = req.body.valor[i].replace(/,/g, ".")
                            await ItemCompra.create({ quantidade: req.body.quantidade[i], valor: valorItem, marca: req.body.marca[i], insumo: req.body.insumo[i], unidadeMedida: req.body.unidadeMedida[i], compra: compra._id });

                            const insumoOld = await Insumo.findById(req.body.insumo[i]);

                            let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                            let valorEstoque = parseFloat(insumoOld.valorEstoque);
                            let precoMedio = parseFloat(insumoOld.precoMedio);

                            switch (req.body.unidadeMedida[i]) {
                                case 'Litro(s)':
                                case 'KG':
                                    qtdeEstoque += parseFloat(req.body.quantidade[i]) * 1000;
                                    break;
                                case 'ML':
                                case 'Grama(s)':
                                case 'Unidade(s)':
                                    qtdeEstoque += parseFloat(req.body.quantidade[i]);
                                    break;
                                case 'MG':
                                    qtdeEstoque += parseFloat(req.body.quantidade[i]) / 1000;
                                    break;
                                case 'Dúzia':
                                    qtdeEstoque += parseFloat(req.body.quantidade[i]) * 12;
                                    break;
                            }

                            console.log('----x2----')
                            console.log(valorEstoque)
                            console.log(req.body.valor[i])
                            console.log(req.body.valor[i].toString())
                            console.log(req.body.valor[i].toString().replace(/\,/, '.'))
                            console.log('----x2----')

                            //Atualiza Preço Médio
                            valorEstoque += parseFloat(req.body.valor[i].toString().replace(/\,/, '.'));
                            valorEstoque = valorEstoque.toFixed(2)

                            if (qtdeEstoque > 0) {
                                precoMedio = parseFloat(valorEstoque / qtdeEstoque);
                            } else {
                                precoMedio = parseFloat(valorEstoque);
                            }

                            if (insumoOld) {
                                const insumo = await Insumo.findByIdAndUpdate(req.body.insumo[i], { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                            }
                        }
                        catch (erro) {
                            console.error(erro);
                            res.sendStatus(500).end();
                        }
                    }
                }
            }

            if (compra) {
                res.redirect('/compra/listar')
            } else {
                res.sendStatus(404).end();
                console.error('Compra não atualizada')
            }
        } catch (erro) {
            console.error(erro);
            res.sendStatus(500).end();
        }
    }

    async excluir(req, res) {
        const id = req.params.id;
        try {
            const compra = await Compra.findByIdAndDelete(id);
            const itemCompra = await ItemCompra.find({ compra: compra._id })

            //Remove itens do estoque
            if (itemCompra) {
                for (let i = 0; i < itemCompra.length; i++) {
                    const insumoOld = await Insumo.findById(itemCompra[i].insumo);
                    let qtdeEstoque = parseFloat(insumoOld.qtdeEstoque);
                    let valorEstoque = parseFloat(insumoOld.valorEstoque);
                    let precoMedio = parseFloat(insumoOld.precoMedio);

                    switch (itemCompra[i].unidadeMedida) {
                        case 'Litro(s)':
                        case 'KG':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade) * 1000;
                            break;
                        case 'ML':
                        case 'Grama(s)':
                        case 'Unidade(s)':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade);
                            break;
                        case 'MG':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade) / 1000;
                            break;
                        case 'Dúzia':
                            qtdeEstoque -= parseFloat(itemCompra[i].quantidade) * 12;
                            break;
                    }

                    //Atualiza Preço Médio
                    valorEstoque -= parseFloat(itemCompra[i].valor.toString().replace(/\,/, '.'));
                    valorEstoque = valorEstoque.toFixed(2)

                    if (qtdeEstoque > 0) {
                        precoMedio = parseFloat(valorEstoque / qtdeEstoque);
                    } else {
                        precoMedio = parseFloat(valorEstoque);
                    }

                    if (insumoOld) {
                        const insumo = await Insumo.findByIdAndUpdate(insumoOld._id, { qtdeEstoque: qtdeEstoque, valorEstoque: valorEstoque, precoMedio: precoMedio })
                    }
                }
                await ItemCompra.remove({ compra: compra._id })
            }

            if (compra) {
                res.redirect('/compra/listar');
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
        let compras = {}

        if (dtInicial && dtFinal) {
            var dtInicialMoment = moment(dtInicial, "DD/MM/YYYY");
            var dtFinalMoment = moment(dtFinal, "DD/MM/YYYY");

            compras = await Compra.find({
                data: {
                    $gte: dtInicialMoment._d, $lte: dtFinalMoment._d
                }
            })
        } else {
            compras = await Compra.find()
        }

        return res.render('compra/listagem', { compras, dtInicial, dtFinal })
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

module.exports = new compraController;