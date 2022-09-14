const express = require('express')
const router = express.Router()

// router.get('/')

router
    .route('/')
    .get((req, res) => {
        res.render('index')
    })

module.exports = router