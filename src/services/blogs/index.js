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
    const { total, blogs } = await blogsModel.blogWithAuthor(mongoQuery)
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
      

      const blog = await blogsModel.findById(req.params.id).populate({ path: "author", select: "name avatar" }).populate({ path: "comments", populate: { path: "author", select: "name avatar" }}).populate({ path: "likes", select: "name" })

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