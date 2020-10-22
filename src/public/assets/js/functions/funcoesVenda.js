// (function () { --foi tirado da função auto executavel e no window.load 04/07/2020
'use strict';
let $mtdoPagto = document.getElementById('mtdoPagto')
let $btn = document.getElementById('btnAdicionar')
let $controle = document.getElementById('controle')
let $desconto = document.getElementById('desconto')

ocultaProdutos()

if ($desconto) {
  $(function () {
    $('#desconto').maskMoney();
  })

  $("#desconto").change(function () {
    calculaDesconto()
  });
}

if ($btn) {
  $btn.addEventListener('click', removerErros);
  $btn.addEventListener('click', adicionaItemCompra);
}

let $qtdeParcelas = document.getElementById('qtdeParcelas')
if ($qtdeParcelas) {
  $qtdeParcelas.disabled = true;
}


//Variavel para controle de edição
//somente edição
if ($controle) {
  adicionaEventos()
  carregaMetodoPgto()
  carregaUsuario()
  carregaProduto()
  casasDecimais()
}
// });
flatpickr('.flatpickr', {
  dateFormat: 'd/m/Y',
  locale: {
    // firstDayOfWeek: 1,
    weekdays: {
      shorthand: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      longhand: ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'],
    },
    months: {
      shorthand: ['Jan', 'Fev', 'Mar', 'Ab', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      longhand: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    },
  },
})

if ($mtdoPagto) {
  $mtdoPagto.addEventListener('change', function () {
    verificaParcelas($mtdoPagto.value)
  }, false)
}

RedimensionaBotaoExluir()

window.addEventListener('resize', function () {
  RedimensionaBotaoExluir()
})
// })()

function RedimensionaBotaoExluir() {
  let windowWidth = window.innerWidth;
  let $btnExcluir = document.getElementsByClassName('btnExcluir')
  let $divBtnExcluir = document.getElementsByClassName('divBtnExcluirVenda')

  if (windowWidth < 768) {
    for (let i = $btnExcluir.length - 1; i >= 0; i--) {
      $btnExcluir[i].value = 'Excluir Item'
      $btnExcluir[i].textAlign = 'center'
      $btnExcluir[i].setAttribute('style', 'margin-top:5px !important');
      $btnExcluir[i].style.marginBottom = '10px'
      $divBtnExcluir[i].setAttribute('class', 'col-md-12 divBtnExcluirVenda');
      $btnExcluir[i].style.width = '100%'
    }
  } else {
    for (let i = 0; i < $btnExcluir.length; i++) {
      $btnExcluir[i].value = 'X'
      $btnExcluir[i].textAlign = 'center'
      $btnExcluir[i].setAttribute('style', 'margin-top: 1.5rem!important');
      $btnExcluir[i].style.marginBottom = '0px'
      $divBtnExcluir[i].setAttribute('class', 'col-md-1 col-lg-1 col-xl-1 divBtnExcluirVenda');
      $btnExcluir[i].style.top = "5px"
    }
  }

  // document.querySelector('.window-size').innerHTML = windowWidth;
};

function verificaParcelas(valor) {
  var $qtdeParcelas = document.getElementById('qtdeParcelas')
  $qtdeParcelas.disabled = false;
  if (valor != 'Credito') {
    $qtdeParcelas.disabled = true;
    $qtdeParcelas.value = 0
  }
}

function adicionaItemCompra() {
  let $nenhumItem = document.getElementsByTagName('H4')
  if ($nenhumItem.length > 0) {
    $nenhumItem[0].style.display = 'none'
  }

  let $divPrincipal = document.getElementById('itens');
  let div = document.createElement("DIV")
  div.setAttribute('class', 'row')
  $divPrincipal.appendChild(div);

  campoProduto()
  campoQtde()
  campoValor()
  botaoExcluir()
  adicionaEventos()
  somaItens()

  function campoQtde() {
    //Adiciona Campo Quantidade
    let div1 = document.createElement("DIV")
    div1.setAttribute("class", "col-md-2")
    div.appendChild(div1);

    let quantidade = document.createElement("INPUT");
    quantidade.setAttribute("type", "number");
    quantidade.setAttribute("step", "1");
    quantidade.setAttribute("name", "quantidade");
    quantidade.setAttribute("value", "0");
    quantidade.setAttribute("class", "qtde form-control");
    quantidade.setAttribute("min", "1");
    quantidade.required = true;
    div1.appendChild(quantidade);

    let labelqtde = document.createElement("LABEL");
    let txtQtde = document.createTextNode("Quantidade");
    labelqtde.setAttribute("for", "quantidade");
    labelqtde.appendChild(txtQtde);

    div1.insertBefore(labelqtde, quantidade);
  }

  function campoProduto() {
    //Adiciona Select Campo Produto
    let div2 = document.createElement("DIV")
    div2.setAttribute("class", "col-xl-5 col-lg-6 col-md-6")
    div.appendChild(div2);
    let select = document.createElement("SELECT");
    select.setAttribute("name", "produto");
    select.setAttribute("class", "Prod form-control");
    div2.appendChild(select);

    let labelSelect = document.createElement("LABEL");
    let txtProduto = document.createTextNode("Produto");
    labelSelect.setAttribute("for", "produto");
    labelSelect.appendChild(txtProduto);

    div2.insertBefore(labelSelect, select);

    let final = qtdeProdutos()
    for (let i = 0; i < final; i++) {
      //Adiciona Itens Campo Insumo
      let itemSelect = document.createElement("OPTION");
      itemSelect.setAttribute("class", "prod");
      itemSelect.setAttribute("name", "produto");
      itemSelect.setAttribute("id", i);
      itemSelect.value = carregaItens(i).value;
      itemSelect.text = carregaItens(i).text;
      select.appendChild(itemSelect);
    }
  }

  function campoValor() {
    let div3 = document.createElement("DIV");
    div3.setAttribute("class", "col-md-3");
    div.appendChild(div3);

    let divGroup = document.createElement("DIV");
    divGroup.setAttribute("class", "input-group");
    div3.appendChild(divGroup);
    let divGroupPrepend = document.createElement("DIV");
    divGroupPrepend.setAttribute("class", "input-group-prepend");
    divGroup.appendChild(divGroupPrepend);
    let span = document.createElement('SPAN');
    span.setAttribute("class", "input-group-text");
    let txtSpan = document.createTextNode("R$");
    span.appendChild(txtSpan);
    divGroupPrepend.appendChild(span);

    let valor = document.createElement("INPUT");
    valor.setAttribute("type", "number");
    valor.setAttribute("step", "0.01");
    valor.setAttribute("name", "valor");
    valor.readOnly = true;
    valor.value = buscaValor(0); //1 = new
    valor.setAttribute("class", "vl form-control");
    divGroup.appendChild(valor);

    let labelqtde = document.createElement("LABEL");
    let txtQtde = document.createTextNode("Valor Un.");
    labelqtde.setAttribute("for", "valor");
    labelqtde.appendChild(txtQtde);

    // div3.insertBefore(labelqtde, valor);
    div3.insertBefore(labelqtde, divGroup);
  }

  function botaoExcluir() {
    let windowWidth = window.innerWidth;
    let div4 = document.createElement("DIV")

    if (windowWidth < 768) {
      div4.setAttribute("class", "col-md-12 divBtnExcluirVenda")
      div.appendChild(div4);
      let btnExcluir = document.createElement("INPUT");
      btnExcluir.setAttribute("type", "button");
      btnExcluir.setAttribute('textAlign', 'center');
      btnExcluir.setAttribute("name", "btnExcluir");
      btnExcluir.setAttribute("value", "Exluir Item");
      btnExcluir.setAttribute("class", "btnExcluir btn btn-danger mt-4");
      btnExcluir.setAttribute('style', 'margin-top:5px !important; width:100%');
      div4.appendChild(btnExcluir);

    } else {
      div4.setAttribute("class", "col-md-1 col-lg-1 col-xl-1 divBtnExcluirVenda")
      div4.setAttribute("top", "5px");
      // div4.setAttribute("class", "col-md-2")
      div.appendChild(div4);
      //Se for button gera submit
      let btnExcluir = document.createElement("INPUT");
      btnExcluir.setAttribute("type", "button");
      btnExcluir.setAttribute("name", "btnExcluir");
      btnExcluir.setAttribute("value", "X");
      btnExcluir.setAttribute("class", "btnExcluir btn btn-danger mt-4");
      div4.appendChild(btnExcluir);
    }
  }


  function adicionaEventos() {
    let $campoValor = document.getElementsByClassName('vl');
    let $produtos = document.getElementsByClassName('Prod');
    let $qtde = document.getElementsByClassName('qtde');

    for (let i = 0; i < $qtde.length; i++) {
      $qtde[i].addEventListener('blur', function (e) {
        somaItens()
        calculaDesconto()
      });
    }

    for (let i = 0; i < $produtos.length; i++) {
      $produtos[i].addEventListener('change', function (e) {
        $campoValor[i].value = buscaValor(e.target);
        somaItens()
        calculaDesconto()
      });
    }

    let $btn = document.getElementsByClassName('btnExcluir btn btn-danger');
    for (let i = 0; i < $btn.length; i++) {
      $btn[i].addEventListener('click', function (e) {
        deletarItem(e.target);
        somaItens()
      });
    }

  }
}

function removerErros() {
  let $erros = document.getElementById('error');
  if ($erros) {
    $erros.remove();
  }
}

function ocultaProdutos() {
  let $qtde = document.getElementsByClassName("hidden").length
  for (let i = 0; i < $qtde; i++) {
    document.getElementsByClassName("hidden")[i].style.display = "none";
  }
}

function qtdeProdutos() {
  let $qtdeProdutos = document.getElementsByClassName("itemVenda").length;

  return $qtdeProdutos;
}

function carregaItens(indice) {
  let $produtos = document.getElementsByClassName("itemVenda")[indice];

  return $produtos;
}

function buscaValor(indice) {
  let $produtos = document.getElementsByClassName('itemVenda')
  let $valor = document.getElementsByClassName('precoProduto')

  if (indice == 0) {
    for (let i = 0; i < $produtos.length; i++) {
      if ($produtos[indice].value == $valor[i].value) {
        $valor = parseFloat($valor[0].text).toFixed(2);
        break;
      }
    }
  } else {
    $valor = parseFloat($valor[indice.selectedIndex].text).toFixed(2);
  }

  return $valor;
}

function somaItens() {
  debugger
  let $campoValor = document.getElementsByClassName('vl')
  let $produtos = document.getElementsByClassName('Prod');
  let $qtde = document.getElementsByClassName('qtde');
  let $vlTotal = document.getElementById('vlVenda');
  let vlTotal = 0

  for (let i = 0; i < $campoValor.length; i++) {
    vlTotal += ($qtde[i]).value * parseFloat($campoValor[i].value.replace(/\,/, '.'))
  }

  $vlTotal.value = vlTotal.toFixed(2).replace(/\./, ',');
}

//Somente Edição
function carregaMetodoPgto() {

  let $select = document.getElementsByClassName('selectMetodo')
  let $metodoHidden = document.getElementById('mtdoPagtoHidden')
  let metodoPagto = document.getElementById('optionMetodoPgto')
  let $qtdeParcelas = document.getElementById('qtdeParcelas')

  for (let i = 0; i < $metodoHidden.length; i++) {
    let itemSelect = document.createElement("OPTION");

    itemSelect.selected = false;

    itemSelect.value = $metodoHidden[i].value;
    itemSelect.text = $metodoHidden[i].text;

    if ($metodoHidden[i].value == metodoPagto.value) {
      itemSelect.selected = true;
    }

    $select[0].appendChild(itemSelect);
  }

  $qtdeParcelas.disabled = false;
  if (metodoPagto.value != 'Credito') {
    $qtdeParcelas.value = 1
    $qtdeParcelas.disabled = true;
  }

  $select[0].removeChild($select[0].childNodes[1]);
}

function carregaUsuario() {
  let $select = document.getElementsByClassName('selectUsuarios')
  let $usuariosHidden = document.getElementById('users')
  let $usuario = document.getElementById('idUsuario')

  for (let i = 0; i < $usuariosHidden.length; i++) {
    let itemSelect = document.createElement("OPTION");

    itemSelect.selected = false;
    itemSelect.value = $usuariosHidden[i].value;
    itemSelect.text = $usuariosHidden[i].text;

    if ($usuariosHidden[i].value == $usuario.value) {
      itemSelect.selected = true;
    }

    $select[0].appendChild(itemSelect);
  }
}

function carregaProduto() {
  let $produtosVenda = document.getElementById('produtosVenda')
  let $selectProdutos = document.getElementsByClassName('Prod')
  let $produtosHidden = document.getElementsByClassName('itemVenda')

  for (let i = 0; i < $produtosVenda.length; i++) {
    for (let j = 0; j < $produtosHidden.length; j++) {
      let itemSelect = document.createElement("OPTION");

      itemSelect.selected = false;
      itemSelect.value = $produtosHidden[j].value;
      itemSelect.text = $produtosHidden[j].text;

      if ($produtosVenda[i].value == $produtosHidden[j].value) {
        itemSelect.selected = true;
      }

      $selectProdutos[i].appendChild(itemSelect);
    }
  }
}

function adicionaEventos() {
  let $campoValor = document.getElementsByClassName('vl');
  let $produtos = document.getElementsByClassName('Prod');
  let $qtde = document.getElementsByClassName('qtde');
  let $btnExcluir = document.getElementsByClassName('btnExcluir btn btn-danger')


  for (let i = 0; i < $qtde.length; i++) {
    $qtde[i].addEventListener('blur', function (e) {
      somaItens()
    });
  }

  for (let i = 0; i < $produtos.length; i++) {
    $produtos[i].addEventListener('change', function (e) {
      $campoValor[i].value = buscaValor(e.target);
      somaItens()
    });
  }

  var $btn = document.getElementsByClassName('btnExcluir btn btn-danger');
  for (let i = 0; i < $btn.length; i++) {
    $btn[i].addEventListener('click', function (e) {
      deletarItem(e.target);
      somaItens()
    });
  }

  for (let i = 0; i < $btnExcluir.length; i++) {
    $btnExcluir[i].addEventListener('click', function (e) {
      deletarItem(e.target);
    });
  }
}

function deletarItem(btn) {
  let elementoPaiBtn = btn.parentNode
  let elementoPai = elementoPaiBtn.parentNode

  if (elementoPai.parentNode) {
    elementoPai.parentNode.removeChild(elementoPai);
  }
}

function calculaDesconto() {
  let vlTotal = 0
  let $vlTotal = document.getElementById('vlVenda');
  let $desconto = document.getElementById('desconto');
  let $erro = document.getElementById('erroDesconto');
  let descontoAux = $desconto.value.replace(/\./g, '')
  descontoAux = descontoAux.replace(/,/, '.')

  $erro.style.display = 'none'
  $erro.innerText = ''

  let $campoValor = document.getElementsByClassName('vl')
  let $qtde = document.getElementsByClassName('qtde');

  for (let i = 0; i < $campoValor.length; i++) {
    vlTotal += ($qtde[i]).value * parseFloat($campoValor[i].value)
  }

  if (descontoAux == '') descontoAux = 0

  if (vlTotal >= parseFloat(descontoAux)) {
    vlTotal -= parseFloat(descontoAux);
    $vlTotal.value = vlTotal.toFixed(2);
  } else {
    $erro.style.display = 'block'
    $erro.innerText = 'Informe um desconto válido'
    $vlTotal.value = vlTotal.toFixed(2);
  }
}

function casasDecimais() {
  let $vlVenda = document.getElementById('vlVenda')
  let vlVenda = 'vlVenda'
  let $desconto = document.getElementById('desconto')
  let desconto = 'desconto'
  let $valorItens = document.getElementsByClassName('vl')
  let valorItens = 'vl'

  formataNumeros(vlVenda, $vlVenda)
  formataNumeros(desconto, $desconto)
  formataNumeros(valorItens, $valorItens)

  function formataNumeros(seletor, campo) {
    let vetAux = [];
    if (campo.length > 0) {
      for (let i = 0; i < campo.length; i++) {
        vetAux.push(parseFloat(campo[i].value).toFixed(2));
        document.getElementsByClassName(seletor)[i].value = vetAux[i].replace(/\./, ',');
      }
    } else {
      vetAux.push(parseFloat(campo.value).toFixed(2));
      document.getElementById(seletor).value = vetAux[0].replace(/\./, ',');
    }
  }
}

//Listagem
let $precoString = document.getElementsByClassName('valorListagem');
if ($precoString) {
  let precoProduto = [];

  for (let i = 0; i < $precoString.length; i++) {
    precoProduto.push(parseFloat($precoString[i].innerHTML.replace(/R\$/, '')).toFixed(2))
    $precoString[i].innerHTML = 'R$' + precoProduto[i].replace(/\./, ',');
  }
}
