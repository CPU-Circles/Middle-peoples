const express = require("express");
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './views'))
app.engine('html', require('ejs').renderFile)
app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static('images'));
app.use(express.static('scripts'));
app.use(express.static('csss'));

app.listen(7777, () => {
    console.log("Your app is listening on port " + 7777);
});

try{
    require('./router/main')(app);
}catch(e){
    console.log(e)
}