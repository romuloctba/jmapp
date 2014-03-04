/*
Module Dependencies 
*/
var express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    hash = require('./pass').hash;
var routes = require('./routes/index');
var myFunctions = require('./controllers/functions');
var myModels = require('./models/models');
var app = express();

/*
Database and Models
*/
mongoose.connect("mongodb://localhost/jmapp");



/*
Middlewares and configurations 
*/
app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.cookieParser('jmsystem-cookie'));
    app.use(express.session());
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
});

app.use(function (req, res, next) {
    var err = req.session.error,
        msg = req.session.success;
    delete req.session.error;
    delete req.session.success;
    res.locals.message = '';
    if (err) res.locals.message = '<p class="text-danger">' + err + '</p>';
    if (msg) res.locals.message = '<p class="text-success">' + msg + '</p>';
    next();
});

/*
Routes
*/
app.get("/", routes.index);
app.get("/signup", routes.signup);
app.post("/signup", myFunctions.userExist, routes.signuppost);
app.get("/login", routes.login);
app.post("/login", routes.loginpost);
app.get('/logout', routes.logout);
app.get('/profile', myFunctions.requiredAuthentication, routes.profile);
app.get('/todosJobs', myFunctions.requiredAuthentication, routes.todosJobs);
app.get('/novoProjeto', myFunctions.requiredAuthentication, routes.novoProjeto);
app.post('/novoProjeto', myFunctions.requiredAuthentication, routes.criaprojeto);
app.get('/projeto/:id', myFunctions.requiredAuthentication, routes.projeto);
app.get('/projeto/edit/:id', myFunctions.requiredAuthentication, routes.projetoedit);
app.post('/projetosave', myFunctions.requiredAuthentication, routes.projetosave);
app.get('/projeto/delete/:id', myFunctions.requiredAuthentication, routes.projetodelete);
http.createServer(app).listen(3000);