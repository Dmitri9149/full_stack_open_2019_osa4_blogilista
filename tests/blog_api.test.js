const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are three blogss', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(3)
})

test('the first blog is of Edsger W. Dijkstra', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].author).toBe('Edsger W. Dijkstra')
})

afterAll(() => {
  mongoose.connection.close()
})