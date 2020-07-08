//Get all bootcamps - GET /api/v1/bootcamps - Public
exports.getBootcamps = function (req, res, next) {
    res
        .status(200)
        .json({success: true, msg: 'Show all bootcamps'});
};

//Get a bootcamp by ID - GET /api/v1/bootcamps/:id - Public
exports.getBootcamp = function (req, res, next) {
    res
        .status(200)
        .json({ success: true, msg: 'Display bootcamp ' + req.params.id });
};

//Create a new bootcamp - POST /api/v1/bootcamps - Private
exports.createBootcamp = function (req, res, next) {
    res
        .status(200)
        .json({ success: true, msg: 'Create new bootcamp' });
};

//Update a bootcamp - PUT /api/v1/bootcamps/:id - Private
exports.updateBootcamp = function (req, res, next) {
    res
        .status(200)
        .json({ success: true, msg: 'Update bootcamp ' + req.params.id });
};

//Delete a bootcamp - DELETE /api/v1/bootcamps/:id - Private
exports.deleteBootcamp = function (req, res, next) {
    res
        .status(200)
        .json({ success: true, msg: 'Delete bootcamp ' + req.params.id });
};

