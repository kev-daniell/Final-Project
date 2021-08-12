const mongoose = require('mongoose');
const Post = require('../models/posts')
const User = require('../models/user')

mongoose.connect('mongodb://localhost:27017/showApp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('connection open')
    }).catch(e => {
        console.log('an error occured', e)
    })

const seedPosts = [
    {
        author: '6114515d6d69a9fa796a6f02',
        title: 'AMC TO THE MOON',
        text: 'amc and gme r gonna go to the moon, diamond hands only baby',
    },
    {
        author: '6114515d6d69a9fa796a6f02',
        title: 'What is life',
        text: 'not sure what life is anymore',
        image: 'https://i.imgflip.com/2hrn59.jpg',
    },
    {
        author: '6114515d6d69a9fa796a6f02',
        title: 'Mai bad as hell',
        text: 'felt the need to remind everyone that mai is bad as hell',
        image: 'https://i.pinimg.com/originals/84/58/61/84586164248f9862b4117b2c2ab540aa.jpg'
    },
]

Post.insertMany(seedPosts)
    .then(res => {
        console.log(res)
    }).catch(e => {
        console.log(e)
    })
