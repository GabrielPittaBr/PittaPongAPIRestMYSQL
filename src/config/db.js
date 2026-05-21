const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

const conectarDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB com sucesso!");
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;