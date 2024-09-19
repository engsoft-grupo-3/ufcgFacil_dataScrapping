async function fazerLogin (matricula, senha) {
  const baseUrl = "https://pre.ufcg.edu.br:8443/ControleAcademicoOnline/Controlador"
  const urlLogin = `${baseUrl}?command=AlunoLogin&login=${encodeURIComponent(matricula)}&senha=${encodeURIComponent(senha)}`
  let cookieAuth

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

    return cookieAuth
}

module.exports = fazerLogin