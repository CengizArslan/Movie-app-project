# Movie-app-project

To Start:

1. Create a project folder

2. Inside of that project folder add the code inside of this repository with this structure:

movie-app/                          PROJECT ROOT
├── node_modules/                   AUTO-GENERATED (npm install)
│
├── server.js                       MAIN APPLICATION FILE
├── package.json                    DEPENDENCY LIST & CONFIG
├── package-lock.json               AUTO-GENERATED (npm install)
├── .env                            ENVIRONMENT VARIABLES (YOU CREATE)
│
├── models/                         DATABASE SCHEMAS
│   ├── Movie.js                    MOVIE DATA STRUCTURE
│   └── User.js                     USER DATA STRUCTURE
│
├── routes/                         URL HANDLERS
│   └── movies.js                   ALL PAGE LOGIC
│
├── middleware/                     SECURITY CHECKS
│   └── auth.js                     AUTHENTICATION MIDDLEWARE
│
├── views/                          HTML TEMPLATES (PUG)
│   ├── layout.pug                  BASE TEMPLATE (nav, footer, scripts)
│   ├── index.pug                   HOME PAGE (all movies)
│   ├── error.pug                   ERROR PAGE
│   │
│   ├── movies/                     MOVIE-RELATED PAGES
│   │   ├── add.pug                 ADD MOVIE FORM
│   │   ├── edit.pug                EDIT MOVIE FORM
│   │   └── show.pug                SINGLE MOVIE DETAILS
│   │
│   └── auth/                       AUTHENTICATION PAGES
│       ├── login.pug               LOGIN FORM
│       └── register.pug            REGISTER FORM
│
└── public/                         STATIC FILES (CSS, JS, IMAGES)
    ├── css/                        STYLESHEETS
    │   └── style.css               CUSTOM CSS
    │
    └── js/                         JAVASCRIPT FILES
        └── main.js                 CLIENT-SIDE JAVASCRIPT

3. run this inside of project terminal: npm install

4. create .env file

  it neeeds to have the MONGODB_URI (the location of your MongoDB server)
  session secret key 
  and port location (for example 3000 which means the app will run on localhost:3000)

5. start the mongodb server with this command: & "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
   (file path my be different for you)

6. in a new terminal (leave the other one running) write npm run dev or node server.js
