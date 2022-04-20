import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import blogsRouter from "./services/blogs/index.js"
import commentsRouter from "./services/blogs/comments/index.js"
import { badRequestHandler, unauthorizedHandler, forbiddenHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"
import authorsRouter from "./services/authors/index.js"
import likesRouter from "./services/blogs/likes/index.js"
import usersRouter from "./services/users/index.js"

const server = express()
const port = process.env.PORT

server.use(cors())
server.use(express.json())

server.use("/blogs", [blogsRouter, commentsRouter, likesRouter])
server.use("/authors", authorsRouter)
server.use("/users", usersRouter)



server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO)

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!")

  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server running on port ${port}`)
  })
})