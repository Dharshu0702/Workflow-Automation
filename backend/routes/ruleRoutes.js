const express = require('express');
const router = express.Router({ mergeParams: true });
const ruleController = require('../controllers/RuleController');

router.post('/', ruleController.createRule);
router.get('/', ruleController.getRules);
router.get('/:id', ruleController.getRule);
router.put('/:id', ruleController.updateRule);
router.delete('/:id', ruleController.deleteRule);

module.exports = router;
