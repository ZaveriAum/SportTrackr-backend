const app = require('./app')
const SERVER_PORT = process.env.SERVER_PORT || 5000

// home route
app.get('/', (req, res) => {
    res.send("Hello Sport Trackr")
})


// listing at port 5000
app.listen(SERVER_PORT, () => {
    console.log(`Server listining to http://localhost:${SERVER_PORT}`)
})
