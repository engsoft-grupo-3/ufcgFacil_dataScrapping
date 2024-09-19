const { JSDOM } = require('jsdom')

const capturarDisciplinas = async (cookieAuth) => {
    const baseUrl = "https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/Controlador"
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
  
const extraiDisciplinas = async (cookieAuth) => {
    const dadosHtml = await capturarDisciplinas(cookieAuth)
    console.log(dadosHtml)

    const dom = new JSDOM(dadosHtml)
    const doc = dom.window.document
    const table = doc.querySelector('table')
  
    if(!table){
      console.error('Erro: Nenhuma tabela encontrada')
      return null;
    }

    let disciplinas = []
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

    return disciplinas
}
  
module.exports = extraiDisciplinas