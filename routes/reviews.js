const express = require('express');

const advancedResults = require('./../middleware/advancedResults');
const Review = require('./../models/Review');

const {
    getReviews,
    getReview,
    addReview,
    editReview,
    deleteReview
} = require('../controllers/reviews');

const router = express.Router({mergeParams: true});

const {
    protect,
    authorize
} = require('./../middleware/auth');

router.route('/')
    .get(advancedResults(
        Review,
        {
            path: 'bootcamp',
            select: 'name description'
        }
    ), getReviews)
    .post(protect, authorize('user', 'admin'), addReview);

router.route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), editReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;