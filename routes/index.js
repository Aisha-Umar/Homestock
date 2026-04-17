const express = require('express')
const router = express.Router()
const controller = require('../controllers/controllers')
const { ensureAuthenticated } = require('../middleware/authMiddleware')
const { ensureApiAuth } = require('../middleware/authMiddleware')

// Page route
router.get('/', controller.getLanding)                                                                         
router.delete('/deleteItem', ensureAuthenticated, controller.deleteItem)
router.put('/editItem', ensureAuthenticated, controller.editItem)
router.put('/saveOrder', ensureAuthenticated, controller.saveOrder)
router.get('/getPantryItems', ensureAuthenticated, controller.getPantryItems)
router.post('/moveToPantry', ensureAuthenticated, controller.moveToPantry)
router.post('/moveToFinished', ensureAuthenticated, controller.moveToFinished)
router.post('/moveToGrocery', ensureAuthenticated, controller.moveToGrocery)
router.get('/dashboard', ensureAuthenticated, controller.getDashboard)
router.get('/pantry', ensureAuthenticated, controller.getPantry)
router.get('/finished', ensureAuthenticated, controller.getFinished)
router.post('/saveItem', ensureAuthenticated, controller.saveItem)
router.get('/getAiRecipes', ensureAuthenticated, controller.getAiRecipes)
router.get('/getItemsRunningLow', ensureAuthenticated, controller.getItemsRunningLow)

module.exports = router