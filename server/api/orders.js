const router = require('express').Router();
const { Order, ProductOrder } = require('../db/models');
const mailer = require('./nodemailer')
// GET all orders
//right now passwords and salts are coming too, but that needs to not be a thing....
router.get('/', (req, res, next) => {
  if (req.query.status) {
    Order.findAll({
      where: { status: req.query.status }
    })
      .then(orders => res.json(orders))
      .catch(next)
  } else {
    Order.findAll({
      include: [
        { all: true }
      ]
    })
      .then(orders => {
        res.json(orders)
      })
      .catch(next)
  }
});

// GET orders (with products and quantities in the order) by userId

router.get('/users/:userId', (req, res, next) => {
  Order.findAll( { include: [{ all: true }], where: {userId: req.params.userId}} )
  .then(orders => res.json(orders))
  .catch(next)
})

router.get('/cart', (req, res, next) => {
  Order.findOne( { include: [{ all: true }], where: {userId: req.user.id, isCart: true}} )
  .then(order => res.json(order))
  .catch(next)
})


// PUT orders from "Complete my purchase" button
router.put('/users/:userId', (req, res, next) => {
  req.body.isCart = false
  Order.update(req.body, {
    where: { userId: req.params.userId, isCart: true}, returning: true
  })
  .then(order => {
    mailer(req.user.email)
    Order.create({userId: req.params.userId, isCart: true})
    .then(newOrder => newOrder)
    .catch(next)
    const updated = order[1][0]
    res.json(order)})
  .catch(next)
});



// GET single order by id
//right now passwords and salts are coming too, but that needs to not be a thing....
// router.get('/:orderId', (req, res, next) => {
//   Order.findById(req.params.orderId, { include: [{ all: true }] })
//     .then(order => res.json(order))
//     .catch(next)
// });




//POST create an order --> (maybe fetch this upon initial page load?)
//req.body in json form needs (at the minimum) to be:
/*{
	"address": "it works!",
  "userId": "1"
}*/
router.post('/cart', (req, res, next) => {
  const { userId } = req.body
  Order.findOrCreate({
    where: {
      userId,
      isCart: true
    }
  })
    .spread((createdOrder, bool) => {
      if (bool) {
        res.send(createdOrder)
      } else {
        res.send(createdOrder);
      }
    })
    .catch(next)
});

// PUT Change the status of an order
//PUT /add -> add an item to the quantity (or if no item added to the order, it will create one)
//not fully sure if the statuses are correct?
/* needs to recieve info as:
{
  orderId: "num"
  productId: "num"
} */
router.put('/add', (req, res, next) => {
  const { orderId, productId } = req.body
  ProductOrder.findOrCreate({
    where: { orderId, productId }
  })
    .spread((add, bool) => {
      if (bool) {
        res.status(200).json(add)
      } else {
        add.increment('quantity')
          .then(addition => res.status(201).json(addition))
          .catch(next)
      }
    })
    .catch(next)
});

//PUT /delete - remote an item from the quantity
/* needs to recieve info as:
{
  orderId: "num"
  productId: "num"
} */
router.put('/remove', (req, res, next) => {
  const { orderId, productId } = req.body;
  ProductOrder.findOne({
    where: { orderId, productId }
  })
    .then(minus => {
      minus.decrement('quantity')
        .then(removed => res.status(201).json(removed))
        .catch(next)
    })
    .catch(next)
});


module.exports = router;
