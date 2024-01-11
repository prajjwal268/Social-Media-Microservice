const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const app = express();
const axios = require('axios');
app.use(bodyParser.json());
app.use(cors());
const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});
app.post('/posts/create', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;
    posts[id] = {
        id,
        title
    };
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id,
            title
        }
    });
    res.status(201).send(posts[id]);//201 created, 204 no content

});
app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);
    res.send({});
});
app.listen(4000, () => {
    console.log('version 55');
    console.log('Listening on 4000');
});