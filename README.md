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
