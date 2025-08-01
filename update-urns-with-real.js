const { MongoClient } = require('mongodb');

// URN real extraída do manifest do Autodesk
const REAL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw';

async function updateUrnsWithReal() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('forge-viewer');
    const modelsCollection = db.collection('models');
    
    // Primeiro, vamos ver quais modelos temos
    const models = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Encontrados ${models.length} modelos no banco:`);
    
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name} (ID: ${model._id})`);
      console.log(`   URN atual: ${model.urn || 'Sem URN'}`);
      console.log(`   Status: ${model.status}`);
      console.log('');
    });
    
    // Atualizar todos os modelos com a URN real
    const updateResult = await modelsCollection.updateMany(
      {}, // Todos os documentos
      { 
        $set: { 
          urn: REAL_URN,
          status: 'success',
          progress: 'complete',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ ${updateResult.modifiedCount} modelos atualizados com URN real`);
    
    // Verificar os resultados
    const updatedModels = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Modelos após atualização:`);
    
    updatedModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name} (ID: ${model._id})`);
      console.log(`   URN: ${model.urn}`);
      console.log(`   Status: ${model.status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('🔒 Conexão fechada');
  }
}

updateUrnsWithReal();
