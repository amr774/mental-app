const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/PostController');
const verifyToken = require('../middlewares/authMiddleware');

router.get('/posts',                              verifyToken, ctrl.getAll.bind(ctrl));
router.get('/posts/:id',                          verifyToken, ctrl.getOne.bind(ctrl));
router.post('/posts',                             verifyToken, ctrl.create.bind(ctrl));
router.delete('/posts/:id',                       verifyToken, ctrl.delete.bind(ctrl));
router.post('/posts/:id/like',                    verifyToken, ctrl.toggleLike.bind(ctrl));
router.post('/posts/:id/comments',                verifyToken, ctrl.addComment.bind(ctrl));
router.delete('/posts/:id/comments/:commentId',   verifyToken, ctrl.deleteComment.bind(ctrl));

module.exports = router;
