const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')



beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[2])
  await blogObject.save()
})

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogss', async () => {
  const response = await api.get('/api/blogs')

  const authors = response.body.map(r => r.author)

  expect(authors).toContain(
    'Edsger W. Dijkstra'
  )
})

test('identification field has name as id ', async () => {
  const blogs = await Blog.find({})
  const firstBlogId = blogs.map(r => r.toJSON())[0].id

  expect(firstBlogId).toBeDefined()

})

test('a valid blog can be added ', async () => {

  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  const lengthAtEnd = blogsAtEnd.length
  expect(lengthAtEnd).toBe(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(n => n.title)
  expect(titles).toContain(
    'Type wars'
  )
})

test('a blog with undefined likes can be added with likes set to 0 ', async () => {

  const dummyBlog = {
    title: 'Just for testing',
    author: 'Dmitri',
    url: 'http://dummy.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 0
  }
  await api
    .post('/api/blogs')
    .send(dummyBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  const lengthAtEnd = blogsAtEnd.length
  expect(lengthAtEnd).toBe(helper.initialBlogs.length + 1)

  const likes = blogsAtEnd.map(n => n.likes)
  expect(likes[lengthAtEnd - 1]).toBe(0)
})

test('blog without title and url is not added', async () => {

  const newBlog = {
    author: 'Tutti',
    likes:1000000
  }


  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(helper.initialBlogs.length)
})

describe('deletion of a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd.length).toBe(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})


afterAll(() => {
  mongoose.connection.close()
})