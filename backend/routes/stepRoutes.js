const express = require('express');
const router = express.Router({ mergeParams: true });
const stepController = require('../controllers/StepController');

router.post('/', stepController.createStep);
router.get('/', stepController.getSteps);
router.get('/:id', stepController.getStep);
router.put('/:id', stepController.updateStep);
router.delete('/:id', stepController.deleteStep);

module.exports = router;
