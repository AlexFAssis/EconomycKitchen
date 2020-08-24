//O require faz com o JS saiba que ele vai ser procurado na pasta node_modules
const mongoose = require('mongoose');

//URI -Universal Resouce Identifier
module.exports = function () {

  if (process.env.NODE_ENV == "production") {
    uri = 'mongodb+srv://Alex:AFA123456@economyckitchen.p7k5g.mongodb.net/EconomycKitchen?retryWrites=true&w=majority'
  } else {
    uri = 'mongodb://localhost:27017/ProjetoTG'
  }

  uri

  mongoose.connect(uri, { useNewUrlParser: true });
  mongoose.set('useFindAndModify', false); //DeprecationWarning no método findOneAndUpdate
  mongoose.set('useCreateIndex', true)//collection.ensureIndex is deprecated. Use createIndexes instead

  mongoose.connection.on('connected', function () {
    console.log('--Mongoose conectado a +' + uri);
  });

  mongoose.connection.on('disconnected', function () {
    console.log("--Mongoose desconectado de + " + uri);
  });

  mongoose.connection.on('error', function (error) {
    console.log("--Erro no Mongoose + " + Error);
  });

  //Capturamos um sinal de encerramento (SIGINT), ctrl + c
  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      console.log('--Mongoose desconectado pelo término da aplicação');
      //0 indica que a finalização ocorreu sem erros
      process.exit(0);
    })
  })
}