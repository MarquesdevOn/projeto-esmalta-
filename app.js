const express = require('express')
const app = express()
const port = 3000
const {engine} = require('express-handlebars')
const path = require('path')
const bodyParser = require('body-parser')

const admin = require('firebase-admin')

// inicializa o Firebase
//const serviceAccount = require('./firebase-credentials.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // url do meu banco de dados no firebase
    //databaseURL: 'https://esmalteria-9bb94-default-rtdb.firebaseio.com/'
})

// Inicializa a variável db com a referência ao banco de dados
const db = admin.database()

//configurando handlebars para usar
app.engine('handlebars', engine({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
app.set("views", "./views")
app.set('views', path.join(__dirname, 'views'));

//confi bodyPaerser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

// config arquivos estaticos
//app.use(express.static('public'))
// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// config página principal
app.get('/home', (req,res) => {
    res.render('home')
})

//config página Quem somos
app.get('/quemsomos', (req,res) => {
    res.render('quemsomos')
})
//config página agendamento
app.get('/formulario', (req,res) => {
    res.render('formulario')
})

//rota responsavel pelo envio de informaçoes ao banco de dados
app.post('/submit', (req, res) => {
    const nome = req.body.nome
    const telefone = req.body.telefone
    const servico = req.body.servico

    // valida os dados
    if (!nome || !telefone || !servico){
        return res.status(400).send('Campos nome e tipo são obrigatórios.')
    }

    // salva os dados na firebase
    db.ref('users/' + nome).set({ telefone, servico})
        .then(() => res.send('Dados salvos com sucesso no Firebase!'))
        .catch(error => res.status(500).send('Erro ao salvar os dados: ' + error.message))

    
})

//rota para user
app.get('/users', (req, res) => {
    db.ref("users")
        .once("value")
        .then((lista) => {
            const users = lista.val() || {};
            res.render("usuarios", users);
        })
        .catch((error) => 
            res.status(500).send("Erro ao buscar dados: " + error.message)
        )
});

// rota para remover um usuário pelo ID
app.post('/delete', (req, res) => {
    const id = req.body.id;

    //valida o id
    if (!id) {
        return res.status(400).send("ID é obrigatório para deletar um usuário");
    }

    //remove o registro do Firebase
    db.ref('users/' + id)
        .remove()
        .then(() => res.send("Usuário removido com sucesso do Firebase!"))
        .catch((error) =>
            res.status(500).send("Erro ao remover usuário: " + error.message)
        )
})





//rota principal
app.get('/', (req,res) => {
    res.send("Funcionando")
})

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})