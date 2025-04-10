function handleCredentialResponse(response) {
    // Decodifica o JWT recebido
    const token = response.credential;
    console.log("Token de ID do Google:", token);

    // Use o token no backend para autenticar o usuário
}
