/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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

const dbConfig = process.env.DATABASE_URL;
//const dbConfig = {
//	host: 'localhost',
//	port: 5432,
//	database: 'randwind_db',
//	user: 'postgres',
//	password: 'cat96'
//};

var db = pgp(dbConfig);

// set the view engine to pug
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory



/*********************************
 Web Page Requests:

  Login Page:        Provided For your (can ignore this page)
  Registration Page: Provided For your (can ignore this page)
  Home Page:
  		/home - get request (no parameters)
  				This route will make a single query to the favorite_colors table to retrieve all of the rows of colors
  				This data will be passed to the home view (pages/home)

************************************/

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
});

// saved strins
app.get('/saved_strings', function(req, res) {
	res.render('pages/saved_strings',{
		local_css:"signin.css",
		my_title:"Login Page"
	});
});

// login page
app.get('/login', function(req, res) {
	res.render('pages/login',{
		local_css:"signin.css",
		my_title:"Login Page"
	});
});

// registration page
app.get('/registration', function(req, res) {
	res.render('pages/registration',{
		my_title:"Registration Page"
	});
});

//returns to home screen after successfully registering
app.post('/', function(req, res) {
	var name = req.body.fullName;
	var email = req.body.emailAddress;
	var password = req.body.passwordConfirm;
	var passwordConfirm = req.body.passwordConfirm;
	var business = req.body.businessStatus;
	var security = req.body.securityStatus;

	
	console.log(name);
	console.log(email);
	console.log(password);
	console.log(business);
	console.log(security);
	var insert_statement = "INSERT INTO registration(user_name, user_email, user_pass, business, security) VALUES('" + name + "','" +
							email + "','" + password +"','" + business + "','" + security + "') ON CONFLICT DO NOTHING;";

	db.task('get-everything', task => {
        return task.batch([
            task.any(insert_statement),
        ]);
    })
    .then(info => {
    	res.render('pages/home',{
				my_title: "Home Page"
			})
    })
    .catch(error => {
        // display error message in case an error
            //req.flash('error', error); //if this doesn't work for you replace with console.log
            res.render('pages/home', {
                title: 'Home Page'
            })
    });
});



app.listen(process.env.PORT);
