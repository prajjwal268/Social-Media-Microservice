const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors')
const axios = require('axios');
const { randomBytes } = require('crypto');
const { stat } = require('fs');
const app = express();
app.use(cors())
app.use(bodyparser.json());

const commentsByPostId = {}
//comes here when there is a get request
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    const commentId = randomBytes(4).toString('hex');

    const { content } = req.body;
    const comments = commentsByPostId[req.params.id] || [];//params.id to check if it is in url
    comments.push({ id: commentId, content, status: 'pending' });
    commentsByPostId[req.params.id] = comments;

    await axios.post('http://event-bus-srv:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending',
        }
    })
    res.status(201).send(comments);
});
//Post request handler
app.post('/events', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find((c) => {
            return c.id == id
        });
        comment.status = status;

        await axios.post('http://event-bus-srv:4005/events', {
            type: 'CommentUpdated', data: {
                id,
                postId,
                status,
                content
            }
        })
    }
    res.send({});
});
app.listen(4001, () => {
    console.log('listening on 4001');
})
