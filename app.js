const express = require('express');
const app = express();
app.use(express.json());
const { models: { User, Note } } = require('./db');
const path = require('path');
const e = require('express');

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

const requireToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = await User.byToken(token);
    req.user = user;
    next();
  } catch(error) {
    next(error);
  }
};

app.post('/api/auth', async(req, res, next)=> {
  try {
    res.send({ token: await User.authenticate(req.body)});
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth', requireToken, async(req, res, next)=> {
  try {
    res.send(req.user);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/notes', requireToken, async(req, res, next)=> {
  try {
    const reqId = parseInt(req.params.id)
    if(req.user.id === reqId) {
    const notes = await Note.findAll({
      where: {
        userId: req.user.id
      }
    })
    res.send(notes)}
    else {
      const error = new Error('no match')
    }
  } catch(error) {
    next(error)
  }
})

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;