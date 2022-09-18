const express = require('express')  // import express from module
const router = express.Router()     // create new Router
const Author = require('../models/author')

//all authors route
router.get('/', async (req, res) => {
    let searchOptions = {}

    if(req.query.name != null && req.query.name !== ''){

        //catch invalid regex pattern
        try{
            searchOptions.name = new RegExp(req.query.name, 'i')
        }catch(err){
            console.log(err)
        }
        // searchOptions.name = new RegExp(req.query.name, 'i')
    }
    
    try{
        const authors = await Author.find(searchOptions) //find all authors, no where conditions
        res.render('authors/index', {
            authors:authors, 
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }    
})

//new authors route - display form to create new author
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

//add new author to collection

router.post('/', async (req, res) => { // root -> REST post acts on entire collection
    const author = new Author({
        name:req.body.name
    })

    try{
        const newAuthor = await author.save()
        // res.redirect(`authors/${newAuthor.id}`)
        res.redirect(`authors`)
    }catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'error creating author'
        })
    }
})

module.exports = router