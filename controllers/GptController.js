const GptController = () => {}

GptController.getResponse = async function(prompt){
        try {
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

            return data
        } catch (error) {
            console.error(error.message);
            return null
        }
}

module.exports = GptController