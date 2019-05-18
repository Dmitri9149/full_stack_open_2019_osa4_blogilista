var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = blogs => {
  const reducer = (sum, blog) => {
    return sum + blog.likes
  }

  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = blogs => {
  const reducer = (sum, blog) => {
    if(sum.likes < blog.likes) {
      return blog
    } else {
      return sum
    }
  }

  return blogs.length === 0
    ? {}
    : {
      title:blogs.reduce(reducer, blogs[0]).title,
      author:blogs.reduce(reducer, blogs[0]).author,
      likes:blogs.reduce(reducer, blogs[0]).likes
    }

}

const mostBlogs = blogs => {
  const collectionA = _.groupBY(blogs, author)
  const collectionB = _.forEach(collectionA, totalLikes(value))
  const collectionC = _.sortBy(collectionC, [_.identity])
  return {
    author:collecionC[0].
  }
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
