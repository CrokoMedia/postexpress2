/**
 * Módulo vazio (noop) usado para substituir imports de @remotion/* no client-side
 *
 * O webpack substitui TODOS os imports @remotion/* por este arquivo quando
 * compilando para o browser (client-side), prevenindo erros de módulos nativos
 * específicos de plataforma (Windows, Linux, macOS).
 *
 * APIs usando Remotion DEVEM ter:
 * - export const runtime = 'nodejs'
 * - export const dynamic = 'force-dynamic'
 */

module.exports = {}
