const controller = {}
const { where } = require('sequelize');
const models = require('../models');

controller.home = async (req, res, next) => {
    const category = req.query.category || '';
    const tag = req.query.tag || '';
    const keyword = req.query.keyword || '';
    const page = isNaN(req.query.page) ? 1 : Math.max(1,parseInt(req.query.page));

    const sequelize = require('sequelize');
    const Op = sequelize.Op;

    const Blogs = models.Blog;
    const options = {
        attributes: ['id', 'title', 'imagePath', 'summary'],
        where: {

        },
    }

    if (category.trim() != '') {
        const category_id = await models.Category.findOne({
            attributes: ['id'],
            where: {
                name: category
            }
        });
        if (category_id == null) {
            next();
        } else {
            options.where.categoryId = category_id.id;
        }
    }

    if (tag.trim() != '') {
        const tag_id = await models.Tag.findOne({
            attributes: ['id'],
            where: {
                name: tag
            }
        });
        const blog_ids = await models.BlogTag.findAll({
            attributes: ['blogId'],
            where: {
                tagId: tag_id.id
            }
        });
        if (blog_ids.length == null) {
            next();
        } else {
            options.where.id = blog_ids[0].blogId;
        }
    }

    if (keyword.trim() !== ''){
        options.where.title = {
            [Op.iLike]: `%${keyword}%`
        }
    }

    const limit = 4;
    const offset = (page - 1) * limit;
    options.limit = limit;
    options.offset = offset;

    let { rows, count } = await Blogs.findAndCountAll(options);

    res.locals.pagination = {
        page: page,
        limit: limit,
        totalRows: count,
        queryParams: req.query
    }

    if (rows == null) {
        next();
    } else {
        res.locals.blogs = rows;
        res.render('index');
    }
};

controller.blog_detail = async (req, res, next) => { 
    const id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
    const Blog = models.Blog;
    const User = models.User;
    res.locals.blog = null;
    res.locals.author = null;

    let blog = await Blog.findOne({
        attributes:['id', 'title', 'imagePath', 'description', 'authorId'],
        where: {
            id: id
        }
    });

    if (blog === null){
        next();
        return;
    }

    let author = await User.findOne({
        attributes:['firstName', 'lastName', 'imagePath', "isAdmin"],
        where: {
            id: blog.authorId
        }
    });

    if (author === null){
        next();
    }
    else{
        res.locals.blog = blog;
        res.locals.author = author;
        if (author.isAdmin){
            res.locals.isAdmin = "Admin";   
        } else {
            res.locals.isAdmin = "User";
        }
        res.render('detail');     
    }
};

module.exports = controller;