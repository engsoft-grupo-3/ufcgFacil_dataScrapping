const { load } = require('cheerio')

const capturarPerfil = async (cookieAuth) => {
  const baseUrl = "https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/Controlador"
  const comando = `${baseUrl}?command=AlunoHistorico`

  try {
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
  } catch (error) {
    console.error("Erro na solicitação autenticada:", error)
    throw error
  }
}

const alunoPerfil = async (cookieAuth) => {
  const dadosHtml = await capturarPerfil(cookieAuth)

  const extractInfo = (regex) => {
    const match = dadosHtml.match(regex);
    return match ? match[1].trim() : null;
  };

  const extractExecucaoInfo = () => {
    const regex = /<th\s+scope="row">\s*Execu..o\s+curricular\s*<\/th>\s*<td\s+class="text-center">\s*(\d+)\s*<\/td>\s*<td\s+class="text-center">\s*(\d+)\s*\(\s*(\d+)%\s*\)\s*<\/td>\s*<td\s+class="text-center">\s*(\d+)\s*<\/td>\s*<td\s+class="text-center">\s*(\d+)\s*\(\s*(\d+)%\s*\)\s*<\/td>\s*<td\s+class="text-center">\s*(\d+)\s*<\/td>\s*<td\s+class="text-center">\s*(\d+)\s*\(\s*(\d+)%\s*\)\s*<\/td>/;

    const match = dadosHtml.match(regex);

    if (match) {
      const execucaoCurricular = {
        cargaHoraria: {
          minimo: match[1],
          integralizado: match[2],
          percentual: match[3]
        },
        creditos: {
          minimo: match[4],
          integralizado: match[5],
          percentual: match[6]
        },
        quantidade: {
          minimo: match[7],
          integralizado: match[8],
          percentual: match[9]
        }
      }
      return execucaoCurricular
    } else {
      console.log('Informações de Execução Curricular não encontradas.');
      return null
    }
  }

  const aluno = extractInfo(/<b>Aluno<\/b>:\s*([\d\s\w]+)/);
  const curso = extractInfo(/<b>Curso<\/b>:\s*([^<]+)/);
  const curriculo = extractInfo(/<b>Curr[^<]*culo<\/b>:\s*(\d+)/);
  const situacao = extractInfo(/<b>Situa[^<]*<\/b>:\s*(.+)/);
  const cra = extractInfo(/<div class="col-md-2 col-sm-2 text-right"><b>CRA<\/b>:<\/div>\s*<div class="col-md-2 col-sm-2">(\d+,\d+)<\/div>/);

  return {
    aluno: aluno,
    curso: curso,
    curriculo: curriculo,
    situacao: situacao,
    cra: parseFloat(cra.replace(',', '.')),
    execucao: extractExecucaoInfo()
  };
}


module.exports = alunoPerfil
