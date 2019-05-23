const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

describe('when there sre initially some blogs saved', () => {

beforeEach(async () => {
  await Blog.remove({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
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

})


describe('addition of a new note', () => {
test('a valid blog can be added ', async () => {

  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }

  const blogsBefore = await helper.blogsInDb()
  console.log('blogsBefore = ', blogsBefore)
  const lengthBefore = blogsBefore.length

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  const lengthAtEnd = blogsAtEnd.length
  expect(lengthAtEnd).toBe(lengthBefore + 1)

  const titles = blogsAtEnd.map(n => n.title)
  expect(titles).toContain(
    'Type wars'
  )
})

test('a blog with undefined likes can be added with likes set to 0 ', async () => {

  const dummyBlog = {
    title: 'Just for testing',
    author: 'Dmitri',
    url: 'http://dummy.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
  }

  console.log('LIKES !!!!!!!!!!!',  dummyBlog.likes)

  const blogsBefore = await helper.blogsInDb()
  console.log('blogsBefore = ', blogsBefore)
  const lengthBefore = blogsBefore.length

  await api
    .post('/api/blogs')
    .send(dummyBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAfter = await helper.blogsInDb()
  console.log('blogsAfter = ', blogsAfter)
  const lengthAfter = blogsAfter.length
  console.log(lengthAfter)
  expect(lengthAfter).toBe(lengthBefore + 1)

  const likes = blogsAfter.map(n => n.likes)
  expect(likes[lengthAfter - 1]).toBe(0)
})

test('blog without title and url is not added', async () => {

  const newBlog = {
    author: 'Tutti',
    likes:1000000
  }
  console.log("Without Titler and Url !!!!!!!", newBlog.title, newBlog.url)

  const blogsBefore = await helper.blogsInDb()
  const lengthBefore = blogsBefore.length
  console.log('lengthBefore = ', lengthBefore)

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAfter = await helper.blogsInDb()
  console.log('blogsAfter (title)= ', blogsAfter)
  const lengthAfter = blogsAfter.length
  console.log('lengthAfter = ', lengthAfter)

  expect(lengthAfter).toBe(lengthBefore)
})

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
      blogsAtStart.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('viewing a specifin blog', () => {

  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    console.log(validNonexistingId)

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)

  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    const aw = await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
    console.log('Awwwwa = ', aw.body)
    console.log(aw.error)




  })
})




afterAll(() => {
  mongoose.connection.close()
})