import mongoose from "mongoose"

const { Schema, model } = mongoose

const blogSchema = new Schema(
    {
        category: { type: String, required: true },
        title: { type: String, required: true },
        cover: { type: String, required: true },
        readTime: {
            value: { type: Number, required: true },
            unit: {type: String, required: true }
                },
        author: { type: Schema.Types.ObjectId, ref: "author" },
        content:{ type: String, required: true },
        comments:[{
            text: {type: String},
            author: { type: Schema.Types.ObjectId, ref: "author" }
        }],
        likes: [{ type: Schema.Types.ObjectId, ref: "author" }],
    },
    {
        timestamps: true,
    }
)

blogSchema.static("blogWithAuthor", async function (mongoQuery) {

    const total = await this.countDocuments(mongoQuery.criteria)
    const blogs = await this.find(mongoQuery.criteria, mongoQuery.options.fields)
      .limit(mongoQuery.options.limit || 10)
      .skip(mongoQuery.options.skip || 0)
      .sort(mongoQuery.options.sort)
      .populate({ path: "author", select: "name avatar" })
      .populate({ path: "comments", populate: { path: "author", select: "name avatar" }})
      .populate({ path: "likes", select: "name" })
  
    return { total, blogs }
  })

export default model("blog", blogSchema)