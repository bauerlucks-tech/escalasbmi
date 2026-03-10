# Sistema de Importação de Escala CSV

## Formato do Arquivo

O sistema aceita arquivos CSV com o seguinte formato:

### Colunas Obrigatórias
- `data`: Data no formato DD/MM/YYYY ou DD (apenas o dia)
- `posto`: Tipo de turno (`meio_periodo` ou `fechamento`)
- `colaborador`: Nome do colaborador (deve estar cadastrado no sistema)

> **Importante**: O dia da semana é calculado automaticamente pela data, não precisa ser informado.

### Exemplo de Arquivo CSV
```csv
data,posto,colaborador
01/02/2026,meio_periodo,LUCAS
01/02/2026,fechamento,CARLOS
02/02/2026,meio_periodo,ROSANA
02/02/2026,fechamento,HENRIQUE
```

## Validações Realizadas

1. **Formato das Colunas**: Verifica se todas as colunas obrigatórias estão presentes
2. **Datas**: Valida se as datas estão em formato válido e calcula o dia da semana automaticamente
3. **Colaboradores**: Confirma que todos os colaboradores estão cadastrados no sistema
4. **Postos**: Verifica se o posto é "meio_periodo" ou "fechamento"

## Como Usar

1. **Baixar Template**: Clique em "Baixar Template" para obter um arquivo CSV no formato correto
2. **Preencher Dados**: Edite o arquivo com as informações da escala (apenas data, posto e colaborador)
3. **Selecionar Mês/Ano**: Escolha o mês e ano correspondente à escala
4. **Importar Arquivo**: Clique em "Importar CSV" e selecione o arquivo
5. **Validação**: O sistema irá validar e mostrar os resultados
6. **Confirmar**: Se estiver tudo correto, clique em "Confirmar Importação"

## Observações

- A importação **substitui completamente** a escala atual
- Apenas colaboradores cadastrados no sistema são aceitos
- O sistema calcula automaticamente o dia da semana com base na data
- O sistema gera estatísticas após a importação bem-sucedida
- Erros e avisos são exibidos para facilitar a correção

## Alternativas de Nomes de Colunas

O sistema aceita variações nos nomes das colunas:

- **data**: data, date, dia
- **posto**: turno, shift, position, periodo
- **colaborador**: nome, employee, name, operador

## Abreviações Aceitas para Postos

- **meio_periodo**: meio, manha, tarde, mp, m
- **fechamento**: noite, fech, f, n

## Vantagens do Novo Formato

- **Menos propenso a erros**: Não é necessário digitar o dia da semana
- **Mais simples**: Apenas 3 colunas em vez de 4
- **Cálculo automático**: O dia da semana é sempre correto
- **Maior consistência**: Evita erros de digitação nos dias da semana
