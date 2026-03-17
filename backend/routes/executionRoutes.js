const express = require('express');
const router = express.Router();
const executionController = require('../controllers/ExecutionController');

router.post('/', executionController.createExecution);
router.get('/', executionController.getExecutions);
router.get('/:id', executionController.getExecution);
router.post('/:id/cancel', executionController.cancelExecution);
router.post('/:id/retry', executionController.retryExecution);

module.exports = router;
