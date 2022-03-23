import express from "express"
import createError from "http-errors"
import blogsModel from "./model.js"
import q2m from "query-to-mongo"

const blogsRouter = express.Router()

blogsRouter.post("/", async (req, res, next) => {
  try {
    const newBlog = new blogsModel(req.body) 

    const { _id } = await newBlog.save() 
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query)
    const total = await blogsModel.countDocuments(mongoQuery.criteria)
    const blogs = await blogsModel.find(mongoQuery.criteria, mongoQuery.options.fields)
      .limit(mongoQuery.options.limit || 10)
      .skip(mongoQuery.options.skip || 0)
      .sort(mongoQuery.options.sort) 
    res.send({
      links: mongoQuery.links(`${process.env.API_URL}/blogs`, total),
      total,
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      blogs,
    })
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id", async (req, res, next) => {
  try {
    const blog = await blogsModel.findById(req.params.id)
    if (blog) {
      res.send(blog)
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedBlog = await blogsModel.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true, runValidators: true } )

    if (updatedBlog) {
      res.send(updatedBlog)
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedBlog = await blogsModel.findByIdAndDelete(req.params.id)
    if (deletedBlog) {
      res.status(204).send()
    } else {
      next(createError(404, `Blog with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

blogsRouter.post("/:id", async (req, res, next) => {
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

blogsRouter.get("/:id/comments", async (req, res, next) => {
  try {
    const blogs = await blogsModel.findById(req.params.id)
    res.send(blogs.comments)
  } catch (error) {
    next(error)
  }
})

blogsRouter.get("/:id/comments/:commentId", async (req, res, next) => {
  try {
    const blog = await blogsModel.findById(req.params.id)
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

blogsRouter.put("/:id/comment/:commentId", async (req, res, next) => {
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

blogsRouter.delete("/:id/comment/:commentId", async (req, res, next) => {
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



export default blogsRouter