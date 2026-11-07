import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ID_PREFIXES,
  generateEntityId,
  isValidEntityId,
  extractEntityPrefix,
} from '../src/ids.ts';

test('Gerador de Nano ID com Prefixos Semânticos', async (t) => {
  await t.test('deve gerar ID com prefixo correto e 16 caracteres Base36 minúsculos', () => {
    const id = generateEntityId(ID_PREFIXES.aula);
    assert.match(id, /^aula_[0-9a-z]{16}$/);
    assert.equal(id.length, 21); // 'aula' (4) + '_' (1) + 16 = 21
  });

  await t.test('deve gerar IDs válidos para todos os prefixos canônicos de domínio', () => {
    const prefixKeys = Object.keys(ID_PREFIXES) as (keyof typeof ID_PREFIXES)[];
    for (const key of prefixKeys) {
      const prefix = ID_PREFIXES[key];
      const id = generateEntityId(prefix);
      assert.ok(id.startsWith(`${prefix}_`), `ID ${id} deve começar com ${prefix}_`);
      assert.ok(isValidEntityId(id), `ID ${id} deve ser válido`);
      assert.ok(isValidEntityId(id, prefix), `ID ${id} deve corresponder ao prefixo esperado ${prefix}`);
    }
  });

  await t.test('isValidEntityId deve validar formatos e rejeitar anomalias', () => {
    const validAulaId = generateEntityId(ID_PREFIXES.aula);
    assert.equal(isValidEntityId(validAulaId), true);
    assert.equal(isValidEntityId(validAulaId, ID_PREFIXES.aula), true);
    assert.equal(isValidEntityId(validAulaId, ID_PREFIXES.evento), false);

    // Rejeições de segurança (T-04-02)
    assert.equal(isValidEntityId(''), false);
    assert.equal(isValidEntityId('aula'), false);
    assert.equal(isValidEntityId('aula_'), false);
    assert.equal(isValidEntityId('aula_abc'), false); // menos de 16 chars
    assert.equal(isValidEntityId('aula_1234567890abcdefg'), false); // mais de 16 chars
    assert.equal(isValidEntityId('aula_1234567890ABCDEF'), false); // maiúsculas rejeitadas
    assert.equal(isValidEntityId('aula_1234-5678-90ab'), false); // hifens rejeitados
    assert.equal(isValidEntityId('desconhecido_1234567890abcdef'), false); // prefixo não mapeado
    assert.equal(isValidEntityId('aula_123_4567890abcdef'), false); // múltiplos underscores
    // @ts-expect-error teste com tipo nulo/indefinido
    assert.equal(isValidEntityId(null), false);
    // @ts-expect-error teste com tipo nulo/indefinido
    assert.equal(isValidEntityId(undefined), false);
  });

  await t.test('extractEntityPrefix deve extrair o prefixo correto ou null', () => {
    const id = generateEntityId(ID_PREFIXES.solicitacao);
    assert.equal(extractEntityPrefix(id), ID_PREFIXES.solicitacao);
    assert.equal(extractEntityPrefix('invalido'), null);
    assert.equal(extractEntityPrefix('foo_1234567890abcdef'), null);
  });

  await t.test('deve garantir unicidade sem colisões em 10.000 gerações consecutivas (T-04-01)', () => {
    const total = 10000;
    const ids = new Set<string>();
    for (let i = 0; i < total; i++) {
      ids.add(generateEntityId(ID_PREFIXES.aula));
    }
    assert.equal(ids.size, total, 'Todos os 10.000 IDs gerados devem ser únicos');
  });
});
