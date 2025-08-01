const { MongoClient } = require('mongodb');

// URN real que queremos manter
const REAL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw';

function decodeBase64(base64) {
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    return 'Erro ao decodificar';
  }
}

function isFakeUrn(urn) {
  if (!urn) return true;
  
  try {
    const decoded = decodeBase64(urn);
    // Se contém "forge-viewer-models/" é fake
    return decoded.includes("forge-viewer-models/");
  } catch {
    return true;
  }
}

async function deleteFakeUrnModels() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('forge-viewer');
    const modelsCollection = db.collection('models');
    
    const models = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Encontrados ${models.length} modelos no banco:`);
    
    let deleteCount = 0;
    let keepCount = 0;
    
    for (const model of models) {
      console.log(`\n🔍 Analisando: ${model.name}`);
      console.log(`   URN: ${model.urn || 'Sem URN'}`);
      console.log(`   Base64: ${model.base64Urn || 'Sem base64Urn'}`);
      
      // Verifica se é fake baseado na mesma lógica do servidor
      const isFakeUrnField = isFakeUrn(model.urn);
      const isFakeBase64Field = isFakeUrn(model.base64Urn);
      
      if (model.urn === REAL_URN || model.base64Urn === REAL_URN) {
        console.log('   ✅ MANTENDO - Tem URN real');
        keepCount++;
      } else if (isFakeUrnField || isFakeBase64Field) {
        console.log('   ❌ DELETANDO - URN fake detectada');
        
        const deleteResult = await modelsCollection.deleteOne({ _id: model._id });
        if (deleteResult.deletedCount === 1) {
          console.log('   🗑️ Deletado com sucesso');
          deleteCount++;
        } else {
          console.log('   ⚠️ Erro ao deletar');
        }
      } else {
        console.log('   ⚠️ URN não identificada, mantendo por segurança');
        keepCount++;
      }
    }
    
    console.log(`\n🎉 Operação concluída:`);
    console.log(`   ✅ Modelos mantidos: ${keepCount}`);
    console.log(`   🗑️ Modelos deletados: ${deleteCount}`);
    
    // Verificar resultado final
    const remainingModels = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Modelos restantes no banco (${remainingModels.length}):`);
    
    remainingModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   URN: ${model.urn === REAL_URN ? '✅ REAL' : '🔧 OUTRA'}`);
      console.log(`   Base64: ${model.base64Urn === REAL_URN ? '✅ REAL' : '🔧 OUTRA'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
    console.log('\n🔒 Conexão fechada');
  }
}

deleteFakeUrnModels();
