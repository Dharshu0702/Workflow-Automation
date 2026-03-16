const express = require('express');
const router = express.Router();
const WorkflowController = require('../controllers/WorkflowController');

router.post('/', WorkflowController.create);
router.get('/', WorkflowController.list);
router.get('/:id', WorkflowController.get);
router.put('/:id', WorkflowController.update);
router.delete('/:id', WorkflowController.delete);

module.exports = router;