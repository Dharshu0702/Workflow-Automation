const express = require('express');
const router = express.Router({ mergeParams: true });
const RuleController = require('../controllers/RuleController');

router.post('/', RuleController.create);
router.get('/', RuleController.list);
router.get('/:id', RuleController.get);
router.put('/:id', RuleController.update);
router.delete('/:id', RuleController.delete);

module.exports = router;