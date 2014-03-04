var ProjetoSchema = new mongoose.Schema({
    nome: String,
    cliente: String,
    criadopor: String,
    deadline: String,
    criadoem: Date,
    briefing: String,
    
});
module.exports = mongoose.model('Projetos', ProjetoSchema);