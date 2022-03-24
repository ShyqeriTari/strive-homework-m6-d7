import express from "express"
import createError from "http-errors"
import blogsModel from "../model.js"
import q2m from "query-to-mongo"

const likesRouter = express.Router()



likesRouter.post("/:id/like", async (req, res, next) => {
    try {
        const likedBlog = await blogsModel.findByIdAndUpdate(
            req.params.id,
            { $push: { likes: req.body } },
            { new: true, runValidators: true }
        )
        res.status(201).send({ likedBlog })
    } catch (error) {
        next(error)
    }
})


likesRouter.delete("/:id/like/:likeId", async (req, res, next) => {
    try {
        const modifiedBlog = await blogsModel.findByIdAndUpdate(
            req.params.id, 
            { $pull: { likes: req.params.likeId  } }, 
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


export default likesRouter