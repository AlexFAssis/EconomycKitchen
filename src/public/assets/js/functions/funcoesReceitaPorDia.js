// (function () {
// 'use strict';
let $btn = document.getElementById('btnAdicionar')
let $controle = document.getElementById('controle')

if ($btn) {
  $btn.addEventListener('click', removerErros);
  $btn.addEventListener('click', adicionarItemReceitaDia);
}

// window.addEventListener("load", function (event) {
flatpickr('.flatpickr', {
  dateFormat: 'd/m/Y',
  locale: {
    // firstDayOfWeek: 1,
    weekdays: {
      shorthand: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      longhand: ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'],
    },
    months: {
      shorthand: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      longhand: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    },
  },
})
// });

ocultaReceitas()
if ($controle) {
  adicionaEventos()
  carregaReceitas()
}

RedimensionaBotaoExluir()

window.addEventListener('resize', function () {
  RedimensionaBotaoExluir()
})

function RedimensionaBotaoExluir() {
  let windowWidth = window.innerWidth;
  let $btnExcluir = document.getElementsByClassName('btnExcluir')
  let $divBtnExcluir = document.getElementsByClassName('divBtnExcluirReceitaPorDia')

  if (windowWidth < 768) {
    for (let i = $btnExcluir.length - 1; i >= 0; i--) {
      $btnExcluir[i].value = 'Excluir Item'
      $btnExcluir[i].textAlign = 'center'
      $btnExcluir[i].setAttribute('style', 'margin-top:5px !important');
      $btnExcluir[i].style.marginBottom = '10px'
      $divBtnExcluir[i].setAttribute('class', 'col-md-12 divBtnExcluirReceitaPorDia');
      $btnExcluir[i].style.width = '100%'
    }
  } else {
    for (let i = 0; i < $btnExcluir.length; i++) {
      $btnExcluir[i].value = 'X'
      $btnExcluir[i].textAlign = 'center'
      $btnExcluir[i].setAttribute('style', 'margin-top: 1.5rem!important');
      $btnExcluir[i].style.marginBottom = '0px'
      $divBtnExcluir[i].setAttribute('class', 'col-md-1 col-lg-1 col-xl-1 divBtnExcluirReceitaPorDia');
      $btnExcluir[i].style.top = "5px"
    }
  }

  // document.querySelector('.window-size').innerHTML = windowWidth;
};

//Novo
function adicionarItemReceitaDia() {
  let $divPrincipal = document.getElementById('itens');
  let div = document.createElement("DIV")
  div.setAttribute('class', 'row')
  $divPrincipal.appendChild(div);

  campoQtde()
  campoReceita()
  if ($controle) {
    campoRendimento()
    campoSobra()
  }
  botaoExcluir()
  adicionaEventos()

  function campoQtde() {
    //Adiciona Campo Quantidade
    let div1 = document.createElement("DIV")
    div1.setAttribute("class", "col-xl-1 col-lg-2 col-md-2 ")
    div.appendChild(div1);

    let quantidade = document.createElement("INPUT");
    quantidade.setAttribute("type", "number");
    quantidade.setAttribute("step", "0.01");
    quantidade.setAttribute("name", "quantidade");
    quantidade.setAttribute("value", "0");
    quantidade.setAttribute("class", "qtde form-control");
    quantidade.setAttribute("min", "0.01");
    quantidade.required = true;
    div1.appendChild(quantidade);

    let labelqtde = document.createElement("LABEL");
    let txtQtde = document.createTextNode("Quantidade");
    labelqtde.setAttribute("for", "quantidade");
    labelqtde.appendChild(txtQtde);

    div1.insertBefore(labelqtde, quantidade);
  }

  function campoReceita() {
    //Adiciona Select Campo Receita
    let div2 = document.createElement("DIV")
    div2.setAttribute("class", "col-xl-5 col-lg-4 col-md-4 ")
    div.appendChild(div2);
    let select = document.createElement("SELECT");
    select.setAttribute("name", "receita");
    select.setAttribute("class", "Receita form-control");
    div2.appendChild(select);

    let labelSelect = document.createElement("LABEL");
    let txtReceita = document.createTextNode("Receita");
    labelSelect.setAttribute("for", "receita");
    labelSelect.appendChild(txtReceita);

    div2.insertBefore(labelSelect, select);

    let final = qtdeReceitas()
    for (let i = 0; i < final; i++) {
      //Adiciona Itens Campo Insumo
      let itemSelect = document.createElement("OPTION");
      itemSelect.setAttribute("class", "ReceitaItem");
      itemSelect.setAttribute("id", i);
      itemSelect.value = carregaItens(i).value;
      itemSelect.text = carregaItens(i).text;
      select.appendChild(itemSelect);
    }
  }

  function campoRendimento() {
    //Adiciona Campo Quantidade
    let div4 = document.createElement("DIV")
    div4.setAttribute("class", "col-xl-1 col-lg-2 col-md-2")
    div.appendChild(div4);

    let rendimento = document.createElement("INPUT");
    rendimento.setAttribute("type", "number");
    rendimento.setAttribute("step", "0.01");
    rendimento.setAttribute("name", "rendimento");
    rendimento.setAttribute("value", carregaRendimentoReceita());
    rendimento.setAttribute("class", "rend form-control");
    rendimento.readOnly = true
    div4.appendChild(rendimento);

    let labelRend = document.createElement("LABEL");
    let txtRend = document.createTextNode("Rendimento");
    labelRend.setAttribute("for", "rendimento");
    labelRend.appendChild(txtRend);

    div4.insertBefore(labelRend, rendimento);
  }

  function campoSobra() {
    //Adiciona Campo Quantidade
    let div5 = document.createElement("DIV")
    div5.setAttribute("class", "col-xl-1 col-lg-2 col-md-2")
    div.appendChild(div5);

    let sobra = document.createElement("INPUT");
    sobra.setAttribute("type", "number");
    sobra.setAttribute("step", "0.01");
    sobra.setAttribute("name", "sobra");
    sobra.setAttribute("value", "0");
    sobra.setAttribute("class", "rend form-control");
    div5.appendChild(sobra);

    let labelSobra = document.createElement("LABEL");
    let txtSobra = document.createTextNode("Sobra");
    labelSobra.setAttribute("for", "sobra");
    labelSobra.appendChild(txtSobra);

    div5.insertBefore(labelSobra, sobra);
  }

  function botaoExcluir() {
    let windowWidth = window.innerWidth;
    let div3 = document.createElement("DIV")

    if (windowWidth < 768) {
      div3.setAttribute("class", "col-md-12 divBtnExcluirReceitaPorDia")
      div.appendChild(div3);
      let btnExcluir = document.createElement("INPUT");
      btnExcluir.setAttribute("type", "button");
      btnExcluir.setAttribute('textAlign', 'center');
      btnExcluir.setAttribute("name", "btnExcluir");
      btnExcluir.setAttribute("value", "Exluir Item");
      btnExcluir.setAttribute("class", "btnExcluir btn btn-danger mt-4");
      btnExcluir.setAttribute('style', 'margin-top:5px !important; width:100%');
      div3.appendChild(btnExcluir);

    } else {
      div3.setAttribute("class", "col-md-1 col-lg-1 col-xl-1 divBtnExcluirReceitaPorDia")
      div3.setAttribute("top", "5px");
      // div4.setAttribute("class", "col-md-2")
      div.appendChild(div3);
      //Se for button gera submit
      let btnExcluir = document.createElement("INPUT");
      btnExcluir.setAttribute("type", "button");
      btnExcluir.setAttribute("name", "btnExcluir");
      btnExcluir.setAttribute("value", "X");
      btnExcluir.setAttribute("class", "btnExcluir btn btn-danger mt-4");
      div3.appendChild(btnExcluir);
    }
  }
}

function carregaRendimentoReceita() {
  let $receitasItem = document.getElementById('receitasItem')

  return $receitasItem[0].text;
}

function adicionaEventos() {
  let $btn = document.getElementsByClassName('btnExcluir btn btn-danger');
  let $receita = document.getElementsByClassName('Receita')
  let $rendimento = document.getElementsByClassName('rend')
  let $qtde = document.getElementsByClassName('qtde')

  for (let i = 0; i < $btn.length; i++) {
    $btn[i].addEventListener('click', function (e) {
      deletarItem(e.target);
    });
  }

  for (let i = 0; i < $qtde.length; i++) {
    $qtde[i].addEventListener('change', function (e) {
      $rendimento[i].value = calculaRendimento(i);
    });
  }

  if ($controle) {
    for (let i = 0; i < $receita.length; i++) {
      $receita[i].addEventListener('change', function (e) {
        $rendimento[i].value = buscaRendimento(e.target);
      });
    }
  }
}

function buscaRendimento(indice) {
  let $receitasItem = document.getElementById('receitasItem')
  let $rendimentoReceita = document.getElementsByClassName('receitaRendimento')

  // if (indice == 0) {
  //   for (let i = 0; i < $receitasItem.length; i++) {
  //     if ($receitasItem[indice].value == $rendimentoReceita[i].value) {
  //       $rendimentoReceita = $rendimentoReceita[0].value;
  //     }
  //   }
  // }
  // else {
  $valor = $rendimentoReceita[indice.selectedIndex].value;
  // }

  return $valor;
}

function qtdeReceitas() {
  let $qtdeReceitas = document.getElementsByClassName("receitaItemHidden").length;

  return $qtdeReceitas;
}

function deletarItem(btn) {
  let elementoPaiBtn = btn.parentNode
  let elementoPai = elementoPaiBtn.parentNode

  if (elementoPai.parentNode) {
    elementoPai.parentNode.removeChild(elementoPai);
  }
}

function carregaItens(indice) {
  let $receitaItem = document.getElementsByClassName("receitaItemHidden")[indice];

  return $receitaItem;
}

function removerErros() {
  let $erros = document.getElementById('error');
  if ($erros) {
    $erros.remove();
  }
}

// Edição
function ocultaReceitas() {
  let $qtde = document.getElementsByClassName("hidden").length
  for (let i = 0; i < $qtde; i++) {
    document.getElementsByClassName("hidden")[i].style.display = "none";
  }
}

function carregaReceitas() {
  let $receitasItem = document.getElementById('receitasItem')
  let $selectReceitas = document.getElementsByClassName('Receita')
  let $receitasHidden = document.getElementsByClassName('receitaItemHidden')
  let $rendimentoHidden = document.getElementsByClassName('rend')

  for (let i = 0; i < $receitasItem.length; i++) {
    for (let j = 0; j < $receitasHidden.length; j++) {
      let itemSelect = document.createElement("OPTION");

      itemSelect.selected = false;
      itemSelect.value = $receitasHidden[j].value;
      itemSelect.text = $receitasHidden[j].text;

      if ($receitasItem[i].value == $receitasHidden[j].value) {
        itemSelect.selected = true;
        $rendimentoHidden[i].value = receitasItem[i].text
      }

      $selectReceitas[i].appendChild(itemSelect);
    }
  }
}

function calculaRendimento(indice) {
  if ($controle) {

    debugger;
    let $Receita = document.getElementsByClassName('Receita')
    let $qtde = document.getElementsByClassName('qtde')
    let $rendimentoReceita = document.getElementsByClassName('receitaRendimento')
    let receitas = $Receita[indice]
    let indiceReceita = 0

    for (let i = 0; i < receitas.length; i++) {
      if (receitas[i].selected == true) {
        indiceReceita = i
        break
      }
    }

    return $qtde[indice].value * $rendimentoReceita[indiceReceita].value
  }
}


