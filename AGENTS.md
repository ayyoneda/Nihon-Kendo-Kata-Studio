# Nihon Kendo Kata Studio — Regras e Diretrizes do Projeto

Este repositório contém a ferramenta **Nihon Kendo Kata Studio**, concebida e orientada pelo Prof. Adrian Yoneda (Renshi 7º Dan — Brasil).

Qualquer agente de IA que atue neste projeto deve obrigatoriamente seguir as diretrizes abaixo:

1. **Documentação e Skill de Referência:**
   - Consulte o arquivo `docs/PROJECT_DOCUMENTATION.md` para entender a arquitetura completa e lições aprendidas.
   - Utilize a skill `.agents/skills/nihon-kendo-kata-studio/SKILL.md` para regras de codificação do motor de sincronização.

2. **Diretrizes Inegociáveis:**
   - **Zero-Hosting:** Não armazene arquivos de vídeo locais. Toda a reprodução é feita através da YouTube IFrame API oficial, respeitando copyright.
   - **Ancoragem Matemática pelo Clímax:** Katas operam em tempos relativos com $t = 0.0s$ no golpe decisivo (ou no primeiro passo no modo início).
   - **Barreira de Fim de Kata (Dual-Clock):** Sempre verificar o tempo interno do YouTube (`getCurrentTime() >= kata.end - 0.15s`) para evitar invasão do kata seguinte.
   - **Segurança de Acesso:** O botão do Calibrador é restrito ao desenvolvedor/admin e só deve ser exibido em `localhost` ou `127.0.0.1`.
   - **Qualidade e Estabilidade:** Execute sempre `npm test` e `npm run build` antes de finalizar qualquer modificação.
