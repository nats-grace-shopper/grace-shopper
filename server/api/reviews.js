const router = require('express').Router()
const {Review} = require('../db/models')
module.exports = router

router.get('/', (req, res, next) => {
  Review.findAll({
    attributes: ['title', 'content', 'rating']
  })
    .then(reviews => res.json(reviews))
    .catch(next)
})

router.get('/:productId', (req, res, next) => {
    Review.findAll({
      where: {id: req.params.productId}
    })
      .then(reviews => res.json(reviews))
      .catch(next)
  })