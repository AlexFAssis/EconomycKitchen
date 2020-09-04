// (function () {
'use-strict'

let $datas = document.getElementsByClassName('dataFormatada')
let $btn = document.getElementById('btnAdicionar');
let $receitaImg = document.getElementById("imgReceita");
let img = document.querySelector("label[for=imgReceita] img");
let $bntConfirmar = document.getElementsByClassName('btnExcluir btn btn-danger');
let $controle = document.getElementById('controle')
let $btnPrecoMedio = document.getElementById('btnPrecoMedio')
let $dtCalculoPrecoMedio = document.getElementById('dtCalculoPrecoMedio')
let $btnBuscarHistorico = document.getElementById('btnBuscarHistorico')
let $btnBuscarValorFinal = document.getElementById('btnBuscarValorFinal')
// let $btnValidacao = document.getElementById('btnValidacao')

if ($btnPrecoMedio) {
  $btnPrecoMedio.addEventListener('click', calculaPrecoMedioReceita);
}

if ($btnBuscarHistorico) {
  $btnBuscarHistorico.addEventListener('click', buscaHistoricoReceitas);
}

if ($btnBuscarValorFinal) {
  $btnBuscarValorFinal.addEventListener('click', buscaValorTotalReceita);
}

// if ($btnValidacao) {
//   $btnValidacao.addEventListener('click', validacaoItens)
// }

flatpickr('.flatpickr', {
  dateFormat: 'd/m/Y',
  locale: {
    firstDayOfWeek: 1,
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

if ($receitaImg) {
  $receitaImg.onchange = function (e) {
    img.classList.add("preview")
    //URL = variavel global do JS
    //files[0] = 1ª imagem selecionada
    img.src = URL.createObjectURL(e.target.files[0]);
  }
}

ocultaInsumos();

if ($btn) {
  $btn.addEventListener('click', adicionaIngrediente);
  // $btn.addEventListener('click', removerErros('adicionar'));
  $btn.addEventListener('click', function (e) {
    removerErros('adicionar');
  });
}

if ($datas) {
  for (let i = 0; i < $datas.length; i++) {
    $datas[i].innerText = 'Criada em:' + formataData($datas[i].innerText)
  }
}

// if ($dtCalculoPrecoMedio) {
//   $dtCalculoPrecoMedio.value = formataData($dtCalculoPrecoMedio.value)
// }

//Edição
if ($bntConfirmar) {
  for (let i = 0; i < $bntConfirmar.length; i++) {
    $bntConfirmar[i].addEventListener('click', function (e) {
      deletarItem(e.target);
    });
  }
}

if ($controle) {
  carregaMedidas()
  carregaInsumos()
  carregaCategoria()
  adicionaEventos()
  verificaQtdeItens()
}

RedimensionaBotaoExluir()

window.addEventListener('resize', function () {
  RedimensionaBotaoExluir()
})

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

  document.querySelector('.window-size').innerHTML = windowWidth;
};

// })()

//Cadastro
function adicionaIngrediente() {

  let $divPrincipal = document.getElementById('itens');
  let div = document.createElement("DIV")
  div.setAttribute('class', 'row')
  $divPrincipal.appendChild(div);

  campoQtde()
  campoMedida()
  campoInsumo()
  botaoExcluir()
  adicionaEventos()

  function campoQtde() {
    //Adiciona Campo Quantidade
    let div1 = document.createElement("DIV")
    div1.setAttribute("class", "col-md-2 col-lg-2 col-xl-1")
    div.appendChild(div1);

    let quantidade = document.createElement("INPUT");
    quantidade.setAttribute("type", "number");
    quantidade.setAttribute("step", "0.01");
    quantidade.setAttribute("name", "qtdeInsumo");
    quantidade.setAttribute("value", "0");
    quantidade.setAttribute("class", "qtde form-control");
    quantidade.setAttribute("min", '0.01')
    quantidade.required = true
    div1.appendChild(quantidade);

    let labelqtde = document.createElement("LABEL");
    let txtQtde = document.createTextNode("Quantidade");
    labelqtde.setAttribute("for", "quantidade");
    labelqtde.appendChild(txtQtde);

    div1.insertBefore(labelqtde, quantidade);
  }

  function campoInsumo() {
    //Adiciona Select Campo Insumo
    let div2 = document.createElement("DIV")
    div2.setAttribute("class", "col-md-3 col-lg-4 col-xl-4")
    // div2.setAttribute("class", "col-md-3 col-xs-3")
    div.appendChild(div2);

    let select = document.createElement("SELECT");
    select.setAttribute("name", "insumo");
    select.setAttribute("class", "form-control");
    div2.appendChild(select);

    let labelSelect = document.createElement("LABEL");
    let txtInsumo = document.createTextNode("Insumo");
    labelSelect.setAttribute("for", "insumo");
    labelSelect.appendChild(txtInsumo);

    div2.insertBefore(labelSelect, select);

    let final = qtdeInsumos()
    for (let i = 0; i < final; i++) {
      //Adiciona Itens Campo Insumo
      let itemSelect = document.createElement("OPTION");
      //itemSelect.setAttribute("id", i);
      itemSelect.value = carregaItens(i).value;
      itemSelect.text = carregaItens(i).text;
      select.appendChild(itemSelect);
    }
  }

  function campoMedida() {
    //Adiciona Campo Marca
    let div3 = document.createElement("DIV")
    // div3.setAttribute("class", "col-md-2 col-xs-2")
    div3.setAttribute("class", "col-md-4 col-lg-4 col-xl-4")
    div.appendChild(div3);

    let select = document.createElement("SELECT");
    select.setAttribute("name", "medida");
    select.setAttribute("class", "Medida form-control");
    div3.appendChild(select);

    let labelSelectQtde = document.createElement("LABEL");
    let txtQtdeInsumo = document.createTextNode("Medida");
    labelSelectQtde.setAttribute("for", "medida");
    labelSelectQtde.appendChild(txtQtdeInsumo);

    div3.insertBefore(labelSelectQtde, select);

    let final = qtdeitemMedida()
    for (let i = 0; i < final; i++) {
      //Adiciona Itens Campo Insumo
      let itemSelect = document.createElement("OPTION");
      //itemSelect.setAttribute("id", i);
      itemSelect.value = carregaItensMedida(i).value;
      itemSelect.text = carregaItensMedida(i).text;
      select.appendChild(itemSelect);
    }
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

      // div4.setAttribute("class", "col-md-2 col-lg-2 col-xl-3")
      // div.appendChild(div4);
      // //Se for button gera submit
      // let btnExcluir = document.createElement("INPUT");
      // btnExcluir.setAttribute("type", "button");
      // btnExcluir.setAttribute("name", "btnExcluir");
      // btnExcluir.setAttribute("value", "Excluir Item");
      // btnExcluir.setAttribute("class", "btnExcluir btn btn-danger mt-4");
      // div4.appendChild(btnExcluir);

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
}

// function adicionaEventos() {
//   var $valores = div.getElementsByClassName('vlr');
//   var $qtdes = div.getElementsByClassName('qtde');

//   var $btn = document.getElementsByClassName('btnExcluir btn btn-danger');
//   for (let i = 0; i < $btn.length; i++) {
//     $btn[i].addEventListener('click', function (e) {
//       deletarItem(e.target);
//     });
//   }
// }


function deletarItem(btn) {
  let elementoPaiBtn = btn.parentNode
  let elementoPai = elementoPaiBtn.parentNode

  if (elementoPai.parentNode) {
    elementoPai.parentNode.removeChild(elementoPai);
  }

  removerErros('deletar')
}

function ocultaInsumos() {
  let $qtde = document.getElementsByClassName("hidden").length
  for (let i = 0; i < $qtde; i++) {
    document.getElementsByClassName("hidden")[i].style.display = "none";
  }
}

function qtdeInsumos() {
  let $qtdeInsumos = document.getElementsByClassName("itemInsumo").length;

  return $qtdeInsumos;
}

function qtdeitemMedida() {
  let $qtdeItensMedida = document.getElementById("medidasHidden").length;

  return $qtdeItensMedida;
}

function carregaItens(indice) {
  let $insumos = document.getElementsByClassName("itemInsumo")[indice];

  return $insumos;
}

function carregaItensMedida(indice) {
  let $medidas = document.getElementsByClassName("qtdeInsumo")[indice];

  return $medidas;
}

//Listagem
function formataData(data) {
  let dia = data.substr(8, 2)
  let mes = buscaMes(data.substr(4, 3))
  let ano = data.substr(11, 4)

  return dia + '/' + mes + '/' + ano;
}

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

var $paginacao = document.getElementsByClassName('pagination')

if ($paginacao.length > 0) {
  montaPaginacao()
}

function montaPaginacao() {
  var $totalPaginasNavegacao = parseInt(document.getElementById('totalPaginasNavegacao').innerText)
  var $paginaAtual = parseInt(document.getElementById('paginaAtual').innerText)
  var $pageNext = document.getElementById('page-next')

  for (let i = 2; i <= $totalPaginasNavegacao; i++) {
    let elementoLi = document.createElement('li')

    if (i == $paginaAtual) {
      elementoLi.className = "page-item active"
    } else {
      elementoLi.className = "page-item"
    }

    let elementoA = document.createElement('a')
    elementoA.className = "page-link"
    elementoA.id = `nav-${i}`
    elementoA.href = `/receita/listar?page=${i}`
    elementoA.innerText = i

    elementoLi.appendChild(elementoA)

    $paginacao[0].insertBefore(elementoLi, $pageNext)
  }
}

//Edição
function carregaMedidas() {
  let $medidaItem = document.getElementsByClassName('medidaItem')
  let $selectMedidas = document.getElementsByClassName('medidas')
  let $MedidasHidden = document.getElementById('medidasHidden')

  for (let i = 0; i < $medidaItem.length; i++) {
    for (let j = 0; j < $MedidasHidden.length; j++) {
      let itemSelect = document.createElement("OPTION");

      itemSelect.selected = false;
      itemSelect.value = $MedidasHidden[j].value;
      itemSelect.text = $MedidasHidden[j].text;

      if ($medidaItem[i].value == $MedidasHidden[j].value) {
        itemSelect.selected = true;
      }

      $selectMedidas[i].appendChild(itemSelect);
    }
  }
}

function carregaCategoria() {
  let $idCategoria = document.getElementById('idCategoria')
  let $selectCategorias = document.getElementById('selectCategorias')
  let $categorias = document.getElementsByClassName('categoriasReceita')

  for (let i = 0; i < $categorias.length; i++) {
    let itemSelect = document.createElement("OPTION");
    itemSelect.selected = false;
    itemSelect.value = $categorias[i].value;
    itemSelect.text = $categorias[i].text;

    if ($categorias[i].value == $idCategoria.value) {
      itemSelect.selected = true;
    }

    $selectCategorias.appendChild(itemSelect);
  }
}

function carregaInsumos() {
  let $selectInsumos = document.getElementsByClassName('selectInsumos')
  let $insumos = document.getElementById('insumosReceita')
  let $medidaItem = document.getElementById('receitasItem')

  for (let i = 0; i < $selectInsumos.length; i++) {
    for (let j = 0; j < $insumos.length; j++) {
      let itemSelect = document.createElement("OPTION");

      itemSelect.selected = false;
      itemSelect.value = $insumos[j].value;
      itemSelect.text = $insumos[j].text;

      if ($medidaItem[i].value == $insumos[j].value) {
        itemSelect.selected = true;
      }

      $selectInsumos[i].appendChild(itemSelect);
    }
  }
}

function adicionaEventos() {
  var $btn = document.getElementsByClassName('btnExcluir btn btn-danger');
  for (let i = 0; i < $btn.length; i++) {
    $btn[i].addEventListener('click', function (e) {
      // somaItens()
      deletarItem(e.target);
    });
  }
}

function calculaPrecoMedioReceita() {
  let $idReceita = document.getElementById('idHidden')
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText != '') {
        let resposta = this.responseText.split('/');
        let valorMedio = resposta[0];
        let valorMedioPorcao = resposta[1];
        let dtCalculoPrecoMedio = resposta[2];

        document.getElementById("valorMedioPorcao").value = valorMedioPorcao;
        document.getElementById("valorMedio").value = valorMedio;
        document.getElementById("dtCalculoPrecoMedio").value = formataData(dtCalculoPrecoMedio);
      } else {
        document.getElementById("CompraNula").style.display = 'block'
        document.getElementById("CompraNula").innerText = 'Cálculo não realizado, há itens da receita que não possuem estoque'
      }

    }
  };
  xhttp.open("GET", `/receita/calcularMedia/${$idReceita.innerHTML}`, true);
  xhttp.send();
}

function buscaHistoricoReceitas() {
  let $receita = document.getElementById('receitaSelect').value;
  let $dtInicial = document.getElementById('dtInicial').value.replace(/\//g, '-');
  let $dtFinal = document.getElementById('dtFinal').value.replace(/\//g, '-');
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      let resposta = this.responseText;

      let regexReceita = new RegExp(/(?:{)(.*?)(?:,"__v)/g)
      let receitaVet = [];
      let receita = ''
      while (receita = regexReceita.exec(resposta)) {
        receitaVet.push(receita[1])
      }

      let regexNome = new RegExp(/(?:receitaNome":")(.*?)(?:",)/g)
      let nomeVet = [];
      let nome = ''
      while (nome = regexNome.exec(receitaVet)) {
        nomeVet.push(nome[1])
      }

      let regexData = new RegExp(/(?:dtCalculoPrecoMedio":)(.*?)(?:,")/g)
      let dataVet = [];
      let data = ''
      while (data = regexData.exec(receitaVet)) {
        dataVet.push(formataDataReceita(data[1]))
      }

      let regexVlMedio = new RegExp(/(?:valorMedio":)(.*?)(?:,")/g)
      let vlMedioVet = [];
      let vlMedio = 0
      while (vlMedio = regexVlMedio.exec(receitaVet)) {
        vlMedioVet.push(vlMedio[1])
      }

      let regexVlMedioPorcao = new RegExp(/(?:valorMedioPorcao":)(.*?)(?:,")/g)
      let vlMedioPorcaoVet = [];
      let vlMedioPorcao = 0
      while (vlMedioPorcao = regexVlMedioPorcao.exec(receitaVet)) {
        vlMedioPorcaoVet.push(vlMedioPorcao[1])
      }

      var $tbody = document.getElementById('tb');

      for (let i = $tbody.rows.length; i > 0; i--) {
        $tbody.removeChild($tbody.childNodes[i])
      }

      if (receitaVet.length <= 0) {
        let tr = document.createElement('tr')
        tr.setAttribute('class', 'odd')
        $tbody.appendChild(tr);
        let td = document.createElement('td');
        td.setAttribute('class', 'dataTables_empty')
        td.colSpan = 4
        td.innerHTML = 'Não há histórico dessa receita';
        td.style.textAlign = 'center'
        tr.appendChild(td);
      }

      let precoReceita = ''
      let precoPorcao = ''
      for (let i = 0; i < receitaVet.length; i++) {

        if (dataVet[i] != dataVet[i - 1]) {
          let tr = document.createElement('tr')
          $tbody.appendChild(tr);

          let td1 = document.createElement('td');
          td1.innerHTML = nomeVet[i];
          tr.appendChild(td1);

          let td4 = document.createElement('td');
          td4.innerHTML = dataVet[i];
          tr.appendChild(td4);


          let td2 = document.createElement('td');
          precoReceita = parseFloat(vlMedioVet[i]).toFixed(2)
          precoReceita = precoReceita.replace(/\./, ',');
          td2.innerHTML = 'R$' + precoReceita //parseFloat(vlMedioVet[i]).toFixed(2)
          tr.appendChild(td2);

          let td3 = document.createElement('td');
          precoPorcao = parseFloat(vlMedioPorcaoVet[i]).toFixed(2)
          precoPorcao = precoPorcao.replace(/\./, ',');
          td3.innerHTML = 'R$' + precoPorcao //parseFloat(vlMedioPorcaoVet[i]).toFixed(2)
          tr.appendChild(td3);
        }
      }

    }
  };

  xhttp.open("POST", `/receita/historicoPreco/${$receita}&${$dtInicial}&${$dtFinal}`, true);
  xhttp.send();
}

function buscaValorTotalReceita() {

  let $dtInicial = document.getElementById('dtInicial').value.replace(/\//g, '-');
  let $dtFinal = document.getElementById('dtFinal').value.replace(/\//g, '-');

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

      let resposta = this.responseText;

      let regexNome = new RegExp(/(?:nomeReceita":")(.*?)(?:",)/g)
      let nomeVet = [];
      let nome = ''
      while (nome = regexNome.exec(resposta)) {
        nomeVet.push(nome[1])
      }

      // let regexVlMedio = new RegExp(/(?:vlReceita":)(\d*?\.\d*)/g)
      let regexVlMedio = new RegExp(/(?:vlReceita":)(\d*\.?\d*)/g)
      let vlMedioVet = [];
      let vlMedio = 0
      while (vlMedio = regexVlMedio.exec(resposta)) {
        vlMedioVet.push(vlMedio[1])
      }

      let regexQtdeRendimento = new RegExp(/(?:qtdeRendimento":)(\d*)/g)
      let vlQtdeRendimentoVet = [];
      let vlQtdeRendimento = 0
      while (vlQtdeRendimento = regexQtdeRendimento.exec(resposta)) {
        vlQtdeRendimentoVet.push(vlQtdeRendimento[1])
      }

      var $tbody = document.getElementById('tb');

      for (let i = $tbody.rows.length; i > 0; i--) {
        $tbody.removeChild($tbody.childNodes[i])
      }

      if (nomeVet.length <= 0) {
        let tr = document.createElement('tr')
        tr.setAttribute('class', 'odd')
        $tbody.appendChild(tr);
        let td = document.createElement('td');
        td.setAttribute('class', 'dataTables_empty')
        td.colSpan = 4
        td.innerHTML = 'Não há valores para esse intervalo filtrado';
        td.style.textAlign = 'center'
        tr.appendChild(td);
      }

      let precoReceita = ''
      let precoPorcao = ''
      for (let i = 0; i < vlQtdeRendimentoVet.length; i++) {
        let tr = document.createElement('tr')
        $tbody.appendChild(tr);

        let td1 = document.createElement('td');
        td1.innerHTML = nomeVet[i];
        tr.appendChild(td1);

        let td2 = document.createElement('td');
        precoReceita = parseFloat(vlMedioVet[i]).toFixed(2)
        precoReceita = precoReceita.replace(/\./, ',');
        td2.innerHTML = 'R$' + precoReceita //parseFloat(vlMedioVet[i]).toFixed(2)

        // td2.innerHTML = 'R$' + parseFloat(vlMedioVet[i]).toFixed(2);
        tr.appendChild(td2);

        let td3 = document.createElement('td');
        td3.innerHTML = vlQtdeRendimentoVet[i]
        tr.appendChild(td3);

        let td4 = document.createElement('td');
        precoPorcao = parseFloat(vlMedioVet[i] / vlQtdeRendimentoVet[i]).toFixed(2)
        precoPorcao = precoPorcao.replace(/\./, ',');
        td4.innerHTML = 'R$' + precoPorcao

        //td4.innerHTML = 'R$' + parseFloat(vlMedioVet[i] / vlQtdeRendimentoVet[i]).toFixed(2);
        tr.appendChild(td4);
      }
    }
  };

  //xhttp.open("POST", `/receita/mediaPreco/${$dtInicial}`, true);
  xhttp.open("POST", `/receita/mediaPreco/${$dtInicial}&${$dtFinal}`, true);
  xhttp.send();
}

function formataDataReceita(stringData) {
  const dia = stringData.substring(9, 11);
  const mes = stringData.substring(6, 8);
  const ano = stringData.substring(1, 5);

  return dia + '/' + mes + '/' + ano;
}

function removerErros(tipo) {
  let $erros = document.getElementsByClassName('error');
  let $btnGravar = document.getElementById('btnGravar');
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
  let $btnGravar = document.getElementById('btnGravar');
  let $qtdeItem = document.getElementsByClassName('qtde')

  if ($qtdeItem.length > 0) {
    for (let i = 0; i < $erros.length; i++) {
      $erros[i].style.display = 'none'
    }
    $btnGravar.disabled = false
  }
}

