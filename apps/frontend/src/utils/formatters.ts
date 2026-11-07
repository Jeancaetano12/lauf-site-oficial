import { Curso, Genero } from '@lauf/shared';

export const formatarNomeCurso = (curso: string | undefined | null): string => {
  if (!curso) return '';

  const mapaCursos: Record<string, string> = {
    [Curso.ANALISE_E_DESENVOLVIMENTO_DE_SISTEMAS]: 'Análise e Desenvolvimento de Sistemas',
    [Curso.BANCO_DE_DADOS]: 'Banco de Dados',
    [Curso.CIENCIAS_AERONAUTICAS]: 'Ciências Aeronáuticas',
    [Curso.ENGENHARIA_DA_COMPUTACAO]: 'Engenharia da Computação',
    [Curso.GESTAO_DA_TECNOLOGIA_DA_INFORMACAO]: 'Gestão da Tecnologia da Informação',
    [Curso.JOGOS_DIGITAIS]: 'Jogos Digitais',
    [Curso.SEGURANCA_DA_INFORMACAO]: 'Segurança da Informação'
  };

  // Se existir no mapa, retorna com a acentuação correta
  if (mapaCursos[curso]) {
    return mapaCursos[curso];
  }

  // Caso seja um valor novo não mapeado, faz um replace genérico
  return curso
    .split('_')
    .map(word => {
      // Palavras que não devem ser capitalizadas (artigos, preposições, etc.)
      const wordsToKeepLower = ['e', 'de', 'da', 'do', 'das', 'dos'];
      if (wordsToKeepLower.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export const formatarTelefone = (telefone: string | undefined | null): string => {
  if (!telefone) return '';

  return telefone
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
};

export const formatarGenero = (genero: string | undefined | null): string => {
  if (!genero) return '';

  const mapaGeneros: Record<string, string> = {
    [Genero.MASCULINO]: 'Masculino',
    [Genero.FEMININO]: 'Feminino',
    [Genero.OUTRO]: 'Outro',
    [Genero.NAO_BINARIO]: 'Não-binário',
    [Genero.PREFIRO_NAO_INFORMAR]: 'Prefiro não informar',
    'PREFIRO_NAO_DIZER': 'Prefiro não informar'
  };

  // Se existir no mapa, retorna com a acentuação correta
  if (mapaGeneros[genero]) {
    return mapaGeneros[genero];
  }

  // Caso seja um valor novo não mapeado, faz um replace genérico
  return genero
    .split('_')
    .map(word => {
      // Palavras que não devem ser capitalizadas (artigos, preposições, etc.)
      const wordsToKeepLower = ['e', 'de', 'da', 'do', 'das', 'dos'];
      if (wordsToKeepLower.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}