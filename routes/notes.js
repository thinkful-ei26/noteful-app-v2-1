'use strict';

const express = require('express');
const knex = require('../knex');
// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
//const data = require('../db/notes');
//const simDB = require('../db/simDB');
//const notes = simDB.initialize(data);

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  knex
    .select('notes.id', 'title', 'content')
    .from('notes')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('content', 'like', `%${searchTerm}%`);//!!!!!! searches content
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
  // notes.filter(searchTerm)
  //   .then(list => {
  //     res.json(list);
  //   })
  //   .catch(err => {
  //     next(err);
  //   });


});

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .select('id', 'title', 'content')
    .from('notes')
    .where('id', `${id}`)
    .then(([note]) => {
      if (note) {
        res.json(note);
      }else{
        next();
      }
    })
    .catch(err => {
      next(err);
    });

  // notes.find(id)
  //   .then(item => {
  //     if (item) {
  //       res.json(item);
  //     } else {
  //       next();
  //     }
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .from('notes')
    .update(updateObj)
    .where('id', `${id}`)
    .returning('*')
    .then(([note]) => {
      if (note) {
        res.json(note);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });

  // notes.update(id, updateObj)
  //   .then(item => {
  //     if (item) {
  //       res.json(item);
  //     } else {
  //       next();
  //     }
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex
    .insert(newItem)
    .into('notes')
    .then(note => {
      if (note) {
        res.status(201).json(note);
      }
    })
    .catch(err => {
      next(err);
    });

  // notes.create(newItem)
  //   .then(item => {
  //     if (item) {
  //       res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
  //     }
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex
    .from('notes')
    .where('id', `${id}`)
    .del()
    
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });

  // notes.delete(id)
  //   .then(() => {
  //     res.sendStatus(204);
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

module.exports = router;
