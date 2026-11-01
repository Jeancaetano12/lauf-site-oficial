import { customAlphabet } from 'nanoid';

/**
 * Prefixos semânticos canônicos para entidades operacionais da LAUF
 */
export const ID_PREFIXES = {
  aula: 'aula',
  evento: 'evt',
  solicitacao: 'sol',
  presencaAula: 'praula',
  presencaEvento: 'pevt',
  participanteExterno: 'part',
} as const;

export type EntityIdPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];

export type PrefixedId<P extends EntityIdPrefix = EntityIdPrefix> = `${P}_${string}`;

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 16;
const nanoid = customAlphabet(ALPHABET, ID_LENGTH);

/**
 * Gera um Nano ID com prefixo semântico e 16 caracteres Base36 minúsculos.
 * Exemplo: generateEntityId(ID_PREFIXES.aula) -> 'aula_m1k2j3h4l5p6q7r8'
 */
export function generateEntityId<P extends EntityIdPrefix>(prefix: P): `${P}_${string}` {
  return `${prefix}_${nanoid()}`;
}

/**
 * Valida se uma string segue a estrutura canônica de identificador da LAUF:
 * <prefix>_<16 chars base36>. Opcionalmente valida contra um prefixo esperado.
 */
export function isValidEntityId(id: string, expectedPrefix?: EntityIdPrefix): boolean {
  if (!id || typeof id !== 'string') return false;
  const parts = id.split('_');
  if (parts.length !== 2) return false;
  const [prefix, hash] = parts;
  if (expectedPrefix && prefix !== expectedPrefix) return false;
  const validPrefixes = Object.values(ID_PREFIXES) as string[];
  if (!validPrefixes.includes(prefix)) return false;
  return /^[0-9a-z]{16}$/.test(hash);
}

/**
 * Extrai o prefixo semântico de um identificador caso ele seja válido.
 */
export function extractEntityPrefix(id: string): EntityIdPrefix | null {
  if (!id || typeof id !== 'string') return null;
  const parts = id.split('_');
  if (parts.length !== 2) return null;
  const prefix = parts[0] as EntityIdPrefix;
  const validPrefixes = Object.values(ID_PREFIXES) as string[];
  return validPrefixes.includes(prefix) ? prefix : null;
}
