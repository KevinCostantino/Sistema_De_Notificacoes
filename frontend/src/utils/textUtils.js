/**
 * Utility functions to handle UTF-8 text encoding/decoding issues
 */

// Cache para armazenar correções já processadas
const correctionCache = new Map();

/**
 * Fix Portuguese text using online text correction API
 */
export const fixPortugueseTextOnline = async (text) => {
  if (!text || typeof text !== 'string' || text.length === 0) {
    return text;
  }

  // Verifica cache primeiro
  if (correctionCache.has(text)) {
    return correctionCache.get(text);
  }

  try {
    // Usa API gratuita do LanguageTool para correção de texto
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'pt-BR',
        enabledOnly: 'false'
      })
    });

    if (response.ok) {
      const data = await response.json();
      let correctedText = text;
      
      // Aplica correções sugeridas (de trás para frente para não alterar posições)
      data.matches.reverse().forEach(match => {
        if (match.replacements && match.replacements.length > 0) {
          const replacement = match.replacements[0].value;
          correctedText = correctedText.substring(0, match.offset) + 
                         replacement + 
                         correctedText.substring(match.offset + match.length);
        }
      });

      // Armazena no cache
      correctionCache.set(text, correctedText);
      return correctedText;
    }
  } catch (error) {
    console.warn('Erro na correção online, usando correção local:', error);
  }

  // Fallback para correção local se API falhar
  return fixPortugueseTextLocal(text);
};

/**
 * Fix common Portuguese character encoding issues (versão local como fallback)
 */
export const fixPortugueseTextLocal = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Verifica cache primeiro
  if (correctionCache.has(text)) {
    return correctionCache.get(text);
  }

  // First, apply pattern-based fixes for common encoding issues
  let fixed = text;
  
  // Fix double-encoded UTF-8 sequences (most common issue)
  const utf8Patterns = [
    // ção patterns
    [/Ã§Ã£o/g, 'ção'],
    [/Ã§ao/g, 'ção'],
    [/Ã§Ão/g, 'ção'],
    [/��o/g, 'ção'],
    
    // ão patterns  
    [/Ã£o/g, 'ão'],
    [/��/g, 'ão'],
    
    // Common single character fixes
    [/Ã§/g, 'ç'],
    [/Ã£/g, 'ã'],
    [/Ã©/g, 'é'],
    [/Ã­/g, 'í'],
    [/Ã³/g, 'ó'],
    [/Ãº/g, 'ú'],
    [/Ã /g, 'à'],
    [/Ã¢/g, 'â'],
    [/Ãª/g, 'ê'],
    [/Ã´/g, 'ô'],
    [/Ãµ/g, 'õ'],
    
    // Diamond/question mark patterns
    [/�/g, (match, offset, string) => {
      // Context-aware replacement
      const before = string.slice(Math.max(0, offset - 3), offset);
      const after = string.slice(offset + 1, offset + 4);
      
      if (before.includes('con') && after.includes('o')) return 'ç';
      if (before.includes('a') && after.includes('o')) return 'ã';
      if (after.includes('xito')) return 'ê';
      if (after.includes('da')) return 'í';
      if (after.includes('veis')) return 'í';
      
      return 'ç'; // default fallback
    }],
    
    // õ/ã confusion patterns
    [/õ(?=xito)/g, 'ê'],    // õxito -> êxito
    [/õ(?=da)/g, 'í'],      // concluõda -> concluída
    [/õ(?=veis)/g, 'í'],    // disponõveis -> disponíveis
    [/ã(?=oes)/g, 'ç'],     // operaãoes -> operações
    [/ã(?=ão)/g, 'ç'],      // configuraãão -> configuração
  ];
  
  // Apply pattern-based fixes
  utf8Patterns.forEach(([pattern, replacement]) => {
    fixed = fixed.replace(pattern, replacement);
  });

  // Specific word fixes for common cases
  const fixes = {
    // Question marks and diamonds to proper characters
    '��o': 'ção',
    '��': 'ão', 
    '�': 'ã',
    '�': 'ç',
    '�': 'é',
    '�': 'í',
    '�': 'ó',
    '�': 'ú',
    '�': 'à',
    '�': 'â',
    '�': 'ê',
    '�': 'ô',
    '�': 'õ',
    
    // Common word fixes
    'Configura��o': 'Configuração',
    'configura��o': 'configuração',
    'Manuten��o': 'Manutenção', 
    'manuten��o': 'manutenção',
    'Informa��o': 'Informação',
    'informa��o': 'informação',
    'Cria��o': 'Criação',
    'cria��o': 'criação',
    'Verifica��o': 'Verificação',
    'verifica��o': 'verificação',
    'A��o': 'Ação',
    'a��o': 'ação',
    'Notifica��o': 'Notificação',
    'notifica��o': 'notificação',
    'Aplica��o': 'Aplicação',
    'aplica��o': 'aplicação',
    
    // Common phrases
    'Haver�': 'Haverá',
    'haver�': 'haverá',
    'pr�ximo': 'próximo',
    'Pr�ximo': 'Próximo',
    '�s ': 'às ',
    'per�odo': 'período',
    'Per�odo': 'Período',
    'poder�o': 'poderão',
    'Poder�o': 'Poderão',
    'indispon�veis': 'indisponíveis',
    'Indispon�veis': 'Indisponíveis',
    'conclu�da': 'concluída',
    'Conclu�da': 'Concluída',
    '�xito': 'êxito',
    '�xito': 'Êxito',
    
    // New patterns for current encoding issues
    'concluõda': 'concluída',
    'Concluõda': 'Concluída',
    'õxito': 'êxito',
    'Õxito': 'Êxito',
    'Operaãoes': 'Operações',
    'operaãoes': 'operações',
    'disponõveis': 'disponíveis',
    'Disponõveis': 'Disponíveis',
    'manutenãão': 'manutenção',
    'Manutenãão': 'Manutenção',
    'configuraãão': 'configuração',
    'Configuraãão': 'Configuração',
    'informaãão': 'informação',
    'Informaãão': 'Informação',
    'criaãão': 'criação',
    'Criaãão': 'Criação',
    'verificaãão': 'verificação',
    'Verificaãão': 'Verificação',
  };

  // Apply word-level fixes
  Object.entries(fixes).forEach(([wrong, correct]) => {
    fixed = fixed.replace(new RegExp(wrong, 'g'), correct);
  });

  // Armazena no cache
  correctionCache.set(text, fixed);
  return fixed;
};

/**
 * Fix common Portuguese character encoding issues (função principal)
 */
export const fixPortugueseText = async (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Primeiro tenta correção online
  try {
    return await fixPortugueseTextOnline(text);
  } catch (error) {
    console.warn('Usando correção local como fallback');
    return fixPortugueseTextLocal(text);
  }
};

/**
 * Versão síncrona para casos onde async não é possível
 */
export const fixPortugueseTextSync = (text) => {
  return fixPortugueseTextLocal(text);
};

/**
 * Process notification data to fix UTF-8 issues
 */
export const processNotificationText = async (notification) => {
  if (!notification) return notification;
  
  return {
    ...notification,
    title: await fixPortugueseText(notification.title),
    message: await fixPortugueseText(notification.message),
  };
};

/**
 * Versão síncrona para processamento de notificações
 */
export const processNotificationTextSync = (notification) => {
  if (!notification) return notification;
  
  return {
    ...notification,
    title: fixPortugueseTextSync(notification.title),
    message: fixPortugueseTextSync(notification.message),
  };
};

/**
 * Detect and fix any remaining encoding issues using heuristics
 */
export const smartFixPortugueseText = async (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  let result = await fixPortugueseText(text);
  
  // Additional heuristic patterns for the current encoding issues
  const heuristicPatterns = [
    // Fix the specific pattern you're seeing: "ç" instead of correct letters
    [/ção/g, 'ção'],                           // Keep correct ção as is
    [/çao/g, 'ção'],                           // çao -> ção (configuraçao -> configuração)
    [/ção/g, 'ção'],                           // Keep correct ção
    [/çda/g, 'ída'],                           // çda -> ída (concluçda -> concluída)
    [/çxito/g, 'êxito'],                       // çxito -> êxito  
    [/çxima/g, 'óxima'],                       // çxima -> óxima (próçxima -> próxima)
    [/çodo/g, 'íodo'],                         // çodo -> íodo (perçodo -> período)
    [/ção/g, 'ção'],                           // Keep correct ção
    
    // Fix words ending with ção pattern
    [/(\w+)aão/g, '$1ação'],                   // educaão -> educação
    [/(\w+)ião/g, '$1ição'],                   // instituião -> instituição  
    [/(\w+)uão/g, '$1ução'],                   // organizaão -> organização
    [/(\w+)ção/g, '$1ção'],                    // legislaão -> legislação (but this becomes legislação)
    [/(\w+)são/g, '$1são'],                    // Keep são patterns
    [/(\w+)tão/g, '$1tão'],                    // Keep tão patterns
    [/(\w+)não/g, '$1não'],                    // manutenão -> manutenção (but this needs special handling)
    
    // Specific word fixes for the patterns you're seeing
    [/nço/g, 'não'],                           // nço -> não
    [/estço/g, 'estão'],                       // estço -> estão  
    [/instituião/g, 'instituição'],            // instituião -> instituição
    [/educaão/g, 'educação'],                  // educaão -> educação
    [/organizaão/g, 'organização'],            // organizaão -> organização
    [/legislaão/g, 'legislação'],              // legislaão -> legislação
    [/apresentaão/g, 'apresentação'],          // apresentaão -> apresentação
    [/implementaão/g, 'implementação'],        // implementaão -> implementação
    [/configuraão/g, 'configuração'],          // configuraão -> configuração
    [/acentuaão/g, 'acentuação'],              // acentuaão -> acentuação
    [/informaão/g, 'informação'],              // informaão -> informação
    [/criaão/g, 'criação'],                    // criaão -> criação
    [/verificaão/g, 'verificação'],            // verificaão -> verificação
    [/manutenão/g, 'manutenção'],              // manutenão -> manutenção
    [/perçodo/g, 'período'],                   // perçodo -> período
    [/prçxima/g, 'próxima'],                   // prçxima -> próxima
    [/versão/g, 'versão'],                     // Keep versão correct
    [/concluçda/g, 'concluída'],               // concluçda -> concluída
    [/Detecão/g, 'Detecção'],                  // Detecão -> Detecção
    [/Automçtica/g, 'Automática'],             // Automçtica -> Automática
    
    // Specific common words that might appear
    [/batatão/g, 'batatão'],                   // Keep correct batatão
    [/coração/g, 'coração'],                   // Keep correct coração
    [/água/g, 'água'],                         // Keep correct água
    [/lítio/g, 'lítio'],                       // Keep correct lítio
    [/batată/g, 'batata'],                     // Fix potential corruption
    [/coraă/g, 'coraa'],                      // Fix potential corruption (intermediate step)
    [/águă/g, 'água'],                        // Fix potential corruption
    [/lítĭo/g, 'lítio'],                      // Fix potential corruption
    
    // Broader patterns for common Portuguese word endings
    [/(\w+)ă/g, '$1a'],                       // Fix corrupted â/ã
    [/(\w+)ĭ/g, '$1i'],                       // Fix corrupted í
    [/(\w+)ŏ/g, '$1o'],                       // Fix corrupted ó/õ
    [/(\w+)ŭ/g, '$1u'],                       // Fix corrupted ú
    [/(\w+)ě/g, '$1e'],                       // Fix corrupted ê/é
    
    // Generic patterns for any remaining issues  
    [/(\w+)çtica/g, '$1ática'],                // Automçtica -> Automática
    [/(\w+)çção/g, '$1ecção'],                 // detecção patterns
    [/(\w+)tăo/g, '$1tão'],                    // batatăo -> batatão
    [/(\w+)raăo/g, '$1ração'],                 // coraăo -> coração
    [/(\w+)ç(\w+)/g, (match, prefix, suffix) => {
      // Context-aware replacement for ç in middle of words
      if (suffix.startsWith('tica')) return prefix + 'á' + suffix;
      if (suffix.startsWith('ção')) return prefix + 'ec' + suffix;
      if (suffix.startsWith('xima')) return prefix + 'ó' + suffix;
      if (suffix.startsWith('xito')) return prefix + 'ê' + suffix;
      if (suffix.startsWith('odo')) return prefix + 'ío' + suffix;
      return match; // Keep as is if no pattern matches
    }],
    
    // Universal fallback for any remaining non-ASCII characters
    [/[À-ÿ]/g, (char) => {
      // Map extended ASCII back to basic accented characters
      const charMap = {
        'À': 'À', 'Á': 'Á', 'Â': 'Â', 'Ã': 'Ã', 'Ä': 'Ä', 'Å': 'Å',
        'à': 'à', 'á': 'á', 'â': 'â', 'ã': 'ã', 'ä': 'ä', 'å': 'å',
        'È': 'È', 'É': 'É', 'Ê': 'Ê', 'Ë': 'Ë',
        'è': 'è', 'é': 'é', 'ê': 'ê', 'ë': 'ë',
        'Ì': 'Ì', 'Í': 'Í', 'Î': 'Î', 'Ï': 'Ï',
        'ì': 'ì', 'í': 'í', 'î': 'î', 'ï': 'ï',
        'Ò': 'Ò', 'Ó': 'Ó', 'Ô': 'Ô', 'Õ': 'Õ', 'Ö': 'Ö',
        'ò': 'ò', 'ó': 'ó', 'ô': 'ô', 'õ': 'õ', 'ö': 'ö',
        'Ù': 'Ù', 'Ú': 'Ú', 'Û': 'Û', 'Ü': 'Ü',
        'ù': 'ù', 'ú': 'ú', 'û': 'û', 'ü': 'ü',
        'Ç': 'Ç', 'ç': 'ç', 'Ñ': 'Ñ', 'ñ': 'ñ'
      };
      return charMap[char] || char;
    }]
  ];
  
  // Apply heuristic fixes
  heuristicPatterns.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  
  return result;
};

/**
 * Process array of notifications (versão assíncrona)
 */
export const processNotificationsArray = async (notifications) => {
  if (!Array.isArray(notifications)) return notifications;
  
  return Promise.all(notifications.map(processNotificationText));
};

/**
 * Process array of notifications (versão síncrona)
 */
export const processNotificationsArraySync = (notifications) => {
  if (!Array.isArray(notifications)) return notifications;
  
  return notifications.map(processNotificationTextSync);
};

/**
 * Middleware para API que corrige texto automaticamente
 */
export const createTextCorrectionAPI = () => {
  const textCorrectionEndpoint = async (req, res, next) => {
    try {
      // Intercepta responses JSON para corrigir texto automaticamente
      const originalSend = res.send;
      
      res.send = function(data) {
        if (typeof data === 'string') {
          try {
            const jsonData = JSON.parse(data);
            if (jsonData && (jsonData.data || jsonData.title || jsonData.message)) {
              // Processa notificações ou dados com texto
              processNotificationsArraySync([jsonData]).then(processed => {
                originalSend.call(this, JSON.stringify(processed[0]));
              });
              return;
            }
          } catch (e) {
            // Não é JSON, continua normalmente
          }
        }
        originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Erro no middleware de correção de texto:', error);
      next();
    }
  };
  
  return textCorrectionEndpoint;
};