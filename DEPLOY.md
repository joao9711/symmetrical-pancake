# Publicar com Render e Supabase

A configuração gratuita está preparada em render.yaml. A publicação real depende de contas e projeto do usuário. Confira os preços e limites atuais nos painéis e mantenha o plano Free. Não selecione opções pagas para este fluxo.

1. Crie uma conta em https://supabase.com/dashboard e um projeto gratuito. A senha do banco deve ser guardada pelo usuário; não é necessária para o aplicativo.
2. No SQL Editor, execute o conteúdo de supabase/schema.sql. Isso cria armazenamento com isolamento por usuário (RLS) e atualização com controle de versão.
3. Em Authentication, mantenha a confirmação de e-mail habilitada. Configure uma senha mínima de 10 caracteres. Após obter o endereço Render, configure Site URL e Redirect URLs para esse endereço HTTPS. O usuário confirma o e-mail e depois volta ao aplicativo para entrar. Limites do envio de e-mails padrão podem impedir cadastros adicionais; verifique no painel.
4. Anote Project URL e a chave publishable (ou a chave anon legada). Não use service_role, secret key ou senha do banco. O servidor usa a chave pública e o token de cada usuário; o banco aplica RLS.
5. Os arquivos deste checkout precisam estar no repositório GitHub joao9711/symmetrical-pancake para o Render importar. Não inclua data/, senhas ou arquivos .env. O código ainda não foi enviado automaticamente.
6. Crie uma conta em https://dashboard.render.com/register. Em New > Blueprint, conecte o GitHub e selecione o repositório. Revise render.yaml e confirme o plano Free.
7. Preencha SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY nos campos do Render. COOKIE_SECURE deve permanecer 1. Instale o Blueprint.
8. Quando o serviço estiver disponível, abra o endereço HTTPS fornecido pelo Render, cadastre uma conta, confirme o e-mail e entre. Faça uma receita e uma dívida de teste. Entre com a mesma conta em outro aparelho e confira os registros. Atualize a página após alterações feitas no outro aparelho.

O servidor grátis pode suspender após inatividade e demorar para responder. Limites e regras de pausa do Supabase dependem do plano vigente. Faça backups regularmente usando Exportar backup. A modalidade cloud não usa SQLite; uma reinicialização Render não apaga os registros do Supabase. Não há migração automática das contas locais: crie a conta cloud e importe um backup dos lançamentos, se houver.

Validação disponível: cálculos financeiros e fluxo local em navegador. A integração real com Supabase e o acesso pelo Render ainda não foram validados por falta de projeto e configuração. Publicar o ambiente Codex não publica este serviço Render.

## Atualização de orçamento, dívidas e segmentos
Não execute novamente o SQL para estes recursos: novas informações são adicionadas ao JSON financeiro da conta. O fluxo existente de RLS e controle de versão continua sendo usado. Após a nova publicação ficar Live, atualize a página. Edite dívidas antigas para informar total original e parcela mensal; sem esse cadastro, o sistema utiliza o saldo anterior como compromisso previsto. Nunca registre como despesa avulsa uma parcela já paga na área de dívidas. Opções personalizadas são salvas por conta e incluídas no backup.

## Recuperação de senha
A atualização inclui Esqueci minha senha e não requer novo SQL. Em Authentication > URL Configuration, Site URL deve ser https://meu-equilibrio.onrender.com (endereço já configurado anteriormente). O redirecionamento utilizado é a raiz desse site. Se trocar o domínio, configure PUBLIC_APP_URL no Render e ajuste os URLs permitidos no Supabase. Mantenha o template de e-mail Reset Password padrão com ConfirmationURL; templates customizados devem preservar o tipo recovery. Teste o e-mail de recuperação em uma conta sua após a publicação, sem compartilhar links ou tokens.

### Confirmação de cadastro: redirecionamento e reenvio
O cadastro agora envia `redirect_to` explicitamente para a raiz de `PUBLIC_APP_URL` (padrão: https://meu-equilibrio.onrender.com/). O aplicativo trata o retorno de confirmação separadamente da recuperação de senha, remove tokens da barra de endereço e orienta a entrar após validar o usuário. Também há Reenviar confirmação do e-mail, sem necessidade de informar a senha.

No Supabase, Authentication > URL Configuration deve ter Site URL `https://meu-equilibrio.onrender.com` e Redirect URLs incluindo `https://meu-equilibrio.onrender.com/`. Sem esse endereço na lista permitida, o Supabase pode ignorar o redirecionamento solicitado e usar o Site URL antigo, como localhost. Essas configurações administrativas não são alteradas pelo código. Mantenha o template Confirm signup com `{{ .ConfirmationURL }}`; não use links fixos para localhost. Depois da correção, solicite um novo e-mail pelo aplicativo e use somente a mensagem mais recente; links antigos não são modificados e podem expirar ou já ter sido consumidos. Confirmação por e-mail permanece habilitada. Limites do serviço de e-mail exigem aguardar ou configurar um provedor SMTP; não são contornados pelo aplicativo.

### Compatibilidade e validação do login
Senhas de contas existentes são encaminhadas ao Supabase sem exigir o mínimo atual de cadastro, preservando acesso a contas anteriores. Novas contas e redefinições continuam exigindo 10 a 128 caracteres. O cadastro pede confirmação de senha para evitar erros de digitação e bloqueia envios simultâneos. Erros de credenciais, confirmação pendente, limite de envio e indisponibilidade/configuração do serviço recebem orientações específicas. Falhas no pedido de e-mail não são apresentadas como links expirados. Uma senha incorreta continua sendo recusada; o aplicativo não redefine senhas ou confirma usuários sem comprovação pelo fluxo do Supabase.

### Entrar com Google (configuração obrigatória para ativar)
O botão foi implementado, mas não ativa sozinho o provedor. Em Google Cloud Console, crie um cliente OAuth do tipo Aplicativo da Web; configure a tela de consentimento para usuários externos e publique em produção para permitir público fora da lista de teste. Cadastre a URI de redirecionamento autorizada exatamente como o callback exibido em Supabase > Authentication > Sign In / Providers > Google (formato `https://SEU-PROJETO.supabase.co/auth/v1/callback`). Cole Client ID e Client Secret exclusivamente nesse painel do Supabase e habilite Google. Não coloque o segredo no aplicativo, GitHub ou conversa. Use somente os escopos de identificação básicos.

Em Authentication > URL Configuration, mantenha Site URL `https://meu-equilibrio.onrender.com` e adicione Redirect URL `https://meu-equilibrio.onrender.com/?google_callback=1`, além da raiz já utilizada pelos e-mails. O aplicativo usa PKCE com verificador temporário em cookie HttpOnly, valida o retorno no servidor e respeita Salvar senha. O cadastro por e-mail é preservado; quem entra via Google pode completar nome e celular no perfil. O nome do Google é usado como padrão; não carregamos a foto remota automaticamente.

### Limites de envio de e-mail para público
A aplicação não pode aumentar quotas administrativas com a chave pública. Verifique Authentication > Rate Limits e a configuração de SMTP no painel. O remetente padrão do Supabase tem quota e restrições próprias para destinatários; aumentar apenas um número no painel não remove esses limites. Para maior capacidade e entrega a usuários do público em geral, configure SMTP próprio e confirme as condições do provedor; planos gratuitos podem exigir domínio verificado e ter quota. Sem essa configuração, não há promessa de aumento do volume de e-mails. O login Google não usa o remetente de confirmação do Supabase.

### Páginas públicas para o Branding do Google
As rotas `/privacidade` e `/termos` ficam disponíveis sem login e há links na tela de acesso. Após o deploy ficar Live, confira os endereços publicados antes de informá-los no Google Auth Platform > Branding:
- Página inicial: `https://meu-equilibrio.onrender.com`
- Política de Privacidade: `https://meu-equilibrio.onrender.com/privacidade`
- Termos de Serviço: `https://meu-equilibrio.onrender.com/termos`
O preenchimento desses links não garante aprovação ou liberação do Google; verifique os avisos restantes no painel. Os textos descrevem o funcionamento atual e usam o e-mail de suporte configurado pelo responsável na tela de consentimento. Atualize o contato e o conteúdo quando o tratamento de dados ou condições do serviço mudar.
