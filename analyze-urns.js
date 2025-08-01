// Script para verificar e decodificar as URNs atuais
const { MongoClient } = require('mongodb');

// URN real extraída do manifest
const REAL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw';

function decodeBase64(base64) {
  try {
    return Buffer.from(base64, 'base64').toString('utf-8');
  } catch (error) {
    return 'Erro ao decodificar';
  }
}

async function analyzeUrns() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');
    
    const db = client.db('forge-viewer');
    const modelsCollection = db.collection('models');
    
    const models = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Análise das URNs dos ${models.length} modelos:\n`);
    
    console.log('🎯 URN REAL que queremos usar:');
    console.log(`   Base64: ${REAL_URN}`);
    console.log(`   Decodificada: ${decodeBase64(REAL_URN)}`);
    console.log('');
    
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   URN: ${model.urn || 'Sem URN'}`);
      if (model.base64Urn) {
        console.log(`   Base64: ${model.base64Urn}`);
        console.log(`   Decodificada: ${decodeBase64(model.base64Urn)}`);
        
        // Verifica se é a URN real
        if (model.base64Urn === REAL_URN) {
          console.log('   ✅ ESTA É A URN REAL!');
        } else {
          console.log('   ❌ URN fake/simulada');
        }
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await client.close();
  }
}

analyzeUrns();
