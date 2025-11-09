const router = require('express').Router();
const contatoController = require('../controllers/contatoController');

router.post('/', contatoController.send);

module.exports = router;
