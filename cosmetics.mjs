export const cosmeticTypes=[
 'Perfume','Colônia','Body splash','Desodorante corporal','Desodorante antitranspirante',
 'Creme hidratante corporal','Loção corporal','Óleo corporal','Manteiga corporal','Creme para mãos','Creme para pés',
 'Sabonete em barra','Sabonete líquido','Gel de banho','Esfoliante corporal',
 'Hidratante facial','Sérum facial','Creme anti-idade','Protetor solar facial','Protetor solar corporal','Pós-sol',
 'Gel de limpeza facial','Espuma de limpeza','Água micelar','Demaquilante','Tônico facial','Esfoliante facial','Máscara facial','Creme para olhos',
 'Batom','Gloss','Lip tint','Balm labial','Base','Corretivo','Pó facial','Blush','Iluminador','Bronzer','Contorno','Primer','Fixador de maquiagem',
 'Sombra','Paleta de sombras','Máscara de cílios','Delineador','Lápis para olhos','Produto para sobrancelhas',
 'Shampoo','Condicionador','Máscara capilar','Creme para pentear','Leave-in','Óleo capilar','Sérum capilar','Protetor térmico',
 'Finalizador capilar','Gel capilar','Pomada capilar','Spray capilar','Tônico capilar','Coloração','Matizador','Tratamento capilar',
 'Esmalte','Base para unhas','Top coat','Removedor de esmalte','Óleo para cutículas','Tratamento para unhas',
 'Creme de barbear','Espuma de barbear','Pós-barba','Óleo para barba','Balm para barba',
 'Cosmético infantil','Higiene íntima','Creme depilatório','Cera depilatória','Autobronzeador','Kit de cosméticos',
 'Pincel de maquiagem','Esponja de maquiagem','Acessório de beleza'
];
export const cosmeticBrands=['Avon','Natura','O Boticário','Eudora','Jequiti','Mary Kay','Hinode','L’Occitane','L’Occitane au Brésil','Dove','Nivea','L’Oréal Paris','Garnier','Maybelline','Revlon','Vult','Dailus','Ruby Rose','Quem Disse, Berenice?','Bruna Tavares','Mari Maria','MAC','Clinique','Lancôme','Dior','Chanel','Carolina Herrera','Paco Rabanne','Calvin Klein','Versace','La Roche-Posay','Vichy','Avène','Bioderma','Cetaphil','CeraVe','Neutrogena','Sallve','Principia','Simple Organic','Tracta','Payot','Océane','Seda','Pantene','TRESemmé','Salon Line','Skala','Lola Cosmetics','Wella','Elseve','L’Oréal Professionnel','Keune','Schwarzkopf','Kérastase','Bio Extratus','Inoar','Haskell','Forever Liss','Risqué','Colorama','Impala','Granado','Phebo','Johnson’s','Monange','Dermacyd','Adcos'];
export function categoriesFor(segment,niche,fallback){return segment==='Beleza e cuidados pessoais'&&['Cosméticos','Perfumaria'].includes(niche)?cosmeticTypes:fallback;}
