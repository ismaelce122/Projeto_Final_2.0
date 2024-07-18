const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const multer = require('multer')
const mysql = require('mysql')
const port = 3000

const db = mysql.createConnection(
    {
        hostname: 'localhost',
        user: 'root',
        password: '',
        database: ''
    }
)
db.connect((err) => {
    if(err) {
        throw err
    }
    console.log('MySQL Conectado...')
})

app.use(bodyParser.urlencoded({extended: false}))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))

const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            cb(null, 'public/images/')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname)
        }
    }
)
const upload = multer({storage: storage})

app.get('/add_product', (req, res) => {
    res.render('add_product')
})

app.post('/add_product', upload.single('image'), (req, res) => {
    const {name, quantity, price} = req.body
    const image = req.file ? req.file.filename : null
    if(!name || !quantity || !price || !image) {
        return res.status(400).send('Todos os Campos são Obrigatórios!!!')
    }
    let sql = 'INSERT INTO products (nome, quantity, price, image) VALUES (?, ?, ?, ?)'
    db.query(sql, [name, quantity, price, image], (err, result) => {
        if(err) {
            throw err
        }
        console.log('Produto Adicionado!!!')
        res.redirect('/produts')
    })
})

app.get('/products', (req, res) => {
    let sql = 'SELECT * FROM products'
    db.query(sql, (err, result) => {
        if(err) {
            throw err
        }
        res.render('list_products', {products: result})
    })
})

app.post('/edit_product/:id', upload.single('image'), (req, res) => {
    const {id} = req.params
    const {name, quantity, price} = req.body
    const image = req.file ? req.file.filename : req.body.currentImage

    let sql = 'UPDATE products SET nome = ?, quantity = ?, price = ?, image = ? WHERE id = ?'
    db.query(sql, [name, quantity, price, image, id], (err, result) => {
        if(err) {
            throw err
        }
        console.log('Produto Atualizado!!!')
        res.redirect('/products')
    })
})

app.get('edit_product/:id', (req, res) => {
    const {id} = req.params
    let sql = 'SELECT * FROM products WHERE id = ?'
    db.query(sql, [id], (err, result) => {
        if(err) {
            throw err
        }
        res.render('edit_product_modal', {produt: result[0]})
    })
})

app.listen(port, () => {
    console.log('Servidor Conectado...')
})