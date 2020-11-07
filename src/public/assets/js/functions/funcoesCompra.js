(function () {
  'use strict';

  // window.addEventListener("load", function (event) {

  verificaQtdeItens()

  let $btnExcluir = document.getElementsByClassName('btnExcluir btn btn-danger');
  let $select = document.getElementsByClassName('selectInsumo')
  // Validação, função somente para edição
  if ($select.length > 0) {
    $(function () {
      $('.vlr').maskMoney();
    })
    carregaInsumos()
    adicionaEventos()
    carregaUnidadeMedida()
    casasDecimais()
    // verificaQtdeItens()
  }

  for (let i = 0; i < $btnExcluir.length; i++) {
    $btnExcluir[i].addEventListener('click', function (e) {
      deletarItem(e.target);
    });
  }

  ocultaInsumos();

  let $btn = document.getElementById('btnAdicionar');
  if ($btn) {
    // $btn.addEventListener('click', removerErros);
    $btn.addEventListener('click', adicionaItemCompra);

    $btn.addEventListener('click', function (e) {
      removerErros('adicionar');
    });

  }

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
  // });

  RedimensionaBotaoExluir()

  window.addEventListener('resize', function () {
    RedimensionaBotaoExluir()
  })

})()

function RedimensionaBotaoExluir() {
  let windowWidth = window.innerWidth;
  let $btnExcluir = document.getElementsByClassName('btnExcluir')
  let $divBtnExcluir = document.getElementsByClassName('divBtnExcluirCompra')

  if (windowWidth < 992) {
    for (let i = $btnExcluir.length - 1; i >= 0; i--) {
      $btnExcluir[i].value = 'Excluir Item'
      $btnExcluir[i].textAlign = 'center'
      $btnExcluir[i].setAttribute('style', 'margin-top:5px !important');
      $btnExcluir[i].style.marginBottom = '10px'
      $divBtnExcluir[i].setAttribute('class', 'col-md-12 divBtnExcluirCompra');
      $btnExcluir[i].style.width = '100%'
    }
  } else {
    for (let i = 0; i < $btnExcluir.length; i++) {
      $btnExcluir[i].value = 'X'
      $btnExcluir[i].textAlign = 'center'
      $btnExcluir[i].setAttribute('style', 'margin-top: 1.5rem!important');
      $btnExcluir[i].style.marginBottom = '0px'
      $divBtnExcluir[i].setAttribute('class', 'col-md-1 col-lg-1 col-xl-1 divBtnExcluirCompra');
      $btnExcluir[i].style.top = "5px"
    }
  }

  // document.querySelector('.window-size').innerHTML = windowWidth;
};


function buscaMes(mesStr) {
  let mes = 0

  switch (mesStr) {
    case 'Jan':
      mes = 1
      break;
    case 'Feb':
      mes = 2
      break;
    case 'Mar':
      mes = 3
      break;
    case 'Apr':
      mes = 4
      break;
    case 'May':
      mes = 5
      break;
    case 'Jun':
      mes = 6
      break;
    case 'Jul':
      mes = 7
      break;
    case 'Aug':
      mes = 8
      break;
    case 'Sep':
      mes = 9
      break;
    case 'Oct':
      mes = 10
      break;
    case 'Nov':
      mes = 11
      break;
    case 'Dec':
      mes = 12
      break;
  }

  return mes = mes < 10 ? '0' + mes : mes;;
}

function adicionaItemCompra() {
  var $divPrincipal = document.getElementById('itens');
  let div = document.createElement("DIV")
  div.setAttribute('class', 'row')
  $divPrincipal.appendChild(div);

  campoQtde()
  campoUnidadeMedida()
  campoInsumo()
  campoValor()
  // campoValorTotal()
  campoMarca()
  botaoExcluir()
  adicionaEventos()

  function deletarItem(btn) {
    var elementoPaiBtn = btn.parentNode
    var elementoPai = elementoPaiBtn.parentNode

    if (elementoPai.parentNode) {
      elementoPai.parentNode.removeChild(elementoPai);
    }
  }

  function campoQtde() {
    //Adiciona Campo Quantidade
    let div1 = document.createElement("DIV")
    div1.setAttribute("class", "col-md-12 col-lg-2 col-xl-1")
    div.appendChild(div1);

    let quantidade = document.createElement("INPUT");
    quantidade.setAttribute("type", "number");
    quantidade.setAttribute("step", "0.001");
    quantidade.setAttribute("name", "quantidade");
    quantidade.setAttribute("value", "0");
    quantidade.setAttribute("class", "qtde form-control");
    quantidade.setAttribute("min", "0.001")
    quantidade.min = 0.01;
    quantidade.max = 9999.99;
    div1.appendChild(quantidade);

    let labelqtde = document.createElement("LABEL");
    let txtQtde = document.createTextNode("Qtde");
    labelqtde.setAttribute("for", "quantidade");
    labelqtde.appendChild(txtQtde);

    div1.insertBefore(labelqtde, quantidade);
  }

  function campoUnidadeMedida() {
    let div6 = document.createElement("DIV")
    div6.setAttribute("class", "col-md-12 col-lg-2 col-xl-2")
    div.appendChild(div6);
    //Adiciona Select Campo Insumo
    let select = document.createElement("SELECT");
    select.setAttribute("name", "unidadeMedida");
    select.setAttribute("class", "unidadeMedida form-control");
    div6.appendChild(select);

    let labelSelect = document.createElement("LABEL");
    let txtUnidadeMedida = document.createTextNode("Un. Medida");
    labelSelect.setAttribute("for", "unidadeMedida");
    labelSelect.appendChild(txtUnidadeMedida);

    div6.insertBefore(labelSelect, select);

    // let final = qtdeInsumos()
    let vetorUnidadeMedida = ['ML', 'Litro(s)', 'MG', 'Grama(s)', 'KG', 'Unidade(s)', 'Dúzia']

    for (let i = 0; i < vetorUnidadeMedida.length; i++) {
      //Adiciona Itens Campo Insumo
      let itemSelect = document.createElement("OPTION");
      itemSelect.value = carregaUnidadeMedida(i);
      itemSelect.text = carregaUnidadeMedida(i);
      select.appendChild(itemSelect);
    }
  }

  function campoValor() {
    let div2 = document.createElement("DIV")
    div2.setAttribute("class", "col-md-12 col-lg-2 col-xl-2")
    div.appendChild(div2);
    let qtdeItensCriados = document.getElementsByClassName('vlr').length

    let divGroup = document.createElement("DIV")
    divGroup.setAttribute("class", "input-group")
    div2.appendChild(divGroup)
    let divGroupPrepend = document.createElement("DIV")
    divGroupPrepend.setAttribute("class", "input-group-prepend")
    divGroup.appendChild(divGroupPrepend)
    let span = document.createElement('SPAN')
    span.setAttribute("class", "input-group-text")
    let txtSpan = document.createTextNode("R$");
    span.appendChild(txtSpan)
    divGroupPrepend.appendChild(span)

    let valor = document.createElement("INPUT");
    valor.setAttribute("type", "text");
    // valor.setAttribute("step", "0.01");
    valor.setAttribute("name", "valor");
    // valor.setAttribute("value", "0");
    valor.setAttribute("class", "vlr form-control");
    valor.setAttribute("id", qtdeItensCriados);
    valor.setAttribute("data-thousands", ".");
    valor.setAttribute("data-decimal", ",");
    valor.required = true;
    // let regex = new RegExp(/([\d]{1,}),[\d]{2}$/)
    // valor.pattern = regex;
    // valor.setAttribute("min", "0.01")
    divGroup.appendChild(valor);

    let labelValor = document.createElement("LABEL");
    let txtVlr = document.createTextNode("Valor");
    labelValor.setAttribute("for", "valor");
    labelValor.appendChild(txtVlr);

    div2.insertBefore(labelValor, divGroup);
  }

  $(function () {
    $('.vlr').maskMoney();
  })

  function campoMarca() {
    //Adiciona Campo Marca
    let div3 = document.createElement("DIV")
    div3.setAttribute("class", "col-md-12 col-lg-3 col-xl-2")
    div.appendChild(div3);
    let marca = document.createElement("INPUT");
    marca.setAttribute("type", "text");
    marca.setAttribute("name", "marca");
    marca.setAttribute("placeholder", "Marca");
    marca.setAttribute("class", "mrc form-control");
    marca.required = true;
    marca.maxLength = 50;
    div3.appendChild(marca);

    let labelMarca = document.createElement("LABEL");
    let txtMarca = document.createTextNode("Marca");
    labelMarca.setAttribute("for", "marca");
    labelMarca.appendChild(txtMarca);

    div3.insertBefore(labelMarca, marca);
  }

  function campoInsumo() {
    let div4 = document.createElement("DIV")
    div4.setAttribute("class", "col-md-12 col-lg-2 col-xl-2")
    div.appendChild(div4);
    //Adiciona Select Campo Insumo
    let select = document.createElement("SELECT");
    select.setAttribute("name", "insumo");
    select.setAttribute("class", "insumo form-control");
    div4.appendChild(select);

    let labelSelect = document.createElement("LABEL");
    let txtInsumo = document.createTextNode("Itens");
    labelSelect.setAttribute("for", "insumo");
    labelSelect.appendChild(txtInsumo);

    div4.insertBefore(labelSelect, select);

    let final = qtdeInsumos()
    for (let i = 0; i < final; i++) {
      //Adiciona Itens Campo Insumo
      let itemSelect = document.createElement("OPTION");
      itemSelect.setAttribute("id", i);
      itemSelect.value = carregaItens(i).value;
      itemSelect.text = carregaItens(i).text;
      select.appendChild(itemSelect);
    }
  }

  function botaoExcluir() {
    let windowWidth = window.innerWidth;
    let div5 = document.createElement("DIV")

    if (windowWidth < 992) {
      div5.setAttribute("class", "col-md-12 divBtnExcluirCompra")
      div5.setAttribute("id", "divBtnExcluirCompra")
      div.appendChild(div5);
      //Se for button gera submit
      let btnExcluir = document.createElement("INPUT");
      btnExcluir.setAttribute("type", "button");
      btnExcluir.setAttribute('textAlign', 'center');
      btnExcluir.setAttribute("name", "btnExcluir");
      btnExcluir.setAttribute("value", "Exluir Item");
      btnExcluir.setAttribute("class", "btnExcluir btn btn-danger mt-4");
      btnExcluir.setAttribute('style', 'margin-top:5px !important; width:100%');
      div5.appendChild(btnExcluir);
    } else {

      div5.setAttribute("class", "col-md-1 col-lg-1 col-xl-1 divBtnExcluirCompra")
      div5.setAttribute("top", "5px");
      div.appendChild(div5);
      //Se for button gera submit
      let btnExcluir = document.createElement("INPUT");
      btnExcluir.setAttribute("type", "button");
      btnExcluir.setAttribute("name", "btnExcluir");
      btnExcluir.setAttribute("value", "X");
      btnExcluir.setAttribute("class", "btnExcluir btn btn-danger mt-4");
      div5.appendChild(btnExcluir);
    }
  }
}

function ocultaInsumos() {
  let $qtde = document.getElementsByClassName("hidden").length
  for (let i = 0; i < $qtde; i++) {
    document.getElementsByClassName("hidden")[i].style.display = "none";
  }
}

function qtdeInsumos() {
  $qtdeInsumos = document.getElementsByClassName("itemInsumo").length;

  return $qtdeInsumos;
}

function carregaItens(indice) {
  $insumos = document.getElementsByClassName("itemInsumo")[indice];

  return $insumos;
}

function somaItens() {
  let $valorItem = document.getElementsByClassName('vlr');
  let $qtdeItem = document.getElementsByClassName('qtde');
  let $vlTotalCompra = document.getElementById('valor');
  let qtdeItensCriados = $valorItem.length
  let valorTotal = 0;
  let valorItemAux = 0

  for (let i = 0; i < qtdeItensCriados; i++) {
    if ($valorItem[i].value == '') {
      $valorItem[i].value = '0'
    }

    valorItemAux = $valorItem[i].value.replace(/\./, '')
    valorItemAux = valorItemAux.replace(/\,/, '.')
    valorTotal += parseFloat(valorItemAux)
  }

  $vlTotalCompra.value = valorTotal.toFixed(2)
}

// function removerErros() {
//   let $erros = document.getElementById('error');
//   if ($erros) {
//     $erros.remove();
//   }
// }

// Somente para edição
function carregaInsumos() {
  let $select = document.getElementsByClassName('selectInsumo')
  let $insumos = document.getElementById('insumosHidden')

  let idInsumo = [];
  let nomeInsumo = [];
  // let idItemCompra = [];

  for (let i = 0; i < $insumos.length; i++) {
    idInsumo.push($insumos[i].value)
    nomeInsumo.push($insumos[i].text)
  }

  for (let i = 0; i < $select.length; i++) {
    for (let j = 0; j < $insumos.length; j++) {
      let itemSelect = document.createElement("OPTION");

      itemSelect.selected = false;
      itemSelect.value = idInsumo[j];
      itemSelect.text = nomeInsumo[j];

      if ($select[i].value == idInsumo[j]) {
        itemSelect.selected = true;
      }

      $select[i].appendChild(itemSelect);
    }
  }

  for (let i = 0; i < $select.length; i++) {
    for (let j = 0; j < $select[i].childNodes.length; j++) {
      if ($select[i].childNodes[j].text == 'undefined' || $select[i].childNodes[j].text == '') {
        $select[i].removeChild($select[i].childNodes[j]);
      }
    }
  }
}

// Somente para edição
function adicionaEventos() {
  let $valores = document.getElementsByClassName('vlr');
  let $qtdes = document.getElementsByClassName('qtde');
  let $unidadeMedida = document.getElementsByClassName('unidadeMedida');

  for (let i = 0; i < $valores.length; i++) {
    $valores[i].addEventListener('blur', somaItens);
  }

  for (let i = 0; i < $unidadeMedida.length; i++) {
    $unidadeMedida[i].addEventListener('blur', somaItens);
  }

  for (let i = 0; i < $qtdes.length; i++) {
    $qtdes[i].addEventListener('blur', somaItens);
  }

  let $btn = document.getElementsByClassName('btnExcluir btn btn-danger');
  for (let i = 0; i < $btn.length; i++) {
    $btn[i].addEventListener('click', function (e) {
      deletarItem(e.target);
      somaItens()
    });
  }
}


// Somente para edição
function deletarItem(btn) {
  let elementoPaiBtn = btn.parentNode
  let elementoPai = elementoPaiBtn.parentNode

  if (elementoPai.parentNode) {
    elementoPai.parentNode.removeChild(elementoPai);
  }

  removerErros('deletar')
}

function carregaUnidadeMedida(indice) {
  // let vetorUnidadeMedida = ['Litro(s)', 'ML', 'KG', 'Grama(s)', 'MG', 'Unidade(s)', 'Dúzia']
  let vetorUnidadeMedida = ['ML', 'Litro(s)', 'MG', 'Grama(s)', 'KG', 'Unidade(s)', 'Dúzia']

  if (indice == undefined) {
    let $select = document.getElementsByClassName('unidadeMedida')
    for (let i = 0; i < $select.length; i++) {
      for (let j = 0; j < vetorUnidadeMedida.length; j++) {
        let itemSelect = document.createElement("OPTION");

        itemSelect.selected = false;
        itemSelect.value = vetorUnidadeMedida[j];
        itemSelect.text = vetorUnidadeMedida[j];

        if ($select[i].value == vetorUnidadeMedida[j]) {
          itemSelect.selected = true;
        }

        $select[i].appendChild(itemSelect);
      }
    }

    for (let i = 0; i < $select.length; i++) {
      for (let j = 0; j < $select[i].childNodes.length; j++) {
        if ($select[i].childNodes[j].text == 'undefined' || $select[i].childNodes[j].text == '') {
          $select[i].removeChild($select[i].childNodes[j]);
        }
      }
    }

  }
  return vetorUnidadeMedida[indice]

}

function casasDecimais() {
  let $valor = document.getElementById('valor')
  let valor = 'valor'
  let $valorItens = document.getElementsByClassName('vlr')
  let valorItens = 'vlr'

  formataNumeros(valor, $valor)
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

function removerErros(tipo) {
  let $erros = document.getElementsByClassName('error');
  let $btnGravar = document.getElementById('btnConfirmarCompra');
  let $qtdeItem = document.getElementsByClassName('qtde')

  if (tipo == 'adicionar' && $qtdeItem.length > 0) {
    $btnGravar.disabled = false
    for (let i = 0; i < $erros.length; i++) {
      $erros[i].style.display = 'none';
    }
  } else {
    for (let i = 0; i < $erros.length; i++) {
      if ($qtdeItem.length == 0) {
        $btnGravar.disabled = true
        $erros[i].style.display = 'flex'
      } else {
        break
      }
    }
  }
}

function verificaQtdeItens() {
  let $erros = document.getElementsByClassName('error');
  let $btnGravar = document.getElementById('btnConfirmarCompra');
  let $qtdeItem = document.getElementsByClassName('qtde')

  if ($btnGravar) {
    $btnGravar.disabled = true

    if ($qtdeItem.length > 0) {
      for (let i = 0; i < $erros.length; i++) {
        $erros[i].style.display = 'none'
      }
      $btnGravar.disabled = false
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