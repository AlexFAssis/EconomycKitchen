const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const database = require('./config/database.js');
const flash = require('connect-flash')
const session = require('express-session')
// const FileStore = require('session-file-store')(session)
const dateFilter = require('nunjucks-date-filter');
// const RedisStore = require('connect-redis')(session);
// const dotenv = require('dotenv').load()
require('dotenv').config({ path: __dirname + '/.env' })


// const bodyParser = require('body-parser');

// const validate = require('express-validation');

class App {
  constructor() {
    this.express = express();
    this.database();
    this.middlewares();
    this.views();
    this.routes();
  }

  database() {
    var uri = ''
    if (process.env.NODE_ENV == "production") {
      uri = process.env.URI_PROD
    } else {
      uri = process.env.URI_HOMOLOG
    }
    database(uri)
  }

  middlewares() {
    /*
      Como vai ser usado a API rest, o front ficará separado do
      back, e os dados do back serão consumidos atrqavés de arquivos
      JSON
      **A linha abaixo só é usada quando o back e o front estão no msm projeto
      -this.express.use(express.urlencoded({ extended: false }));
    */
    this.express.use(session({
      secret: 'SecretEK',
      resave: false, //era false antes do file store
      saveUninitialized: false //era false antes do file store
    }))
    this.express.use(express.urlencoded({ extended: false }));
    //Os dados vão ser enviados pelo req.body
    this.express.use(express.json());
    this.express.use(flash())
  }

  views() {
    //caminho absoluto da aplicação/app/views
    nunjucks.configure(path.resolve(__dirname, 'app', 'views'), {
      //Só vai 'observar' alterações nas views  caso o ambiente de dev seja testes
      watch: this.isDev,
      express: this.express,
      autoescape: true
    }).addFilter('date', dateFilter);

    //'Mostrando para o express os arquivos PUBLIC (css, etc)'
    this.express.use(express.static(path.resolve(__dirname, 'public')));
    //  app.use(express.static(__dirname + '/public'));
    this.express.set('view engine', 'njk');
  }

  routes() {
    //Use pq é um middleware
    this.express.use(require('./routes.js'));
  }

  setUpNunjucks() {

  }

}

module.exports = new App().express;