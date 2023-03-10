const Article = require('../schemas/Article');
const errorWrapper = require('express-async-handler');
const CustomError = require('../helpers/error/CustomError');
const User = require('../schemas/User');


const createArticle = errorWrapper(async (req, res, next) => {
    const { title, description } = req.body;
    const user = await User.findById(req.user._id);

    const article = await Article.create({
        title,
        description,
        author: user._id
    });

    article.populate({ path: "author", select: "name" })
    user.articles.push(article);

    await article.save();
    await user.save();

    res
        .status(201)
        .json({
            success: true,
            message: "Article has been created successfully",
            data: article
        })
});


const getAllArticles = errorWrapper(async (req, res, next) => {
    const articles = await Article.find().populate({ path: "author", select: "name reputation" }).populate({ path: "comments", select: "description createdAt", populate: {path: "user", select: "name reputation"} });

    res
        .status(200)
        .json({
            success: true,
            data: articles
        })
});

const getArticleById = errorWrapper(async (req, res, next) => {
    res
        .status(200)
        .json({
            success: true,
            data: req.article
        })
});

const getArticlesOfOwner = errorWrapper(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('articles');

    res
        .status(200)
        .json({
            success: true,
            data: user.articles
        })
});

const editArticle = errorWrapper(async (req, res, next) => {
    const article = await Article.findByIdAndUpdate(req.article._id, req.body, {
        timestamps: true,
        new: true
    });


    res
        .status(200)
        .json({
            success: true,
            data: article
        });
});

const deleteArticle = errorWrapper(async (req, res, next) => {
    const article = await Article.findByIdAndRemove(req.article._id);
    const user = await User.findById(article.author._id);

    user.articles.remove(article);

    await user.save();

    res
        .status(200)
        .json({
            success: true,
            data: article
        });
});

const vote = errorWrapper(async (req, res, next) => {
    const article = await Article.findById(req.article._id);
    const article_owner = await User.findById(article.author._id);

    if (article.votes.includes(req.user._id)) {
        article.votes.remove(req.user._id);

        article_owner.reputation = article_owner.reputation - 5;

    } else {
        article.votes.push(req.user._id);

        article_owner.reputation = article_owner.reputation + 5;
    }



    await article_owner.save();

    await article.save();

    res
        .status(200)
        .json({
            success: true,
            data: article
        })
});

const searchArticle = errorWrapper(async (req, res, next) => {
    const { title } = req.query;

    const articles = await Article.find({ title: { $regex: title, $options: "i" } });

    res
        .status(200)
        .json({
            success: true,
            data: articles
        })

})



module.exports = { createArticle, getAllArticles, getArticleById, getArticlesOfOwner, editArticle, deleteArticle, vote, searchArticle };
