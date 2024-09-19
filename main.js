const { select, input } = require('@inquirer/prompts')

const login = require('./modules/login')
const extraiDisciplinas = require('./modules/disciplinas')
const extraiNotas = require('./modules/notas')

let loginInfo = {
    matricula:"",
    senha:""
}

let disciplina =   {
    codigo: '1411189',
    nome: 'COMPILADORES',
    turma: '01',
    horario: '2 08:00-10:00 (CAA307)\n4 10:00-12:00 (CAA307)'
}

let cookieAuth = `JSESSIONID=009827F7845FC9CFA933AC479B7A9F2A; Path=/ControleAcademicoOnline; Secure; HttpOnly`
let disciplinas = []
let notas = {}
const main = async() => {

    while(true){
      const opcao = await select({
        message: "Menu >",
        choices: [
          {
            name: "Inserir credenciais",
            value: "credenciais"
          },
          {
            name: "Login",
            value: "login"
          },
          {
            name: "Disciplinas Matriculadas",
            value: "disciplinas"
          },
          {
            name: "Notas",
            value: "notas"
          },
          {
            name: "Sair",
            value: "sair"
          }
        ]
      })

      switch(opcao){
        case "credenciais":
          await login()
        case "login":
          cookieAuth = await login("122111076", "L34ndr00")
          console.log(cookieAuth)
          break
        case "disciplinas":
          disciplinas = await extraiDisciplinas(cookieAuth)
          console.log(disciplinas)
          break
        case "notas":
          //console.log(disciplina.codigo,disciplina.turma)
          notas = await extraiNotas(disciplina, cookieAuth)
          console.log(notas)
          break
        case "sair":
          return
      }
    }
  }

 main()