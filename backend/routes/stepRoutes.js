const express = require('express');
const router = express.Router({ mergeParams: true });
const StepController = require('../controllers/StepController');

router.post('/', StepController.create);
router.get('/', StepController.list);
router.get('/:id', StepController.get);
router.put('/:id', StepController.update);
router.delete('/:id', StepController.delete);

module.exports = router;