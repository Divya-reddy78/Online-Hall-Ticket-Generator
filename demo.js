var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var GridFsStorage = require('multer-gridfs-storage');
var Grid = require('gridfs-stream');

var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
}));
app.use('/assets',express.static('./public/assets'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'CSE'
});

var storage = multer.diskStorage({
	destination: function(req,file,callback){
		callback(null,'./public/assets');
	},
	filename: function(req,file,callback){
		req.session.filename=file.originalname;
		callback(null,file.originalname);
	}
});

var upload = multer({storage:storage});

app.set('view engine','ejs');

app.get('/',function(req,res){
res.render('firstpage');
//res.send('hello i am divya');
});
var username;
var ID;
var connection1 = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'CSE'
});
var butt;
app.post('/selection', function(request, response) {
	if(request.body.hasOwnProperty("Main")){
		console.log("butt1 clicked");
		butt="Main";
	 }else{
		console.log("butt2 clicked");
		butt="Supply";
	 }
	response.redirect("/demo");
});
app.get('/demo',function(req,res){
	res.render("regis");
	//res.send('hello i am divya');
	});
app.post('/auth', function(request, response) {
	username = request.body.username;
	ID = request.body.ID;
	if (username && ID) {
		if(butt=="Main"){
		connection1.query('SELECT * FROM student WHERE name = ? AND SID = ? AND finished=0 ', [username, ID], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session.ID = ID;
			}
				 else {
				response.send('Incorrect Username and/or ID!');
			}
			connection1.query('SELECT Exampay FROM student WHERE name = ? AND SID = ? ', [username, ID], function(error, results4, fields) {
				if (error){
					return console.error(error.message);
				  }
				console.log(results4);
				if(results4[0].Exampay==1){
					response.redirect('/next4');
				}
				else{
					response.redirect('/next');
				}
			});			
		});
	}
        else{
	     connection1.query('SELECT * FROM supply WHERE name = ? AND SID = ? ', [username, ID], function(error, results, fields) {
		if (results.length > 0) {
			request.session.loggedin = true;
			request.session.username = username;
			request.session.ID = ID;
			//connection1.query('SELECT Exampay FROM supply WHERE name = ? AND SID = ? ', [username, ID], function(error, results, fields) {	
			//response.redirect('/next');
			} else {
				response.send('Incorrect Username and/or ID!');
			}	
			connection1.query('SELECT Exampaysupply FROM student WHERE name = ? AND SID = ? ', [username, ID], function(error, results4, fields) {
				if (error){
					return console.error(error.message);
				  }
				console.log(results4);
				if(results4[0].Exampaysupply==1){
					response.redirect('/next4');
				}
				else{
					response.redirect('/next');
				}
			});			
});
}
	}
	else {
		response.send('Please enter Username and ID!');
		response.end();
	}
});
app.post('/auth1', upload.single('pic'),function(request, response) {
	var image = request.session.filename;
	var number = request.body.phone;
	console.log(image);
	console.log(number);
	console.log(username);
	console.log(ID);
	if (image && number){
		//var sql1='UPDATE student SET Photo='+image+', Mobileno='+number+', WHERE name ='+username+' AND SID ='+ID;
		//console.log(sql1);
		connection.query('UPDATE student SET Photo=? , Mobileno=? WHERE name = ? AND SID = ?', [image,number,username,ID], function(error, results, fields) {
			//console.log(results.affectedRows);
			if (error){
				return console.error(error.message);
			  }
				response.redirect('/next1');		
			    response.end();
		});
	}
});
app.get('/next',function(req,res){
	res.render('index2');
	//res.send('hello i am divya');
	});
	var data;
	var c;
	var odev;
app.get('/next1',function(req,res){
	console.log(butt);
	  if(butt=="Main"){
		connection.query('SELECT Semester FROM student WHERE name = ? AND SID = ?', [username, ID], function(error, results, fields) {
			if (error){
				return console.error(error.message);
			  }
				c =results[0].Semester;
		connection.query("SELECT SUBName FROM subjects WHERE Semester=?",[c], function (error, result, fields) {
			console.log(result);
			if (error){
				return console.error(error.message);
			  }
		    else {
				obj = {print: result};
            res.render('index3', obj);      
			}
		});
	});
    }
    else{
	connection.query('SELECT Semester FROM student WHERE name = ? AND SID = ?', [username, ID], function(error, results, fields) {
		if (error){
			return console.error(error.message);
		  }
			c =results[0].Semester;
			if(c%2==0){
				console.log("semester is even");
				odev=0;
			}
			else{
				console.log("semester is odd");
				odev=1;
			}
			if(odev==0){
				connection.query("SELECT SUBName FROM supply WHERE SID = ?",[ID], function (error, result, fields) {
					console.log(result);
			      if (error){
				     return console.error(error.message);
			      }
		          else {
				    obj = {print: result};
                    res.render('index3', obj);      
			      }
				});
			}
			else{
				connection.query("SELECT sem FROM supply WHERE SID = ?",[ID], function (error, result, fields) {
					var i=0;
					var arr=[];
                      for(var x in result){
						  if(x%2!=0){
							connection.query("SELECT SUBName FROM supply WHERE sem=? AND SID=?",[x,ID], function (error, result, fields) {
								console.log(result);
			                   if (error){
				               return console.error(error.message);
			                   }
		                       else {
				                 obj = {print: result};
                                  res.render('index3', obj);      
			                     }
							});
						  }
					  }
				});
			}
});
}
});
/*app.post('/auth1', function(request, response) {
			response.render('index4');
		});*/
app.post('/auth3', function(request, response) {
	 
				response.redirect('/next2');
				response.end();		

});
app.get('/next2',function(request, response){
	response.render('sign');
	});		
app.post('/auth4',upload.single('sign'),function(request, response) {
	var image = request.session.filename;
	var number = request.body.pay;
	console.log(image);
	console.log(number);
	console.log(username);
	console.log(ID);
	if (image && number){
		if(butt=="Main"){
		connection.query('UPDATE student SET Sign=? , Exampay=1 WHERE name = ? AND SID = ?', [image,username,ID], function(error, results, fields) {
			//console.log(results.affectedRows);
			if (error){
				return console.error(error.message);
			  }
			});
		}
			else{
                connection.query('UPDATE student SET Sign=? , Exampaysupply=1 WHERE name = ? AND SID = ?', [image,username,ID], function(error, results, fields) {
					//console.log(results.affectedRows);
					if (error){
						return console.error(error.message);
					  }
					});
			}
			response.redirect('/next4');		
	}		

});	
var obj1;
var obj2;
	app.get('/next4',function(req,res){
		connection.query('SELECT * FROM student WHERE name = ? AND SID = ?', [username, ID], function(error, results, fields) {
			if (error){
				return console.error(error.message);
			  }
			  obj1 = {print: results[0]};
			  obj3={print3:butt};
			  //console.log(obj1);
			  if(butt=="Main"){
			connection.query('SELECT Semester FROM student WHERE name = ? AND SID = ?', [username, ID], function(error, results1, fields) {
				if (error){
					return console.error(error.message);
				  }
					c =results1[0].Semester;
			    connection.query("SELECT SUBName FROM subjects WHERE Semester=?",[c], function (error, result2, fields) {
				console.log(result2);
				if (error){
					return console.error(error.message);
				  }
				else {
				obj2 = {print1: result2}; 
				//res.render('hallticket',{obj1:obj1, obj2:obj2,obj3:obj3});     
				}
				connection.query("SELECT Date FROM Examinfo WHERE Exam=?",[butt], function (error, result4, fields) {
					if (error){
						return console.error(error.message);
					  }
					else {
						console.log(result4);
					    obj4 = {print4: result4[0].Date}; 
					res.render('hallticket',{obj1:obj1, obj2:obj2,obj3:obj3,obj4:obj4}); 
					}
				});
			});
		});
	}
    else{
		obj3={print3:butt};
				if(odev==0){
					connection.query("SELECT SUBName FROM supply WHERE SID = ?",[ID], function (error, result, fields) {
						console.log(result);
					  if (error){
						 return console.error(error.message);
					  }
					  else {
						obj2 = {print1: result};
						//res.render('hallticket',{obj1:obj1, obj2:obj2,obj3:obj3});  
					}
					connection.query("SELECT Date FROM Examinfo WHERE Exam=?",[butt], function (error, result4, fields) {
						if (error){
							return console.error(error.message);
						  }
						else {
						obj4 = {print4: result4[0].Date}; 
						res.render('hallticket',{obj1:obj1, obj2:obj2,obj3:obj3,obj4:obj4}); 
						}
					});
					});
				}
				else{
					connection.query("SELECT sem FROM supply WHERE SID = ?",[ID], function (error, result, fields) {
						var i=0;
						var arr=[];
						  for(var x in result){
							  if(x%2!=0){
								connection.query("SELECT SUBName FROM supply WHERE sem=? AND SID = ?",[x,ID], function (error, result, fields) {
									console.log(result);
								   if (error){
								   return console.error(error.message);
								   }
								   else {
									 obj2 = {print1: result};
									}
									connection.query("SELECT Date FROM Examinfo WHERE Exam=?",[butt], function (error, result4, fields) {
										if (error){
											return console.error(error.message);
										  }
										else {
										obj4 = {print4: result4[0].Date}; 
										res.render('hallticket',{obj1:obj1, obj2:obj2,obj3:obj3,obj4:obj4}); 
										}
									});
								});
							  }
						  }
					});
				}
	}
});
});
app.listen(3000);