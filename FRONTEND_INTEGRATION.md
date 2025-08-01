### Instruções Simplificadas para o Frontend

Sistema simplificado: **Sempre retorna URN válida**, remove automaticamente URNs fake e usa URN padrão de teste quando necessário.

## Uso Simplificado:
```javascript
// ✅ SOLUÇÃO SIMPLES: Sempre obtém URN válida
const response = await fetch(`/api/models/${id}/viewer-urn`);
const data = await response.json();
const validUrn = data.data.urn; // Sempre válida!

// Use diretamente no Forge Viewer
initializeForgeViewer(validUrn);
```

## Exemplo Completo:
```javascript
useEffect(() => {
  const fetchValidUrn = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/models/${modelId}/viewer-urn`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ URN válida obtida:', data.data.urn);
        console.log('��� Modelo:', data.data.name);
        
        // Use diretamente - sempre válida
        initializeForgeViewer(data.data.urn);
      }
    } catch (error) {
      console.error('Erro ao obter URN válida:', error);
    }
  };
  
  fetchValidUrn();
}, [modelId]);
```

## Resposta Simplificada:
```json
{
  "success": true,
  "data": {
    "id": "688b9a85d0b9cb0d0808a8ab",
    "name": "Edifício BR6-BAR",
    "fileName": "BR6-BAR.IFC",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQkFSLklGQw==",
    "status": "success"
  }
}
```

## Vantagens:
- ✅ **Sempre funciona**: URN sempre válida
- ✅ **Simples**: Apenas um campo `urn`
- ✅ **Automático**: Remove fakes automaticamente
- ✅ **Padrão**: Usa URN de teste quando necessário
