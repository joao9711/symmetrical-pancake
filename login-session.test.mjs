import test from 'node:test';
import assert from 'node:assert/strict';
import {validVisit,allowVisit,sessionCookies,clearSessionCookies} from './login-session.mjs';
const visit='12345678-1234-1234-1234-123456789abc';
const session={access_token:'test-access',refresh_token:'test-refresh'};
test('sem opt-in, cookies não persistem e nova visita é rejeitada',()=>{const cookies=sessionCookies(session,false,visit);assert.ok(cookies.every(c=>!c.includes('Max-Age')&&!c.includes('Expires')));assert.ok(allowVisit({remember:'0',visit},visit));assert.equal(allowVisit({remember:'0',visit},undefined),false);assert.equal(allowVisit({remember:'0',visit},'different-visit-marker'),false);assert.equal(allowVisit({},visit),false);});
test('persistência exige opt-in e segue o prazo de sete dias',()=>{const cookies=sessionCookies(session,true,visit);assert.ok(cookies.some(c=>c.startsWith('refresh=')&&c.includes('Max-Age=604800')));assert.ok(cookies.some(c=>c.startsWith('remember=1')));assert.ok(allowVisit({remember:'1'},undefined));assert.ok(cookies.every(c=>c.includes('HttpOnly')&&c.includes('SameSite=Strict')&&c.includes('Secure')));});
test('renovar mantém preferência temporária; logout apaga todos os marcadores',()=>{assert.ok(sessionCookies(session,false,visit,false).every(c=>!c.includes('Max-Age')));assert.equal(clearSessionCookies().length,4);assert.ok(clearSessionCookies().every(c=>c.includes('Max-Age=0')));assert.ok(validVisit(visit));assert.equal(validVisit(''),false);});
