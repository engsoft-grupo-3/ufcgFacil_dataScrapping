//const { JSDOM } = require('jsdom')
const {Parser} = require('htmlparser2')

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
    try {
      const dadosHtml = await capturarDisciplinas(cookieAuth);
      
      let disciplinas = [];
      let currentDisciplina = {};
      let isInTable = false;
      let columnIndex = 0;
      
      const parser = new Parser(
        {
          onopentag(name, attributes) {
            if (name === 'table') {
              isInTable = true;
            } else if (isInTable && (name === 'td' || name === 'th')) {
              columnIndex++;
            }
          },
          ontext(text) {
            if (isInTable && columnIndex > 0) {
              const trimmedText = text.trim();
              if (trimmedText) {
                switch (columnIndex) {
                  case 2:
                    currentDisciplina.codigo = trimmedText;
                    break;
                  case 3:
                    currentDisciplina.nome = trimmedText;
                    break;
                  case 4:
                    currentDisciplina.turma = trimmedText;
                    break;
                  case 5:
                    currentDisciplina.horario = trimmedText;
                    break;
                }
              }
            }
          },
          onclosetag(tagname) {
            if (tagname === 'table') {
              isInTable = false;
            } else if (tagname === 'tr' && isInTable) {
              if (Object.keys(currentDisciplina).length === 4) {
                disciplinas.push({ ...currentDisciplina });
                currentDisciplina = {};
              }
              columnIndex = 0;
            }
          }
        },
        { decodeEntities: true }
      );
  
      parser.write(dadosHtml);
      parser.end();
  
      return disciplinas;
    } catch (error) {
      console.error('Erro ao extrair disciplinas:', error);
      return null;
    }
  };

/*
const extraiDisciplinas = async (cookieAuth) => {
    const dadosHtml = await capturarDisciplinas(cookieAuth)

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
}*/
  
module.exports = extraiDisciplinas