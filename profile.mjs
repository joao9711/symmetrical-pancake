export function normalizeProfile(value) {
 if(!value||typeof value.fullName!=='string'||typeof value.phone!=='string')return null;
 const fullName=value.fullName.trim().replace(/\s+/g,' ');
 const raw=value.phone.trim();
 if(!/^[+\d\s().-]+$/.test(raw))return null;
 let digits=raw.replace(/\D/g,'');
 if(!raw.startsWith('+')&&[10,11].includes(digits.length))digits='55'+digits;
 if(fullName.length<3||fullName.length>100||!/^[1-9]\d{9,14}$/.test(digits))return null;
 const photo=value.photo??'';
 if(typeof photo!=='string'||photo.length>65000||(photo&&!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo)))return null;
 return {fullName,phone:'+'+digits,...(photo?{photo}:{})};
}
export function publicProfile(value) {
 return normalizeProfile(value)||{fullName:'',phone:''};
}
