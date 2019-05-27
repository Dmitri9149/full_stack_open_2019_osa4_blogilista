const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs.map(blog => blog.toJSON()))

})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  const user = await User.findById(body.userId)

  const blog = new Blog({
    title:body.title,
    author:body.author,
    url:body.url,
    likes:body.likes === undefined ? 0 : body.likes,
    user: user._id
  })
  try {

    if (blog.title === undefined && blog.url === undefined) {
      await response.status(400).end()
    } else {
      const savedBlog = await blog.save()
      user.blogs = user.blogs.concat(savedBlog._id)
      await user.save()
      response.json(savedBlog.toJSON())
    }
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if(blog) {
      response.json(blog.toJSON())
    } else {
      response.status(404).end()
    }
  } catch(exeption) {
    next(exeption)
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const body = request.body

    const blog = {
      title:body.title,
      url:body.url,
      author:body.author,
      likes:body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(updatedBlog.toJSON())
  } catch(exception) {
    next(exception)
  }
})


module.exports = blogsRouter