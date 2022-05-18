const {GetList, AddNewToDo, DeleteToDo, EditToDo, UpdateToDo} = require('../controllers/listAppControllers')
const express = require("express");
const listrouter = express.Router();
const passport = require ("passport")

// rendering the list page 
listrouter.get('/list', checkAuthenticated, GetList)

//rendering 'add new to-do' page
listrouter.get('/new', checkAuthenticated, (req, res) => {
    res.render('new.ejs')
  })

//adding new to-do to the list
listrouter.post('/new',checkAuthenticated, AddNewToDo);

//deleting to-do from the list
listrouter.post('/delete/:id', checkAuthenticated, DeleteToDo)

//rendering Edit Todo page
listrouter.get('/edit/:id',checkAuthenticated, EditToDo);

//updating items on the table
listrouter.post('/update/:id',checkAuthenticated, UpdateToDo);

function checkAuthenticated(req, res, next) {
    if (req.user) {
      next();
    }
    
   else{
    req.flash('success_msg', 'You need to be authenticated to access this page');
    res.redirect("/users/login");
    
  }
  }

module.exports = { listrouter };

