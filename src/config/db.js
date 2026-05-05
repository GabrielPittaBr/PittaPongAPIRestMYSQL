const mongoose = require('mongoose');

// String de conexão (em produção, use variáveis de ambiente .env)
const uri = "mongodb://localhost:27017/pittapong-db";

const conectarDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Conectado ao MongoDB com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB:", error.message);
        process.exit(1); // Encerra a aplicação em caso de falha crítica
    }
};

module.exports = conectarDB;