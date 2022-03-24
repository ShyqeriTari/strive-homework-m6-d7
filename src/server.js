import express from "express"
import mongoose from "mongoose"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import blogsRouter from "./services/blogs/index.js"
import commentsRouter from "./services/blogs/comments/index.js"
import { badRequestHandler, notFoundHandler, genericErrorHandler } from "./errorHandlers.js"
import authorsRouter from "./services/authors/index.js"

const server = express()
const port = process.env.PORT

server.use(cors())
server.use(express.json())

server.use("/blogs", [blogsRouter, commentsRouter])
server.use("/authors", authorsRouter)



server.use(badRequestHandler)
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