const contactPrompt = `Foi enviada uma mensagem com um link de pagamento para um usuário, e ele forneceu a resposta do final deste prompt.
 Verifique se a resposta fornecida indica que o usuário necessita ajuda ou qualquer coisa relacionada a interação humana.
 Caso sim, retorne o valor 1, caso contrário retorne -1.
 Resposta do usuário: `


module.exports = {
    contactPrompt
}