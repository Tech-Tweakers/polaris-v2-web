# 🛡️ Branch Protection Setup

## 📋 **Configuração Necessária**

Para que o auto-merge funcione corretamente, você precisa configurar as branch protections no GitHub:

### **1. Main Branch Protection**

```bash
# Vá para Settings > Branches > Add rule
Branch name pattern: main

# Marque as seguintes opções:
✅ Require a pull request before merging
✅ Require approvals (1 ou mais)
✅ Dismiss stale PR approvals when new commits are pushed
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging

# Status checks obrigatórios:
✅ Auto Merge to Main
✅ Auto Deploy
```

### **2. Develop Branch Protection**

```bash
# Vá para Settings > Branches > Add rule
Branch name pattern: develop

# Marque as seguintes opções:
✅ Require a pull request before merging
✅ Require approvals (1 ou mais)
✅ Require status checks to pass before merging
```

### **3. Secrets Necessários**

```bash
# Vá para Settings > Secrets and variables > Actions
# Adicione os seguintes secrets:

SLACK_WEBHOOK_URL: https://hooks.slack.com/services/...
DEPLOY_SSH_KEY: chave SSH para deploy
DEPLOY_HOST: host do servidor
DEPLOY_PATH: caminho no servidor
```

## 🔄 **Fluxo de Trabalho**

### **Desenvolvimento:**
1. **Crie uma branch** a partir de `develop`
2. **Faça suas mudanças** e commits
3. **Abra um PR** para `develop`
4. **Após aprovação**, merge para `develop`

### **Auto-Merge (A cada hora):**
1. **GitHub Actions verifica** mudanças em `develop`
2. **Se houver mudanças**, faz merge para `main`
3. **Cria tag** automática
4. **Dispara deploy** automático

### **Deploy:**
1. **Build** da aplicação
2. **Build** dos executáveis Electron
3. **Upload** para servidor
4. **Health checks**
5. **Criação de release**

## 🚨 **Troubleshooting**

### **Merge falhou:**
- Verifique conflitos entre `develop` e `main`
- Use "Force merge" se necessário
- Resolva conflitos manualmente se persistir

### **Deploy falhou:**
- Verifique logs do workflow
- Confirme se o servidor está acessível
- Verifique permissões SSH/credenciais

### **Notificações não funcionam:**
- Confirme se `SLACK_WEBHOOK_URL` está configurado
- Verifique se o webhook do Slack está ativo
- Confirme se o canal `#deployments` existe

## 📊 **Monitoramento**

### **GitHub Actions:**
- Acompanhe execução em tempo real
- Configure notificações de email
- Use GitHub CLI para status: `gh run list`

### **Slack:**
- Canal `#deployments` para notificações
- Webhook para status automático
- Integração com outros serviços se necessário

## 🔧 **Personalização**

### **Frequência do Merge:**
```yaml
# Em .github/workflows/auto-merge.yml
schedule:
  - cron: '0 * * * *'  # A cada hora
  # Outras opções:
  # '0 */2 * * *'      # A cada 2 horas
  # '0 9-17 * * *'     # Das 9h às 17h
  # '0 9,17 * * *'     # 9h e 17h
```

### **Branches de Origem:**
```yaml
# Verifica mudanças em múltiplas branches
push:
  branches:
    - develop
    - staging
    - feature/auto-merge
```

### **Condições de Merge:**
```yaml
# Só faz merge se:
- Não houver conflitos
- Tests passarem
- Build for bem-sucedido
- Code review aprovado
```



