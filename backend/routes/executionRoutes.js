const express = require('express');
const router = express.Router({ mergeParams: true });
const ExecutionController = require('../controllers/ExecutionController');

// POST /workflows/:workflow_id/execute - create & execute workflow in one call
router.post('/', ExecutionController.createAndExecute);
router.post('/:id/run', ExecutionController.execute);

// GET /executions (via ?workflow_id query param)
router.get('/', ExecutionController.list);

// GET /executions/:id
router.get('/:id', ExecutionController.get);

// POST /executions/:id/cancel
router.post('/:id/cancel', ExecutionController.cancel);

// POST /executions/:id/retry
router.post('/:id/retry', ExecutionController.retry);

module.exports = router;