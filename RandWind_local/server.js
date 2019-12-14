/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
var cookieParser = require('cookie-parser'); //cookies
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const bcrypt = require('bcryptjs'); //for hashing and salting passwords
const saltRounds = 10;

const pug = require('pug');

//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.  We'll be using localhost and run our database on our local machine (i.e. can't be access via the Internet)
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab, we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database.  You'll need to set a password USING THE PSQL TERMINAL THIS IS NOT A PASSWORD FOR POSTGRES USER ACCOUNT IN LINUX!
**********************/

//const dbConfig = process.env.DATABASE_URL; //heroku DB 
const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'randwind_db',
	user: 'postgres',
	password: 'password'//'cat96'
};

var db = pgp(dbConfig);

// set the view engine to pug
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory

app.use(session({
    key: 'user_sid',
    secret: 'badabadaRadaRada',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});


// middleware function to check for logged-in users
const isLoggedIn = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        return true;
    } else {
		return false;
    }    
};



app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

/*********************************
 Web Page Requests:

  Login Page:        Provided For your (can ignore this page)
  Registration Page: Provided For your (can ignore this page)
  Home Page:
  		/home - get request (no parameters)
  				This route will make a single query to the favorite_colors table to retrieve all of the rows of colors
  				This data will be passed to the home view (pages/home)

************************************/


/******************************************* HELPER FUNCTIONS ******************************************/
const checkPassword = async (userEmail, userPassword) => {
	
	db.one('SELECT user_pass FROM registration WHERE user_email=$1', [userEmail], h => h)
	.then(hash => {
		bcrypt.compare(userPassword, hash, function(err, res) { //res is true if match, false if not
			if (res) { //If the password matches hash
				return true;
			} else {
				return false;
			}			
		});
	})
	.catch(error => {
		// display error message in case an error
			//req.flash('error', error); //if this doesn't work for you replace with console.log
			console.log(error);
	});


  }


const registerUser = async (name,email,password,business,security) => { 
	console.log('Register function started')
	db.none('INSERT INTO registration(user_name, user_email, user_pass, business, security) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING', [name,email,password,business,security])
	.then(() => {
		console.log('Register success')
		return true
	})
	.catch(error => {
		// display error message in case an error
		//req.flash('error', error); //if this doesn't work for you replace with console.log
		console.log('error',error)
		return false
	});
}






  
// home page
app.get('/', function(req, res) {
	res.render('pages/home',{
		my_title:"Home Page"
	});
});

app.get('/generated_string', function(req, res) {

    // calling python scripts
		var spawn = require("child_process").spawnSync;
		var process = spawn('python', ["./python/driver.py", req.query.strLength, req.query.uniqueCharachters])


		console.log(process.output[2].toString());
		res.render('pages/generated_string',{
			my_title:"Generated String",
			randSTR: process.stdout.toString()
		});
    // This is for asycn process
		//process.stdout.on('data', function(data) {
		//		console.log(`stdout: ${data}`);
		//		res.render('pages/generated_string',{
		//			my_title:"Generated String",
		//			randSTR: data.toString()
		//		});
    //});
});

// about page
app.get('/about', function(req, res) {
	res.render('pages/about',{
		my_title:"About Page"
	});
	getHashByEmail('onetest@test.com'); //One Test onetest@test.com passwordTEST01 
});

// saved strins
app.get('/saved_strings', function(req, res) { 
	if(!isLoggedIn){ //If not logged in, session checker forces user to login page
		res.redirect('/')
	}
	res.render('pages/saved_strings',{
		local_css:"signin.css",
		my_title:"Login Page"
	});
});

// login page
app.get('/login', function(req, res) {
	if(isLoggedIn){
		res.redirect('/')
	}
	res.render('pages/login',{
		local_css:"signin.css",
		my_title:"Login Page"
	});
});

app.post('/auth', function(req, res) { //Hitting login
	var email = req.body.inputEmail;
	var password = req.body.inputPassword;
	console.log(email,password)
	if (email && password) {
		if(checkPassword(email, password)) { //Succesful login
			req.session.loggedin = true;
			req.session.email = email;
			res.redirect('/home');
		}else { //Insuccesful login
			res.send('Incorrect email and/or Password!');
		}
		
	} else {
		res.send('Please enter email and Password!');
		res.end();
	}
});




// registration page
app.get('/registration', function(req, res) {
	if(isLoggedIn){
		res.redirect('/')
	}
	res.render('pages/registration',{
		my_title:"Registration Page"
	});
});

//returns to home screen after successfully registering
app.post('/', function(req, res) {
	var name = req.body.fullName;
	var email = req.body.emailAddress;
	var password = req.body.passwordConfirm;
	var business = req.body.businessStatus;
	var security = req.body.securityStatus;

	bcrypt.genSalt(saltRounds, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
			// Store hash in your password DB.
			password = hash;
			console.log(hash)
			registerUser(name,email,password,business,security);

			/*
			var insert_statement = "INSERT INTO registration(user_name, user_email, user_pass, business, security) VALUES('" + name + "','" +
							email + "','" + password +"','" + business + "','" + security + "') ON CONFLICT DO NOTHING;";
			console.log("Insert variable created")
			db.task('get-everything', task => {
				return task.batch([
					task.any(insert_statement),
				]);
			})
			.then(info => {
				
			})
			.catch(error => {
				// display error message in case an error
					//req.flash('error', error); //if this doesn't work for you replace with console.log
					console.log('error',error)
					res.render('pages/home', {
						title: 'Home Page'
					})
			}); */

		});
		res.render('pages/home',{
			my_title: "Home Page"
		})
	});

	console.log(name);
	console.log(email);
	console.log(password);
	console.log(business);
	console.log(security);
	
});



//app.listen(process.env.PORT);
app.listen(3000);