import express from "express"
import createError from "http-errors"
import authorsModel from "./model.js"
import q2m from "query-to-mongo"

const authorsRouter = express.Router()

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new authorsModel(req.body) 

    const { _id } = await newAuthor.save() 
    res.status(201).send({ _id })
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await authorsModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:id", async (req, res, next) => {
  try {
    const author = await authorsModel.findById(req.params.id)
    if (author) {
      res.send(author)
    } else {
      next(createError(404, `Author with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedAuthor = await authorsModel.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true, runValidators: true } )

    if (updatedAuthor) {
      res.send(updatedAuthor)
    } else {
      next(createError(404, `Author with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedAuthor = await authorsModel.findByIdAndDelete(req.params.id)
    if (deletedAuthor) {
      res.status(204).send()
    } else {
      next(createError(404, `Author with id ${req.params.id} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

export default authorsRouter