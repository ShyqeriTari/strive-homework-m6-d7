import express from "express"
import createError from "http-errors"
import blogsModel from "./model.js"

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
    const blogs = await blogsModel.find()
    res.send(blogs)
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

export default blogsRouter