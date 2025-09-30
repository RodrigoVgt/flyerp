const User = () => {}

User.getCustomer = async function(phone){
    try {
        const formattedPhone = phone.replace(/\D/g, '')
        const customer = await User.findOne({ phone: formattedPhone })
        return customer
    } catch (err) {
        console.log(err)
        return null
    }
}

User.createUser = async function(phone){
    const formattedPhone = phone.replace(/\D/g, '')
    const user = await User.create({ phone: formattedPhone, block_messages: true })
    return user
}

User.blockUser = async function(phone){
    const formattedPhone = phone.replace(/\D/g, '')
    const user = await User.findOneAndUpdate({ phone: formattedPhone }, { block_messages: true })
    return user
}

User.updateUser = async function(params){
    try {
        const formattedPhone = params.phone.replace(/\D/g, '')
        const user = await User.findOneAndUpdate({
            name: params.name,
            phone: formattedPhone,
            block_messages: params.block_messages,
            user_code: params.user_code
        })
        return user
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = User