const { JSDOM } = require('jsdom')

const capturarNotas = async (disciplina, cookieAuth) => {
    const baseUrl = "https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/Controlador"
    const comando = `${baseUrl}?command=AlunoTurmaNotas&codigo=${disciplina.codigo}&turma=${disciplina.turma}&periodo=2024.1`

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

const extraiNotas = async (disciplina, cookieAuth) => {
    const dadosHtml = await capturarNotas(disciplina, cookieAuth)

    //console.log(dadosHtml)

    const dom = new JSDOM(dadosHtml)
    const doc = dom.window.document
    const table = doc.querySelector('table')

    if(!table){
        console.error('Erro: Nenhuma tabela encontrada')
        return null;
    }
    
    let notas = {}

    const headers = table.getElementsByTagName('th')
    const values = table.getElementsByTagName('td')

    for(let i = 3; i < headers.length - 1; i++){
        let key = headers[i].childNodes[0].nodeValue.trim().replace(/\s+/g, '').toLowerCase()
        let value = values[i].textContent.replace(',', '.')

        if (value === '') {
            value = '0.0';
        }

        notas[key] = value
    }

    return notas

}

module.exports = extraiNotas
