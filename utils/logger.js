const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(...params)
  }
}

const error = (...params) => {
  console.error(...params)
}

const test = () => {
  console.log('program start runnung')
}

module.exports = {
  info, error, test
}