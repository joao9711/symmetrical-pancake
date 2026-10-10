// Catálogo amplo; campos personalizados permitem atividades fora das sugestões.
export const segments={
 'Beleza e cuidados pessoais':{'Cosméticos':['Hidratantes','Maquiagem','Produtos capilares'],'Perfumaria':['Perfumes','Colônias'],'Salão e estética':['Corte de cabelo','Manicure','Tratamento facial']},
 'Alimentação e bebidas':{'Refeições':['Marmitas','Pratos preparados'],'Doces e confeitaria':['Bolos','Doces','Sobremesas'],'Bebidas':['Sucos','Café','Bebidas engarrafadas']},
 'Moda e acessórios':{'Roupas':['Camisetas','Vestidos','Calças'],'Calçados':['Tênis','Sandálias'],'Acessórios':['Bolsas','Bijuterias','Relógios']},
 'Casa e decoração':{'Utilidades domésticas':['Utensílios','Organizadores'],'Móveis e decoração':['Móveis','Quadros','Luminárias']},
 'Construção e manutenção':{'Materiais de construção':['Tintas','Ferramentas','Materiais elétricos'],'Reparos e instalação':['Reparo hidráulico','Instalação elétrica','Pintura']},
 'Tecnologia e eletrônicos':{'Eletrônicos':['Celulares','Acessórios','Computadores'],'Informática e software':['Suporte técnico','Desenvolvimento de sistemas','Manutenção de computador']},
 'Saúde e bem-estar':{'Produtos de bem-estar':['Suplementos','Equipamentos'],'Atendimento e cuidados':['Consulta','Sessão de terapia','Acompanhamento']},
 'Educação e treinamento':{'Cursos e aulas':['Aula particular','Curso','Treinamento'],'Materiais educativos':['Livros','Apostilas','Material escolar']},
 'Serviços profissionais':{'Consultoria e administração':['Consultoria','Assessoria','Organização administrativa'],'Marketing e criação':['Design','Gestão de redes sociais','Produção de conteúdo'],'Serviços domésticos':['Limpeza','Organização','Jardinagem']},
 'Transporte e logística':{'Entregas e transporte':['Entrega','Frete','Transporte de passageiros'],'Armazenagem':['Armazenamento','Separação de pedidos']},
 'Automotivo':{'Peças e acessórios':['Peças','Pneus','Acessórios automotivos'],'Oficina e cuidados':['Revisão','Lavagem','Manutenção']},
 'Agropecuária':{'Produção rural':['Frutas','Hortaliças','Grãos'],'Insumos e serviços rurais':['Sementes','Ração','Serviço agrícola']},
 'Animais e pet':{'Produtos pet':['Ração','Brinquedos','Acessórios pet'],'Cuidados pet':['Banho e tosa','Passeio','Hospedagem pet']},
 'Artesanato e indústria':{'Artesanato':['Peças artesanais','Presentes personalizados'],'Fabricação':['Peças fabricadas','Embalagens','Produtos sob encomenda']},
 'Turismo e hospedagem':{'Hospedagem':['Diária','Pacote de hospedagem'],'Turismo':['Passeio','Excursão','Roteiro']},
 'Eventos e entretenimento':{'Eventos':['Organização de evento','Decoração','Buffet'],'Entretenimento':['Apresentação','Locação de equipamentos']},
 'Imóveis e locações':{'Imóveis':['Locação de imóvel','Administração de imóvel'],'Locação de bens':['Aluguel de ferramentas','Aluguel de máquinas']},
 'Esporte e lazer':{'Artigos esportivos':['Roupas esportivas','Equipamentos esportivos'],'Atividades':['Aula de esporte','Treino','Atividade recreativa']},
 'Finanças e seguros':{'Serviços financeiros':['Consultoria financeira','Gestão financeira'],'Seguros':['Assessoria em seguros','Serviço de corretagem']},
 'Comércio em geral':{'Varejo':['Produto de revenda','Produto próprio'],'Atacado':['Lote de produtos','Kit de produtos']}
};
export const niches=segment=>Object.keys(segments[segment]||{});
export const suggestions=(segment,niche)=>segments[segment]?.[niche]||[];
