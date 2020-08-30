const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const database = require('./config/database.js');
const flash = require('connect-flash')
const session = require('express-session')
// const FileStore = require('session-file-store')(session)
const dateFilter = require('nunjucks-date-filter');
// const RedisStore = require('connect-redis')(session);
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
    // if (process.env.NODE_ENV == "production") {
    uri = process.env.URI_PROD
    // } else {
    //   uri = process.env.URI_HOMOLOG
    // }
    database(uri)
  }

  middlewares() {
    this.express.use(session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false
    }))
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(express.json());
    this.express.use(flash())
  }

  views() {
    //caminho absoluto da aplicação/app/views
    nunjucks.configure(path.resolve(__dirname, 'app', 'views'), {
      watch: this.isDev,
      express: this.express,
      autoescape: true
    }).addFilter('date', dateFilter);

    //'Mostrando para o express os arquivos PUBLIC (css, etc)'
    this.express.use(express.static(path.resolve(__dirname, 'public')));
    this.express.set('view engine', 'njk');
  }

  routes() {
    this.express.use(require('./routes.js'));
  }

  setUpNunjucks() {

  }

}

module.exports = new App().express;