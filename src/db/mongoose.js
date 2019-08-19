const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});

//mongoose converts Task to 'tasks' and stores the instances of this model in collection 'tasks'
 /* const Task = mongoose.model('Task', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },

});

const taskA = new Task({
    description: '   Learn Mongoose  ',
    completed: false
});

taskA.save().then(() => {
    console.log(taskA);
}).catch(error => {
    console.log('Error', error)
}); */