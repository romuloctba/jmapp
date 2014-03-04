var myFunctions = require('../controllers/functions');
var authenticate = myFunctions.authenticate;
var Projeto = require('../models/projetoschema.js');
var User = require('../models/user.js');
var hash = require('../pass').hash;
/*
 * GET home page.
 */

exports.index = function (req, res) {

    res.render('index', { title: 'Jmsystem', user : req.session.user });
};
exports.signup = function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup");
    }
};
exports.signuppost =  function (req, res) {
    var password = req.body.password;
    var username = req.body.username;
    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var user = new User({
            username: username,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/');
                    });
                }
            });
        });
    });
}
exports.criaprojeto = function(req, res) {
	var nome = req.body.nome,
	 cliente = req.body.cliente,
	 criadopor = req.session.user.username,
     deadline = req.body.deadline,
     briefing = req.body.briefing;
     
	var projeto = new Projeto({
	nome : nome,
	cliente : cliente,
	criadopor : criadopor,
    deadline : deadline,
    briefing : briefing,
    });
    projeto.save(function(err, novoProj) {
    	if(err) {
    		return next(err);
    	}
    	if(novoProj) {
    		res.render('todosjobs', {
    			message: "Projeto <pre>"+ novoProj.nome + "</pre> para o cliente <pre>" + projeto.cliente + "</pre> criado com sucesso",
    			user: req.session.user
    			
    			});
    	}
    }); 
}
exports.novoProjeto = function(req, res){
	res.render('novoprojeto', {message: "Preencha com atenção!", user : req.session.user});
}
exports.login = function (req, res) {
    res.render("login");
}
exports.loginpost = function (req, res) {
    authenticate(req.body.username, req.body.password, function (err, user) {
        if (user) {

            req.session.regenerate(function () {
                req.session.user = user;
                req.session.success = 'Autenticado como ' + user.username;
                res.redirect('/');
            });
        } else {
            req.session.error = 'Erro, favor verificar usuário e senha';
            res.redirect('/login');
        }
    });
}
exports.logout =  function (req, res) {
    if(req.session.user) {
    req.session.destroy(function () {
        res.render('index',{ message: "Logout com sucesso. Vou sentir saudades." });
    });
    } else {
    	res.render('index',{ message: "Vc nem está logado, idiota." });
    }
}
exports.profile = function (req, res) {
    res.send('Profile page of '+ req.session.user.username +'<br>'+' click to <a href="/logout">logout</a>');
}
exports.todosJobs = function(req, res){
	Projeto.find({}, function(err, docs){
      res.render("todosjobs", { id: docs._id, docs: docs, message: "Exibindo Jobs, pq vc está logado", user : req.session.user })
    });
}
exports.projeto = function(req, res) {
	var projeto = req.params.id;
	Projeto.findOne({_id: projeto }, function(err, docs){
	res.render('projeto', {
		id: docs._id,
		docs: docs,
		user: req.session.user
	})
	});
}
exports.projetoedit = function(req, res) {
	var projeto = req.params.id;
	Projeto.findOne({_id: projeto }, function(err, docs){
	res.render('novoprojeto', {
		id: docs._id,
		editmode: true,
		docs: docs,
		user: req.session.user,
		message: 'Editando ' + docs.nome
	})
	});
}
exports.projetosave = function(req, res){
	var nome = req.body.nome,
	 cliente = req.body.cliente,
	 criadopor = req.session.user.username,
     deadline = req.body.deadline,
     briefing = req.body.briefing;
     var ide = req.body.ide;
	 
	var projeto = new Projeto({
	nome : nome,
	cliente : cliente,
	criadopor : criadopor,
    deadline : deadline,
    briefing : briefing,
    ide: ide
    });
    var upsertData = projeto.toObject();
    delete upsertData._id;
    Projeto.update({_id: ide}, upsertData, function(err, salvei){
    	if (err) throw err;
    	if(salvei) {
    		Projeto.find({}, function(err, docs){
    			if (err) throw err;
    			else {
    		res.render('todosjobs', {
    			message: "<strong>Atualizado</strong> com sucesso",
    			user: req.session.user,
    			title: 'Projeto Atualizado',
    			docs: docs
    			});		
    			}
    		});
    		
    	}
    	
    }); 
}
exports.projetodelete = function(req, res){
	var projeto = req.params.id;
	console.log('id eh    ' + projeto);
	Projeto.remove({_id: projeto}, function(error, result){
		if (error) throw error;
		if(result) { 
			Projeto.find({}, function(err, docs){
			res.render('todosjobs', {
    			message: "<strong>Apagado</strong> com sucesso",
    			user: req.session.user,
    			title: 'Projeto APAGADO (para sempre)',
    			docs: docs
    			});	
			})
				
			}
	})
}