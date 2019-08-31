const auth = require('../middleware/auth'); 
const express = require('express');
const multer = require('multer');
const router = new express.Router();
const sharp = require('sharp');
const Task = require('../models/task');

const upload = multer({
    limits: {
      fileSize: 1000000
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Please upload an image!'));
      }

      cb(undefined, true);
    }
})

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body, 
        owner: req.user._id,
    });

    try {
        await task.save();
        res.status(201).send(task);
    }catch(error){
        res.status(400).send(error);
    };
})

router.post('/tasks/:id', auth, upload.single('image'), async (req, res) => {

   /*  try { */
        //const task = await Task.findById(_id);
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id});

        if(!task) {
          return res.status(404).send();  
        }
        const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
        task.image = buffer;
        await task.save();
        res.send(task);
    }, (error, req, res, next) => {
        res.status(400).send({
            error: error.message
        })
        
  /*   } catch(error) {
        res.status(500).send(error);
    } */


})


// GET / tasks?completed=true
// GET / tasks?limit=10&skip=20
// GET / tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      /*   if (req.query.completed === 'true') {
            match.completed = true;
        } else {
            match.completed = false;
        } */
        match.completed = req.query.completed === 'true';
/*         match.completed = Boolean(req.query.completed);
        console.log(typeof match.completed, match.completed, typeof req.query.completed) */
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        //const tasks = await Task.find({ owner: req.user._id});
        // res.send(tasks);
        //await req.user.populate('tasks').execPopulate();
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }catch(error) {
        res.status(500).send(error);
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        //const task = await Task.findById(_id);
        const task = await Task.findOne({ _id, owner: req.user._id});

        if(!task) {
          return res.status(404).send();  
        }
        res.send(task);
    } catch(error) {
        res.status(500).send(error);
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(item => allowedUpdates.includes(item));

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'});
    }

    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        if (!task) {
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try{
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (error){
        res.status(500).send();
    }
})

router.delete('/tasksAll', auth, async (req, res) => {
    try{       
        await Task.deleteMany({ owner: req.user._id});
     
        res.send('You now have no tasks!');
    } catch (error){
        res.status(500).send();
    }
})

module.exports = router;
