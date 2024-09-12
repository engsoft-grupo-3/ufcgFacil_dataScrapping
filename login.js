const { select, input } = require('@inquirer/prompts')
const { JSDOM } = require('jsdom')

const baseUrl = "https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/Controlador"

//Credenciais de login
let loginInfo = {
  matricula:"",
  senha:""
}

let cookieAuth

let disciplinas = []

// Função para salvar HTML em arquivo no navegador
function salvarHTMLNavegador(html, nomeArquivo) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo || 'pagina.html';
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Função para salvar HTML em arquivo no Node.js
async function salvarHTMLNode(html, nomeArquivo) {
  const fs = require('fs').promises;
  
  try {
    await fs.writeFile(nomeArquivo || 'pagina.html', html);
    console.log(`Arquivo salvo como ${nomeArquivo}`);
  } catch (error) {
    console.error('Erro ao salvar o arquivo:', error);
  }
}

const login = async () => {
  loginInfo.matricula = await input({message: "Digite a matricula: "})
  loginInfo.senha = await input({message: "Digite a senha: "})

  if(loginInfo.matricula == "" || loginInfo.senha == ""){
    console.error("Nenhuma informação pode ser vazia")
    return
  }

}

const fazerLogin = async () => {
  const urlLogin = `${baseUrl}?command=AlunoLogin&login=${encodeURIComponent(loginInfo.matricula)}&senha=${encodeURIComponent(loginInfo.senha)}`

  try {
    const response = await fetch(urlLogin, {
      method: 'GET',
      credentials: 'include'
    })

    if(!response.ok){
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    cookieAuth = response.headers.get('Set-Cookie')

    if(!cookieAuth){
      throw new Error("Cookie de autenticação não encontrado")
    }

  } catch(error){
    console.error("Erro no login", error)
    throw error
  }
}

const capturarDisciplinas = async () => {
  const comando = `${baseUrl}?command=AlunoTurmasListar`

  try{
    const response = await fetch(comando, {
      method: 'GET',
      headers: {
        'Cookie': cookieAuth
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    return await response.text()
  }catch (error) {
    console.error("Erro na solicitação autenticada:", error)
    throw error
  }
}

const extraiDisciplinas = async (dadosHtml) => {
  const dom = new JSDOM(dadosHtml)
  const doc = dom.window.document
  const table = doc.querySelector('table')

  if(!table){
    console.error('Erro: Nenhuma tabela encontrada')
    return null;
  }

  const linhas = table.querySelectorAll('tr')

  linhas.forEach((linha) =>{
    const celulas = linha.querySelectorAll('td, th')
    const linhaDados = {};

    if(celulas[1].tagName === "TD"){
      linhaDados.codigo = celulas[1].textContent.trim()
      linhaDados.nome = celulas[2].textContent.trim()
      linhaDados.turma = celulas[3].textContent.trim()
      linhaDados.horario = celulas[4].textContent.trim()

      disciplinas.push(linhaDados)
    }

  });
}

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
            name: "Sair",
            value: "sair"
          }
        ]
      })

      switch(opcao){
        case "credenciais":
          await login()
        case "login":
          await fazerLogin()
          break
        case "disciplinas":
          const dadosHtml = await capturarDisciplinas()
          await extraiDisciplinas(dadosHtml)
          console.log(disciplinas)
          break
        case "sair":
          return
      }
    }
  }

 main()