(function () {
  'use-strict';
  $nomeUsuario = document.getElementById("nomeUsuario")
  $btnLogin = document.getElementById("btnLogin")

  if ($btnLogin) {
    $btnLogin.addEventListener('click', validacaoLogin)
    document.getElementById("login").addEventListener('change', limpaErro)
    document.getElementById("senha").addEventListener('change', limpaErro)
  }

  if ($nomeUsuario) {
    if (!$nomeUsuario.value) {
      document.getElementById('formExit').style.display = 'none';
    } else {
      ocultaTipos()
      carregaTipos()
    }
  }

  function ocultaTipos() {
    let $qtde = document.getElementsByClassName("selectHidden").length
    for (let i = 0; i < $qtde; i++) {
      document.getElementsByClassName("selectHidden")[i].style.display = "none";
    }
  }

  function carregaTipos() {
    let $select = document.getElementsByClassName('selectTipos')
    let $tipoString = document.getElementById('usuarioTipo')
    let $tipo = document.getElementsByClassName("hidden")

    for (let i = 0; i < $tipo.length; i++) {
      let itemSelect = document.createElement("OPTION");

      itemSelect.selected = false;
      itemSelect.value = $tipo[i].value;
      itemSelect.text = $tipo[i].text;

      if ($tipo[i].value == $tipoString.innerHTML) {
        itemSelect.selected = true;
      }

      $select[0].appendChild(itemSelect);
    }
  }

  function limpaErro() {
    document.getElementById("ErroLogin").style.display = 'none'
  }

  function validacaoLogin() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {

      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText != '') {
          document.getElementById("ErroLogin").style.display = 'block'
          switch (this.responseText) {
            case '1':
              document.getElementById("ErroLogin").innerText = 'Informe um login ou e-mail válido e senha'
              break
            case '2':
              document.getElementById("ErroLogin").innerText = 'Usuário não encontrado'
              break
            case '3':
              document.getElementById("ErroLogin").innerText = 'Informe uma senha'
              break
            case '4':
              document.getElementById("ErroLogin").innerText = 'Senha inválida'
              break
            default:
              document.getElementById("ErroLogin").style.display = 'none'
              document.location.reload(true);
          }


        }
      }
    };

    let email = document.getElementById('login').value
    let senha = document.getElementById('senha').value

    xhttp.open("POST", `/usuario/validacao`, true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({ email: email, senha: senha }));
  }

})()