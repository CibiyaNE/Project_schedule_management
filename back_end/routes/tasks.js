const router = require("express").Router()

let Task = require("../models/task.model");
let User = require("../models/user.model");
let Project = require("../models/project.model");
var authenticateToken = require("../middlewares/authentication")
router.route("/create").post(authenticateToken, (req, res) => {
    let parentProjectId = req.body.projectId;
    let description = req.body.description;
    let task = new Task({ description: description, projectId:parentProjectId });
    task.save().then(() => {
        User.findOne({ token: res.locals.token })
            .populate({ path: "projects", match: { _id: parentProjectId }, limit: 1 }).exec(function (err, user) {
                if (err) res.status(400).json("Error: " + err);
                else {
                    let project = user.projects[0];
                    project.tasks.push(task);
                    project.save().then(() => res.sendStatus(200))
                        .catch(() => res.status(400).json("Error: " + err));
                }
            });
    }).catch(() => res.status(400).json("Error: " + err));
});

router.route("/:id/complete").post(authenticateToken, (req, res) => {
    let taskID = req.params.id;
    Task.findById(taskID, function (err, task) {
        task.completeTask()
        task.save().then(()=>res.json(task));
    
    });
});

router.route("/:id/delete").delete(authenticateToken, (req, res) => {
    let taskID = req.params.id;
    Task.deleteOne({ _id: taskID }, function (err) {
        if (err)  res.status(400).json("Error: " + err);
        else res.sendStatus(200)
      });
});


module.exports = router