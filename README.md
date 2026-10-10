# Meu Equilíbrio
Aplicativo de finanças pessoais em português, com login e interface responsiva para notebook e celular. JavaScript nativo e SQLite, sem dependências externas.

## Executar
Requer Node.js 22.13 ou superior (SQLite integrado). Execute `npm start` neste checkout. A porta padrão é 3000; altere com `PORT`. Execute `npm test` para testar os cálculos financeiros.

## Recursos
- Cadastro e login com senha de 10 a 128 caracteres; senhas derivadas com scrypt, sessões HttpOnly, limitação de tentativas e validação de origem.
- Receitas e despesas por mês, categorias, saldo e limite com meta de reserva configurável. Avisos a partir de 80% do orçamento e ao excedê-lo.
- Dívidas com credor, saldo devedor, vencimento, observações, situação de atraso, quitação e total em aberto. A quitação não gera uma despesa automaticamente: registre o pagamento no orçamento. Parcelamento e pagamentos parciais ainda não estão implementados.
- Backup JSON por conta. Importar substitui os dados da conta após confirmação.
- Mesma conta e dados em vários aparelhos conectados ao mesmo servidor. Atualize a página para carregar mudanças feitas em outro aparelho. Conflitos de salvamento são rejeitados para evitar sobrescrever alterações.

## Hospedagem
Para uso fora deste ambiente, hospede o servidor atrás de HTTPS e defina `COOKIE_SECURE=1`. Preserve o diretório `data/` em armazenamento persistente e mantenha backups do SQLite. O aplicativo não foi publicado; não há recuperação de senha, verificação de e-mail, PWA ou modo offline nesta versão. Não envie o banco de dados para o Git.

## Validação executada
Quatro testes de orçamento passaram. Teste de navegador em 390 e 1366 pixels validou cadastro, receitas, despesas, alerta de limite, dívida vencida, persistência após recarregar, quitação e logout. Testes HTTP validaram acesso pela mesma conta em sessões diferentes e isolamento entre contas. Não houve medição em hardware Intel Core i3 ou celular físico.

## Hospedagem gratuita preparada
A modalidade `npm run start:cloud` usa Supabase Auth e banco protegido por RLS, sem SQLite no Render. Veja DEPLOY.md, render.yaml e supabase/schema.sql. Requer SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY configurados no servidor. O serviço não foi publicado; a integração real depende de um projeto Supabase. A versão local continua disponível com npm start.

## Meu Negócio — cosméticos
Na área Meu Negócio, cadastre produtos com preço de venda, custo unitário e estoque inicial. O estoque inicial e as reposições são compras pagas que saem do caixa; registre um aporte quando utilizar dinheiro próprio. Aportes, despesas operacionais e retiradas são separados das finanças pessoais.

Registre uma venda com nome do cliente, produtos, quantidades, preços, data e vencimento. Recebimentos podem ser parciais e não podem exceder o saldo. A venda reduz o estoque; pagamentos aumentam o caixa. Os detalhes de cada cliente exibem produtos, preços unitários, subtotais, vencimento, situação e histórico de pagamentos. Use sempre o mesmo nome para reunir o cliente.

Caixa, aportes, valores a receber e estoque a custo são acumulados; lucro, receita recebida e saídas usam o mês selecionado. Lucro = vendas do mês − custo dos produtos vendidos − despesas operacionais do mês. Custo de estoque usa média ponderada do estoque restante, com o total do custo de cada item congelado na venda e calculado em centavos. Reposição posterior não altera o lucro de vendas anteriores. O lucro de uma venda fiada é reconhecido na data da venda; sua receita de caixa só entra quando paga. Compras de estoque não são descontadas novamente do lucro. O alerta compara recebimentos de clientes com todas as saídas do mês, incluindo estoque e retiradas; aportes não são receita de vendas.

Dados do negócio são armazenados no mesmo JSON por conta, protegidos pelo RLS e controle de versão existentes. Não requer novo SQL no Supabase. Backups incluem a área do negócio; importar um backup substitui todos os dados pessoais e do negócio. Ainda não há compras a prazo, parcelamento com múltiplos vencimentos, devoluções, edição/cancelamento de vendas ou controle de validade.

Validação da atualização: 16 testes automatizados passaram. Fluxo de navegador em 390 e 1366 pixels validou aporte, dois produtos, venda com múltiplos itens, estoque insuficiente, recebimento parcial e quitação, pagamento excedente, reposição com custo diferente, lucro, caixa, persistência em outra sessão e preservação das finanças pessoais. A integração publicada no Render deve ser conferida após o deploy automático.
