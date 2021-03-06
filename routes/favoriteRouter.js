const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOption, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorites) => {
        if(favorites) {
            for(var i=0;i<req.body.length;i++) {
                if(favorites.dishes.indexOf(req.body[i]._id) === -1) {
                    favorites.dishes.push(req.body[i]._id);
                }
            }
            favorites.save()
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
        }
        else {
            Favorites.create({ "user": req.user._id, "dishes": req.body })
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('CVontent-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ "user": req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err))
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOption, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if(favorite) {
            if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'applucation/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'applucation/json');
                res.json(favorite);
            }
        }
        else {
            Favorites.create({ "user": req.user._id, "dishes": [req.params.dishId] })
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.delete(cors.corsWithOption, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorite) => {
        if(favorite) {
            index = favorite.dishes.indexOf(req.params.dishId);
            if(index >= 0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found!');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found!');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;