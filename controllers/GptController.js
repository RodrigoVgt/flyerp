const GptController = () => {}

const GptLog = require('../models/gpt_log')
const axios = require('axios')
const { contactPrompt } = require('../extras/prompts')

GptController.getResponse = async function(message, sender){
        try {
            const prompt = contactPrompt + message
            const data = {
                response: ""
            }
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini', // Ou outro modelo disponível
                    messages: [{ role: 'assistant', content: prompt }],
                    temperature: 0.7,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            if(response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message && response.data.choices[0].message.content){
                data.response = response.data.choices[0].message.content
            }
            data.entryTokens = response.data.usage.prompt_tokens
            data.responseTokens = response.data.usage.completion_tokens

            await this.createLog({
                user_message: message,
                response: data.response,
                entry_tokens: data.entryTokens,
                response_tokens: data.responseTokens,
                user: sender.replace(/\D/g, '')
            })

            return data.response
        } catch (error) {
            console.error(error.message);
            return null
        }
}

GptController.createLog = async function(data){
    try {
        const log = await GptLog.create(data)
        return log
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = GptController