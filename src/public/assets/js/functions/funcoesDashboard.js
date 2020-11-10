let $hidden = document.getElementsByClassName('Hidden')
let $dataPgtoImposto = document.getElementsByClassName('dataPgto_Imposto')
let $totalImposto = document.getElementsByClassName('total_Imposto')

let $dataPgtoVenda = document.getElementsByClassName('data_Venda')
let $totalVenda = document.getElementsByClassName('total_Venda')

let $dataCompra = document.getElementsByClassName('data_Compra')
let $totalCompra = document.getElementsByClassName('total_Compra')

let $receitasTop5 = document.getElementsByClassName('receitas')
let regexQtde = new RegExp(/("quantidade":)([\w]*)/g)
let regexReceita = new RegExp(/("receita":")([\wáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÒÖÚÇÑ\s]*)("})/g)

ocultaItens()
montaGraficoImpostos()
montaGraficoVendas()
montaGraficoCompras()
montaGraficoTop5Produtos()
mostraTotais()
calculaMediaReceitas()


function montaGraficoImpostos() {
  var ctx = document.getElementById("myChart1");
  var myChart1 = new Chart(ctx, {
    type: 'line',
    // type: 'bar',
    data: {
      labels: [],
      datasets: [{
        data: [],
        lineTension: 0,
        // backgroundColor: 'transparent',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        borderColor: '#FF0A28', //'#FFA500',
        borderWidth: 4,
        pointBackgroundColor: '#FF0A28' //'#FFA500'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }],
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        // text: 'Impostos/Despesas',
        fontStyle: 'bold',
        fontSize: 25
      }
    }
  });

  for (let i = 0; i < $dataPgtoImposto.length; i++) {
    debugger
    let data = new Date();
    let data2 = new Date().toLocaleDateString();
    let dataVet = Date.parse($dataPgtoImposto[i].value)
    let dataVet2 = new Date(dataVet).toLocaleDateString()
    let fusoHorario = data.getTimezoneOffset() * 60000
    let dataImpostoAux = new Date(dataVet - fusoHorario).toLocaleDateString()
    // let dataImpostoAux = new Date(Date.parse($dataPgtoImposto[i].value)).toLocaleDateString()
    myChart1.data.labels.push(dataImpostoAux);
  }

  for (let i = 0; i < $totalImposto.length; i++) {
    myChart1.data.datasets[0].data.push(parseFloat($totalImposto[i].value).toFixed(4));
  }

  myChart1.update();
}

function montaGraficoVendas() {
  var ctx = document.getElementById("myChart2");
  var myChart2 = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        data: [],
        lineTension: 0,
        // backgroundColor: 'transparent',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        borderColor: '#1E90FF',
        borderWidth: 4,
        pointBackgroundColor: '##1E90FF'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }],
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        // text: 'Vendas',
        fontStyle: 'bold',
        fontSize: 25
      }
    }
  });

  for (let i = 0; i < $dataPgtoVenda.length; i++) {
    let dataVendaAux = new Date(Date.parse($dataPgtoVenda[i].value)).toLocaleDateString()
    myChart2.data.labels.push(dataVendaAux);
  }

  for (let i = 0; i < $totalVenda.length; i++) {
    myChart2.data.datasets[0].data.push(parseFloat($totalVenda[i].value).toFixed(4));
  }

  myChart2.update();
}

function montaGraficoCompras() {
  var ctx = document.getElementById("myChart3");
  var myChart3 = new Chart(ctx, {
    type: 'line',
    // type: 'bar',
    data: {
      labels: [],
      datasets: [{
        data: [],
        lineTension: 0,
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        borderColor: '#00CED1',
        borderWidth: 4,
        pointBackgroundColor: '#00CED1'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }],
      },
      legend: {
        display: false,
      },
      title: {
        display: true,
        // text: 'Compras',
        fontStyle: 'bold',
        fontSize: 25
      }
    }
  });

  for (let i = 0; i < $dataCompra.length; i++) {
    let dataCompraAux = new Date(Date.parse($dataCompra[i].value)).toLocaleDateString()
    myChart3.data.labels.push(dataCompraAux);
  }

  for (let i = 0; i < $totalCompra.length; i++) {
    myChart3.data.datasets[0].data.push(parseFloat($totalCompra[i].value).toFixed(4));
  }

  myChart3.update();
}

function montaGraficoTop5Produtos() {
  var ctx = document.getElementById("myChart4");
  var myChart4 = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: ['#1E90FF', '#FFA10B', '#00CED1', '#FF0A28', '#FFD02A'],
      }]
    },
    options: {
      responsive: true
    }
  });

  let vetQtde = [];
  let qtdeReceita = ''
  while (qtdeReceita = regexQtde.exec($receitasTop5[0].outerText)) {
    vetQtde.push(qtdeReceita[2])
  }

  let vetReceita = [];
  let nomeReceita = ''
  while (nomeReceita = regexReceita.exec($receitasTop5[0].outerText)) {
    vetReceita.push(nomeReceita[2])
  }

  for (let i = 0; i < vetReceita.length; i++) {
    myChart4.data.labels.push(vetReceita[i]);
  }

  for (let i = 0; i < vetReceita.length; i++) {
    myChart4.data.datasets[0].data.push(parseFloat(vetQtde[i]));
  }

  myChart4.update();

}

function mostraTotais() {
  //Total Impostos/Despesas últimos 30 dias
  let totalImposto = 0
  for (let i = 0; i < $totalImposto.length; i++) {
    totalImposto += (parseFloat($totalImposto[i].value))
  }
  totalImposto = totalImposto.toFixed(2).replace(/\./, ',')
  let $ValueCard1DashBoard = document.getElementById('ValueCard1DashBoard')
  $ValueCard1DashBoard.innerHTML = 'R$' + totalImposto

  //Total Compras últimos 30 dias
  let totalCompra = 0
  for (let i = 0; i < $totalCompra.length; i++) {
    totalCompra += (parseFloat($totalCompra[i].value));
  }
  totalCompra = totalCompra.toFixed(2).replace(/\./, ',')
  let $ValueCard2DashBoard = document.getElementById('ValueCard2DashBoard')
  $ValueCard2DashBoard.innerHTML = 'R$' + totalCompra

  //Total Vendas últimos 30 dias

  let totalVenda = 0
  for (let i = 0; i < $totalVenda.length; i++) {
    totalVenda += (parseFloat($totalVenda[i].value));
  }
  let $ValueCard3DashBoard = document.getElementById('ValueCard3DashBoard')

  totalVenda = totalVenda.toFixed(2).replace(/\./, ',')
  $ValueCard3DashBoard.innerHTML = 'R$' + totalVenda

  //Produto mais vendido últimos 30 dias
  let vetProduto = [];
  let nomeProduto = ''
  while (nomeProduto = regexReceita.exec($receitasTop5[0].outerText)) {
    vetProduto.push(nomeProduto[2])
  }

  let produto = vetProduto[0]
  let $ValueCard4DashBoard = document.getElementById('ValueCard4DashBoard')

  if (produto != undefined) {
    $ValueCard4DashBoard.innerHTML = produto
  } else {
    $ValueCard4DashBoard.innerHTML = 'XXX'
    $ValueCard4DashBoard.setAttribute('style', 'color:#FFA10B !important')
  }
}

function ocultaItens() {
  for (let i = 0; i < $hidden.length; i++) {
    document.getElementsByClassName('Hidden')[i].style.display = "none";
  }
}

function calculaMediaReceitas() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      if (this.responseText != '') {

      }
    }
  };
  xhttp.open("GET", `/receita/calcularMediaLogin/`, true);
  xhttp.send();

}







