var express = require('express');
var router = express.Router();

var productList = [
  {
    id: '123',
    name: 'My fantastic product',
    description: 'My super awesome product with lots of features',
    price: 500
  }
];

router.get('/products', function(req, res) {
  res.json(productList);
});

module.exports = router;