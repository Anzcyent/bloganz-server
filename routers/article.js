const express = require('express')
const router = express.Router();
const { createArticle, getAllArticles, getArticleById, getArticlesOfOwner, editArticle } = require('../controllers/article');
const { getAccessToRoute } = require('../middlewares/auth/auth');
const { checkArticleExists } = require('../middlewares/db/checkExist');

router.post('/create', getAccessToRoute, createArticle);
router.get('/', getAllArticles);
router.get('/article/:id', getArticleById);
router.get('/articles-of-owner', getAccessToRoute, getArticlesOfOwner);
router.put('/edit-article/:id', [getAccessToRoute, checkArticleExists], editArticle)

module.exports = router; 