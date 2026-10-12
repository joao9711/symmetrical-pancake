# Meu Equilíbrio
Aplicativo leve e responsivo de finanças pessoais e negócios, em português. JavaScript nativo, sem dependências externas.

## Executar
Requer Node.js 22.13 ou superior. `npm start` usa autenticação e SQLite locais em `data/finance.db`. `npm run start:cloud` usa Supabase Auth e banco protegido por RLS; configure `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. Não use service_role ou uma chave secret. Porta padrão 3000, ajustável por `PORT`. Execute `npm test` para testar os cálculos e a validação.

A publicação no Render segue `render.yaml` com plano Free. Veja [DEPLOY.md](DEPLOY.md). Para uso público mantenha HTTPS e `COOKIE_SECURE=1`. Mantenha backups; planos gratuitos podem suspender serviços e possuem limites.

## Finanças pessoais
- Receitas e despesas avulsas, categorias personalizadas e meta de reserva de 0 a 100%.
- Receitas/despesas fixas: Tipo tem apenas Receita e Despesa. Categorias de receita incluem Salário mensal, Aposentadoria, Pensão, Aluguel de imóveis, Aluguel de equipamentos, Prestação de serviços, Mensalidades e Rendimentos financeiros. Outros permite criar e reutilizar sua preferência.
- Fixos aparecem automaticamente todo mês, sem materializar duplicatas. Recebimento/pagamento precisa ser confirmado para entrar no saldo realizado. Dias 29–31 são ajustados em meses menores.
- Alterações de fixos valem no mês escolhido e seguintes, substituindo mudanças futuras previamente programadas da regra. Meses anteriores e valores já confirmados ficam preservados. Pode ignorar só um mês, desfazer confirmação ou desativar a repetição.
- Dívidas: total original, saldo restante, parcela mensal, categoria, primeiro vencimento e pagamentos parciais. Cada pagamento registrado reduz o saldo e gera uma despesa vinculada automaticamente. Desfazer remove a despesa e reabre o saldo juntos. Não lance essa mesma parcela novamente como despesa fixa ou avulsa.
- Orçamento mensal compara previsto e realizado, incluindo somente parcelas previstas do mês, gastos e reserva. Pagamento parcial mantém no previsto somente o saldo restante da parcela, sem duplicação.
- Alerta de orçamento mensal negativo. A seção Visão geral/orçamento total, suas configurações e projeção foram removidas da tela a pedido do usuário. Dados anteriormente salvos continuam preservados nos backups.

Valores de dívida devem incorporar os encargos conhecidos; pagamentos reduzem integralmente o saldo declarado. Juros novos precisam de ajuste manual. As dívidas antigas continuam com seus dados originais: edite para informar o total original e a parcela, pois esses valores não podem ser inferidos. Dívidas antigas marcadas quitadas continuam quitadas, sem criar despesas retroativas.

## Meu Negócio
- Catálogo amplo de segmentos, nichos e sugestões de produtos/serviços. Outro permite cadastrar atividades e categorias fora da lista. Você pode cadastrar vários segmentos. Cada espaço mantém seus próprios produtos, estoque, vendas, clientes, pagamentos e caixa. Trocar de segmento não mistura os registros.
- Produtos com estoque e reposições pagas; serviços sem estoque. Produtos reduzem estoque nas vendas. Custo usa média ponderada do estoque restante e o custo total de cada item é congelado na venda em centavos.
- Serviços podem ter custo direto: esse custo é considerado pago ao confirmar a venda e é descontado uma vez do caixa e do lucro. Não registre novamente o mesmo custo como despesa operacional.
- Vendas com múltiplos itens, nome do cliente, preços individuais, data, vencimento, recebimentos parciais e situação pendente/parcial/paga/atrasada. Use o mesmo nome para reunir as compras de um cliente.
- Caixa, aportes, recebíveis e estoque são acumulados; lucro, recebimentos e saídas seguem o mês selecionado.
- Lucro = vendas − custo dos itens vendidos − despesas operacionais. Venda fiada reconhece lucro na data da venda; caixa só recebe quando paga. Compras de estoque não são descontadas novamente do lucro.
- Aportes não são receita; retiradas não alteram lucro. Ao retirar dinheiro, é possível registrar a receita correspondente na área pessoal em uma única operação, sem duplicar movimentos.
- Alertas comparam recebimentos dos clientes e saídas do mês, incluindo estoque, custos diretos e retiradas.

## Dados e limites
Novos recursos ficam no JSON por conta já existente; não requerem novo SQL no Supabase. Backups incluem todas as áreas e opções personalizadas. Importar substitui todos os dados da conta após confirmação. Atualize a página para carregar mudanças feitas em outro aparelho; salvamentos conflitantes são rejeitados. O caixa do negócio continua separado das finanças pessoais, exceto transferências explicitamente escolhidas.

Ainda não há compras a prazo para estoque, múltiplos vencimentos de uma mesma venda, devoluções, edição/cancelamento de vendas, verificação de validade de produtos, PWA ou modo offline. Não envie data/, arquivos .env ou credenciais ao Git.

## Validação da versão
29 testes de cálculo e validação passaram. Testes de navegador em 390 e 1366 pixels validaram cadastro, finanças fixas, edição histórica, dívidas e despesas vinculadas, categorias personalizadas, orçamento mensal/geral, segmento/nicho, produtos, serviços, estoque, vendas, pagamentos, transferências e persistência. Testes HTTP validaram isolamento entre contas, salvamento em outra sessão, conflitos e rejeição de pagamentos excedentes. O comando cloud iniciou e serviu todos os módulos em teste local; isso não verifica o Supabase real. O acesso de verificação ao domínio Render foi bloqueado pela política de rede deste ambiente; verifique Live após o deploy automático.

## Recuperação de senha
Na versão publicada, Esqueci minha senha envia um link pelo Supabase. O usuário abre o link e informa a nova senha duas vezes. A senha deve ter 10 a 128 caracteres. Tokens são removidos da URL e mantidos somente em memória até concluir ou cancelar; a senha só é alterada depois de validar o token no Supabase. Nenhum registro financeiro é modificado. Sessões de refresh são revogadas quando o provedor permite; tokens JWT já emitidos podem continuar válidos até a expiração.

O retorno usa a raiz HTTPS de PUBLIC_APP_URL, cujo padrão é https://meu-equilibrio.onrender.com. No Supabase, mantenha Site URL e redirecionamentos compatíveis com esse endereço e o template de recuperação padrão. Limites de e-mail do plano Supabase continuam aplicáveis. O modo SQLite local não envia e-mail e apresenta uma mensagem explicativa.

Validação: 37 testes passaram; teste de navegador com Supabase simulado exercitou envio, limite de solicitações, callbacks, senhas diferentes, sucesso e link inválido. A entrega real de e-mails não foi validada neste ambiente.

## Identidade visual e ícone
Logo própria aplicada no cabeçalho e no login. Favicon ICO, ícone Apple de 180px e ícones de 192/512px registrados no manifesto para atalhos e instalação pelo navegador. Assets são locais e não dependem de CDN. O manifesto usa modo standalone quando instalado por um navegador compatível; não implementa funcionamento offline. Para atualizar atalhos antigos que usam o ícone genérico, remova apenas o atalho e adicione novamente após a publicação (não limpe os dados da conta). O comportamento e os emblemas de atalhos dependem do navegador/Android. Arte original preservada em assets/logo-original.png; arquivos menores usados em execução.

## Salvar senha — preferência de acesso
A opção Salvar senha fica desmarcada por padrão. Ela mantém a sessão no aparelho, não armazena a senha em texto puro. Sem marcar, cookies são temporários e uma nova entrada/aba precisa de login; atualizar a mesma aba pode manter o acesso usando um marcador temporário em sessionStorage. Com opt-in explícito, a sessão usa cookies HttpOnly persistentes por até sete dias sem atividade, renováveis pelo Supabase. Renovações preservam a preferência; logout e redefinição de senha limpam os marcadores. Sessões persistentes antigas sem preferência registrada precisam de novo login. O salvamento/preenchimento de senha pelo navegador é independente dessa opção.

SQLite local adiciona colunas de sessão de forma automática, sem modificar dados financeiros. Não requer novo SQL no Supabase. Validação: 40 testes passaram; navegador validou comportamento temporário e persistente, e servidor cloud com Supabase simulado validou renovação e limpeza de cookies.

## Navegação e organização
O site agora apresenta uma tela por vez. Finanças pessoais tem Resumo do mês, Lançamentos, Contas fixas, Dívidas e Orçamento. Meu Negócio tem Resumo do negócio, Vendas e clientes, Produtos e serviços, Caixa e Meus segmentos. Conta e backup reúne exportação/importação e dados do acesso. No notebook a navegação fica na lateral; no celular todas as opções aparecem em um menu compacto.

Resumo mostra indicadores e atalhos, sem todos os cadastros na mesma página. Formulários ficam recolhidos até o usuário abrir e voltam a se recolher após salvar. Edições e atalhos abrem o formulário correto. Há busca em lançamentos, fixos, dívidas, produtos/serviços e clientes. Feedback de salvamento fica disponível em qualquer tela, com confirmação temporária. A organização só move componentes da interface; não altera registros nem cálculos. A seção de orçamento total removida anteriormente continua ausente.

Validação: 40 testes de cálculo/autenticação passaram; teste de navegador exercitou todas as telas e atalhos, formulários, buscas, pagamentos e os fluxos de negócio em notebook e celular.

## Vários segmentos de negócio
Em Meu Negócio > Meus segmentos, cadastre até 50 espaços com nome, segmento e nicho. O seletor Segmento ativo escolhe qual espaço aparece nas telas de resumo, produtos, vendas e caixa. Cadastros de produtos usam o segmento/nicho do espaço ativo; categorias continuam personalizáveis. Nomes são únicos para evitar confusão. Há edição do nome/classificação e exclusão somente de espaços sem registros.

Resumo de todos os segmentos é um consolidado explicitamente separado dos números individuais. Retiradas com transferência pessoal de todos os segmentos entram uma única vez na área pessoal, mesmo quando outro segmento está selecionado. Troca de segmento pede confirmação se houver formulário ou venda não salva; uma falha de salvamento restaura o seletor anterior.

Dados antigos de Meu Negócio são mantidos integralmente em um espaço anterior, com seu perfil existente quando disponível. A migração ocorre no primeiro salvamento de segmento e não tenta dividir automaticamente registros mistos antigos: não há informação confiável para repartir caixa e vendas entre atividades. Novos segmentos começam vazios e separados. Tudo é armazenado no JSON por conta, incluído nos backups e protegido pelo controle de versão existente; não requer novo SQL no Supabase. Backups antigos seguem aceitos.

Validação: 46 testes passaram. Navegador validou dois segmentos com produtos/clientes/vendas/caixas separados, consolidado, transferências pessoais de ambos, persistência, migração dos registros anteriores, falha de troca, cancelamento de troca com rascunho e telas notebook/celular.

## Cadastro de produto e reposição separados
Cadastrar produto não exige compra nem quantidade inicial e, por padrão, não altera estoque ou caixa. Informe nome, tipo/categoria, marca e preço unitário opcional. Cosméticos/perfumaria têm um catálogo amplo de tipos e marcas comuns (Avon, Natura, O Boticário e outras); Outros permite criar e reutilizar tipos e marcas fora da lista. Nome igual com marcas diferentes pode ter cadastros distintos.

Repor estoque lista os produtos já cadastrados. Cada compra registra quantidade, custo por unidade e data, aumentando estoque e atualizando custo médio e caixa. Não cria outro produto. Há um botão de reposição no próprio produto. Dentro do cadastro/edição, Registrar uma compra agora é opcional e permite salvar os mesmos dados de compra junto com o cadastro. Serviços continuam sem estoque.

A lista mostra quantidade disponível, vendidos, total comprado, preço de venda por unidade, custo médio por unidade e custo médio total do estoque. Editar cadastro permite atualizar marca, descrição, categoria e preço sem modificar estoque ou custos das compras já registradas. Não é possível converter produto/serviço quando há compras ou vendas; preços e descrições já registrados em vendas permanecem nas respectivas vendas. Registros antigos são preservados, com marca opcional quando desconhecida.

Validação: 47 testes passaram. Navegador validou cadastro sem compra/gasto, marca e categoria próprias, reposições repetidas no mesmo produto, compra opcional no cadastro e na edição, atualização de quantidade/custo médio, edição sem alteração de estoque, persistência e tela móvel.

### Dados de contato da conta
A criação de conta pede nome completo, e-mail e celular com DDD. Em Conta e backup, o titular pode atualizar nome e celular; o e-mail exibido é o endereço de autenticação. Os dados ficam separados dos lançamentos financeiros, no perfil do usuário (metadados Auth no Supabase; coluna profile na versão local). Contas anteriores continuam entrando sem preenchimento obrigatório retroativo. Não é necessário executar SQL adicional no Supabase.

Cadastrar o celular não ativa notificações de WhatsApp. O envio automático está pendente de integração com um provedor oficial e de agendamento independente da hospedagem gratuita, que suspende o servidor inativo. Nenhuma mensagem é enviada por esta versão.

O botão do perfil na navegação mostra os dois primeiros nomes do titular e abre informações pessoais, segurança e backup. A foto pode ser selecionada ou removida; alterações são confirmadas com Salvar meus dados. Imagens JPG, PNG e WebP até 5 MB são recortadas ao centro e reduzidas para JPEG de 160×160 no navegador antes do envio; apenas JPEG em data URI de até 65 mil caracteres é aceito pelo servidor. Sem foto, são usadas as iniciais. A redefinição de senha solicita um link pelo fluxo existente, sem exibir ou armazenar a senha no perfil.

### Calculadora no perfil
A tela Meu perfil inclui uma calculadora com soma, subtração, multiplicação, divisão, vírgula decimal, porcentagem, troca de sinal, apagar dígito e limpar. Funciona pelos botões ou pelo teclado quando a calculadora está em foco, sem alterar lançamentos ou guardar o histórico. Operações encadeadas seguem a ordem de entrada, como em uma calculadora básica; 200 + 10 % = 220 e 200 − 10 % = 180. Divisão por zero exibe erro e permite começar uma nova conta. Os valores são transitórios e são limpos ao entrar ou sair da conta.

### Exclusão de cadastros e vínculos
Os botões de exclusão exigem confirmação e não removem nada ao abrir a tela. Excluir segmento apaga todos os produtos, compras, vendas, pagamentos e movimentos de caixa somente desse segmento; retiradas transferidas deixam de compor as finanças pessoais. Outro segmento passa a ser ativo quando necessário, e excluir o último deixa a lista vazia.

Excluir produto ou serviço apaga compras, estoque, vendas que contêm esse item e pagamentos dessas vendas. Se uma venda contiver outros produtos, a confirmação destaca que a venda inteira será excluída e o estoque dos demais itens será recomposto; não se distribuem pagamentos arbitrariamente entre itens. Cadastros e movimentos sem vínculo permanecem.

Nas finanças pessoais, excluir dívida apaga pagamentos e despesas derivadas; excluir conta fixa apaga todas as versões, confirmações e exceções mensais. Excluir um lançamento confirmado de conta fixa desfaz apenas sua confirmação mensal; excluir um pagamento de dívida devolve o valor ao saldo pendente; excluir uma retirada transferida apaga também a movimentação correspondente no negócio. Excluir lançamento avulso remove apenas o registro selecionado. A confirmação informa cada efeito e os totais são recalculados.

A exclusão altera registros, não quita obrigações nem movimenta dinheiro real. Não há desfazer na interface; exporte backup antes se precisar. Backups exportados anteriormente continuam sendo arquivos independentes. Falhas de salvamento preservam o estado visível, e a verificação de versão evita sobrepor alterações de outro aparelho.

Cada aporte, despesa e retirada no histórico Caixa agora tem Excluir movimentação. A confirmação explica os efeitos e a exclusão bem-sucedida recalcula o resumo; retiradas transferidas também deixam de aparecer nas finanças pessoais. Aportes são registros separados dos produtos: excluir o produto apaga suas compras e vendas vinculadas, mas preserva o capital colocado no negócio. Para remover um aporte, exclua a movimentação correspondente no Caixa. O resumo possui um atalho para esse histórico.

Movimentações de caixa podem ser vinculadas a um produto/serviço do segmento pelo campo Cadastro vinculado. No histórico, escolha o cadastro e clique em Salvar vínculo para associar uma movimentação anterior. Excluir o produto também apaga aportes, despesas e retiradas explicitamente vinculados a ele; a confirmação informa a quantidade. Movimentações gerais ou vinculadas a outro produto permanecem. Não se associa automaticamente um aporte antigo com base no nome ou valor. Vínculos são validados no servidor para impedir referência a produto de outro segmento ou excluído.

### Organização do negócio
Catálogo e estoque reúne os produtos com um painel Informações vinculadas para consultar compras, vendas e movimentações associadas. Gerenciar cadastro agrupa edição e exclusão; Repor estoque permanece visível. O caixa distingue movimentações manuais e compras de estoque, mostra a quem pertence cada aporte/despesa/retirada e agrupa a alteração de vínculo e exclusão em Gerenciar movimentação. A reorganização é visual; os registros e cálculos existentes são preservados.

### Fragrâncias e volumes no mesmo produto
Em Catálogo e estoque, abra Fragrâncias e volumes dentro do produto para cadastrar combinações como Oud · 100 ml, Oud · 50 ml e Floral · 100 ml. Cada variação tem seu preço de venda, estoque e custo médio independentes; a quantidade representa frascos, enquanto ml descreve o volume de cada frasco. É possível editar nome, volume e preço sem alterar os nomes, preços e custos registrados nas vendas anteriores. A mesma combinação não pode ser repetida; variações não se aplicam a serviços.

Em Repor estoque e Nova venda, escolha primeiro o produto e depois a fragrância e volume. Uma venda pode conter várias combinações do mesmo produto. O servidor valida as referências e impede consumir estoque de outra variação. Totais do produto somam todas as combinações, mas o custo de cada venda é calculado apenas com o estoque da combinação escolhida.

Compras e vendas antigas sem variação permanecem separadas como Sem variação — registros anteriores. Elas não são distribuídas automaticamente nem duplicadas ao cadastrar variações. Ao editar um produto com variações, registre compras pelo formulário Repor estoque para selecionar a combinação correta. Excluir o produto remove também todas as variações e seus registros vinculados. Os vínculos de aportes/despesas permanecem no nível do produto.
