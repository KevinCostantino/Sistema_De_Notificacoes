/**
 * Middleware para correção automática de caracteres portugueses
 * Foco: correção local de problemas de encoding UTF-8
 * 
 * Autor: (você 😎)
 */

const correctionCache = new Map();

/**
 * 🧩 Lista de correções locais pré-compiladas
 * - Corrige caracteres UTF-8 corrompidos
 * - Corrige grafias portuguesas comuns com erros de encoding
 */
const LOCAL_CORRECTIONS = [
  // Casos específicos e observados
  [/reuni�o/gi, 'reunião'],
  [/amanh�/gi, 'amanhã'],
  [/�s(\s+\d)/gi, 'às$1'],
  [/calend�rio/gi, 'calendário'],
  [/presen�a/gi, 'presença'],
  [/reuniço/gi, 'reunião'],
  [/amanhç/gi, 'amanhã'],
  [/çs(\s+\d)/gi, 'às$1'],
  [/calendçrio/gi, 'calendário'],

  // UTF-8 genéricos corrompidos
  [/Ã§/g, 'ç'],
  [/Ã£/g, 'ã'],
  [/Ã©/g, 'é'],
  [/Ãí/g, 'í'],
  [/Ã³/g, 'ó'],
  [/Ãº/g, 'ú'],
  [/Ã /g, 'à'],
  [/Ã¢/g, 'â'],
  [/Ãê/g, 'ê'],
  [/Ãô/g, 'ô'],
  [/Ãõ/g, 'õ'],
  [/Ã£o/g, 'ão'],
  [/Ã§Ã£o/g, 'ção'],
  [/Ã§ao/g, 'ção'],

  // Genéricos
  [/(\w)�o/g, '$1ão'],
  [/(\w)�a/g, '$1ã'],
  [/(\w)�/g, '$1ç'],
  [/�(\s)/g, 'ç$1'],
  [/vocç/gi, 'você'],
  [/possçvel/gi, 'possível'],
  [/mçdulo/gi, 'módulo'],
  [/necessçria/gi, 'necessária'],
  [/correçço/gi, 'correção'],
  [/informaçço/gi, 'informação'],
  [/operaçço/gi, 'operação'],
  [/verificaçço/gi, 'verificação'],
  [/implementaçço/gi, 'implementação'],
  [/configuraçço/gi, 'configuração'],
  [/soluçço/gi, 'solução'],
  [/organizaçço/gi, 'organização'],
  [/documentaçço/gi, 'documentação'],
  [/versço/gi, 'versão'],
  [/revisço/gi, 'revisão'],
  [/protótipos/gi, 'protótipos'],
  [/necessárias/gi, 'necessárias'],
  [/notificações/gi, 'notificações'],
  [/disponçveis/gi, 'disponíveis'],
  [/prçxima/gi, 'próxima'],
  [/olç/gi, 'olá'],

  // Fallback genérico
  [/�/g, 'ã'],

  // Palavras acentuadas comuns sem acento
  [/\bvoce\b/gi, 'você'],
  [/\bmodulo\b/gi, 'módulo'],
  [/\bversao\b/gi, 'versão'],
  [/\bautenticacao\b/gi, 'autenticação'],
  [/\bcorrecao\b/gi, 'correção'],
  [/\bpossivel\b/gi, 'possível'],
  [/\bproxima\b/gi, 'próxima'],
  [/\batribuido\b/gi, 'atribuído'],
  [/\bimplementacao\b/gi, 'implementação'],
  [/\bprototipo\b/gi, 'protótipo'],
  [/\balteracoes\b/gi, 'alterações'],
  [/\bnecessarias\b/gi, 'necessárias'],
  [/\baprovacao\b/gi, 'aprovação'],
  [/\bpagina\b/gi, 'página']
];

/**
 * Correção local como fallback
 */
const correctTextLocally = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }



  let corrected = text;
  LOCAL_CORRECTIONS.forEach(([pattern, replacement]) => {
    corrected = corrected.replace(pattern, replacement);
  });

  return corrected;
};

/**
 * Processa objeto recursivamente para corrigir texto
 */
const processObject = async (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map(processObject));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Ignora campos específicos do MongoDB e campos não textuais
    if (key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt' || 
        key === 'userId' || key.endsWith('Id') || key.endsWith('At')) {
      result[key] = value;
    } else if (typeof value === 'string' && value.length > 0) {
      // Só processa strings que parecem conter texto (não IDs ou datas)
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        result[key] = await correctTextWithCache(value);
      } else {
        result[key] = value;
      }
    } else if (typeof value === 'object' && value !== null && !Buffer.isBuffer(value)) {
      result[key] = await processObject(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * 🔧 Função principal para correção de texto com cache
 * Usa cache local para melhor performance
 */
const correctTextWithCache = async (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Verifica cache primeiro
  if (correctionCache.has(text)) {
    return correctionCache.get(text);
  }

  // Aplica correções locais
  const correctedText = correctTextLocally(text);
  
  // Salva no cache
  correctionCache.set(text, correctedText);
  
  return correctedText;
};

/**
 * Middleware que intercepta respostas e corrige texto automaticamente
 */
const textCorrectionMiddleware = () => {
  return (req, res, next) => {
    // Só aplica em rotas de notificações
    if (!req.path.includes('/notifications')) {
      return next();
    }

    // Intercepta o método res.json
    const originalJson = res.json;
    
    res.json = async function(data) {
      try {
        console.log('Aplicando correção de texto em:', req.path);
        
        // Se a resposta contém dados de notificação, processa texto
        if (data && (data.data || data.title || data.message)) {
          console.log('Dados antes da correção:', JSON.stringify(data).substring(0, 200));
          const correctedData = await processObject(data);
          console.log('Dados após correção:', JSON.stringify(correctedData).substring(0, 200));
          return originalJson.call(this, correctedData);
        }
      } catch (error) {
        console.error('Erro na correção automática de texto:', error);
      }
      
      // Se não conseguir processar, retorna dados originais
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Endpoint para correção manual de texto (para testes)
 */
const createTextCorrectionEndpoint = () => {
  return async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Texto é obrigatório'
        });
      }

      const correctedText = await correctTextWithCache(text);
      
      res.json({
        success: true,
        data: { original: text, corrected: correctedText, changed: text !== correctedText }
      });
    } catch (error) {
      console.error('Erro ao corrigir texto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

/**
 * Limpa cache de correções (útil para desenvolvimento)
 */
const clearCorrectionCache = () => {
  correctionCache.clear();
  console.log('Cache de correções limpo');
};

module.exports = {
  textCorrectionMiddleware,
  createTextCorrectionEndpoint,
  clearCorrectionCache,
  correctTextWithCache,
  correctTextLocally
};