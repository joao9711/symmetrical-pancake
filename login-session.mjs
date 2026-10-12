export function validVisit(value){return typeof value==='string'&&/^[A-Za-z0-9_-]{20,100}$/.test(value);}
export function allowVisit(cookies,visit){return cookies.remember==='1'||(cookies.remember==='0'&&validVisit(visit)&&visit===cookies.visit);}
export function sessionCookies(session,remember,visit,secure=true){const flags=`; HttpOnly; SameSite=Strict; Path=/${secure?'; Secure':''}`;return [
 `access=${session.access_token}${flags}${remember?'; Max-Age=3600':''}`,
 `refresh=${session.refresh_token}${flags}${remember?'; Max-Age=604800':''}`,
 `remember=${remember?'1':'0'}${flags}${remember?'; Max-Age=604800':''}`,
 `visit=${remember?'':visit}${flags}${remember?'; Max-Age=0':''}`
 ];}
export function clearSessionCookies(secure=true){const flags=`; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure?'; Secure':''}`;return ['access','refresh','remember','visit'].map(name=>name+'='+flags);}
