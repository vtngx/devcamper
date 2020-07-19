const express = require('express');

const advancedResults = require('./../middleware/advancedResults');
const Courses = require('./../models/Course');

const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');

const router = express.Router({mergeParams: true});

router.route('/')
    .get(advancedResults(
        Courses,
        {
            path: 'bootcamp',
            select: 'name description'
        }
    ), getCourses)
    .post(createCourse);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;