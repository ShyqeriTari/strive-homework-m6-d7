import express from "express"
import createError from "http-errors"
import blogsModel from "../model.js"
import q2m from "query-to-mongo"

const commentsRouter = express.Router()



commentsRouter.post("/:id", async (req, res, next) => {
    try {
        const commentedBlog = await blogsModel.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: req.body } },
            { new: true, runValidators: true }
        )
        res.status(201).send({ commentedBlog })
    } catch (error) {
        next(error)
    }
})

commentsRouter.get("/:id/comments", async (req, res, next) => {
    try {
        const blogs = await blogsModel.findById(req.params.id).populate({ path: "comments", populate: { path: "author", select: "name avatar" }})
        res.send(blogs.comments)
    } catch (error) {
        next(error)
    }
})

commentsRouter.get("/:id/comments/:commentId", async (req, res, next) => {
    try {
        const blog = await blogsModel.findById(req.params.id).populate({ path: "comments", populate: { path: "author", select: "name avatar" }})
        const comment = blog.comments.find(comment => comment._id.toString() === req.params.commentId)
        if (comment) {
            res.send(comment)
        } else {
            next(createError(404, `Blog with id ${req.params.id} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

commentsRouter.put("/:id/comment/:commentId", async (req, res, next) => {
    try {
        const blog = await blogsModel.findById(req.params.id)

        const index = blog.comments.findIndex(comment => comment._id.toString() === req.params.commentId)

        if (index !== -1) {
            blog.comments[index] = { ...blog.comments[index].toObject(), ...req.body }
            await blog.save()
            res.send(blog.comments[index])
        } else {
            next(createError(404, `Blog with id ${req.params.id} not found!`))
        }
    } catch (error) {
        next(error)
    }
})

commentsRouter.delete("/:id/comment/:commentId", async (req, res, next) => {
    try {
        const modifiedBlog = await blogsModel.findByIdAndUpdate(
            req.params.id, // WHO
            { $pull: { comments: { _id: req.params.commentId } } }, // HOW
            { new: true }
        )
        if (modifiedBlog) {
            res.send(modifiedBlog)
        } else {
            next(createError(404, `Blog with id ${req.params.id} not found!`))
        }
    } catch (error) {
        next(error)
    }
})


export default commentsRouter