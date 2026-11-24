const formatosC = [
  ['%d', 'Mostra ou lê um número inteiro. Exemplo: 12.'],
  ['%f', 'Mostra um número decimal com printf. Em scanf, lê um valor para uma variável float.'],
  ['%.2f', 'Em printf, mostra um número com duas casas decimais. Exemplo: 7.50.'],
  ['%c', 'Mostra ou lê um caractere. Exemplo: A.'],
  ['%s', 'Em printf, mostra um texto.'],
  ['%%', 'Em printf, mostra o símbolo % literalmente.']
];

const missoes = [
  { titulo: 'Primeiro programa', tema: 'Biblioteca, main e printf', etapas: [
    {
      titulo: 'Prepare o arquivo C',
      referencia: [
        ['#include', 'Inclui as declarações de um cabeçalho. Escreva a diretiva em sua própria linha.'],
        ['<stdio.h>', 'Cabeçalho de entrada e saída padrão. Disponibiliza as declarações de printf e scanf.'],
        ['//', 'Inicia um comentário. O restante da linha serve para explicar o código.']
      ],
      conceito: 'O código-fonte é o texto do programa. O compilador verifica e traduz esse texto. A diretiva #include <stdio.h> disponibiliza as declarações para entrada e saída.',
      tarefa: 'Escreva #include <stdio.h> acima do comentário e clique em Verificar código.',
      dicas: ["A primeira linha começa com #include.", "O nome da biblioteca é stdio.h e fica entre < e >.", "Digite #include <stdio.h> em uma linha acima do comentário."],
      exemplosDica: ["// Diretivas vêm antes de main.", "<stdio.h>", "#include <stdio.h>"],
      codigo: '// Prepare a biblioteca de entrada e saída.\n',
      sintaxe: true,
      verificar: fonte => /^\s*#\s*include\s*<stdio\.h>/m.test(fonte),
      explicacao: 'A biblioteca está disponível. Na etapa seguinte, você vai escrever a função que inicia o programa.'
    },
    {
      titulo: 'Crie a função principal',
      referencia: [
        ['main', 'Função em que o programa começa.'],
        ['int', 'Indica que a função devolve um número inteiro.'],
        ['void', 'Dentro dos parênteses de main, indica que ela não recebe argumentos.'],
        ['{ }', 'Marcam o início e o fim do bloco da função.'],
        ['return 0;', 'Encerra main e informa que o programa terminou com sucesso.']
      ],
      conceito: 'A função main é o ponto de partida. O bloco fica entre chaves. return 0; sinaliza que o programa chegou ao fim com sucesso.',
      tarefa: 'Substitua o comentário pela função principal. Use int main(void) e coloque return 0; dentro do bloco.',
      dicas: ["Todo programa executável precisa da função main.", "A assinatura é int main(void). Depois dela, abra e feche as chaves.", "Dentro das chaves, escreva return 0; para encerrar com sucesso."],
      exemplosDica: ["main", "int main(void) {\n    // Instruções do programa\n}", "return 0;"],
      codigo: '#include <stdio.h>\n\n// Escreva a função principal.\n',
      testes: [['', '']],
      pergunta: 'O que deve aparecer na saída se o programa só tem return 0;?',
      opcoes: ['Nada', 'O número 0'],
      explicacao: 'return 0 informa ao sistema que o programa terminou com sucesso. Para escrever na tela, use uma função como printf.'
    },
    {
      titulo: 'Escreva no terminal',
      referencia: [
        ['printf', 'Escreve na saída do programa. Coloque a mensagem entre aspas.'],
        ['\\n', 'Pula para a próxima linha. Vai dentro das aspas.'],
        [';', 'Encerra uma instrução, como uma chamada de printf.'],
        ...formatosC
      ],
      saidaTextual: true,
      conceito: 'printf escreve texto entre aspas. A sequência \\n pula uma linha. O ponto e vírgula encerra cada chamada.',
      tarefa: 'Complete o primeiro printf para mostrar Bem-vindo ao sistema de notas! e escreva outro para mostrar Vamos calcular medias! na linha seguinte.',
      dicas: ["Cada mensagem precisa da sua própria chamada de printf.", "Para pular a linha, coloque \\n dentro das aspas, depois do texto.", "A segunda chamada é printf(\"Vamos calcular medias!\\n\");. Coloque-a antes de return 0;."],
      exemplosDica: ["printf(\"Uma mensagem\");", "printf(\"Linha de exemplo\\n\");", "printf(\"Vamos calcular medias!\\n\");"],
      codigo: String.raw`#include <stdio.h>

int main(void) {
    printf("_____\n");
    // Escreva o segundo printf aqui.
    return 0;
}`,
      testes: [['', 'Bem-vindo ao sistema de notas!\nVamos calcular medias!']],
      pergunta: 'Qual trecho faz a segunda mensagem aparecer em outra linha?',
      opcoes: ['A sequência \\n', 'O ponto e vírgula'],
      explicacao: 'A sequência \\n pula uma linha. O ponto e vírgula indica o fim da instrução no código.'
    }
  ] },
  { titulo: 'Calculando a média', tema: 'float, scanf e operações', etapas: [
    {
      titulo: 'Leia duas notas',
      exemploEntrada: 'Ex.: 6 8',
      lembreteEntrada: 'Digite duas notas separadas por espaço, como 6 8, ou escolha um exemplo. Depois clique em Executar para mostrar os valores lidos.',
      referencia: [
        ['float', 'Tipo usado para guardar notas com casas decimais.'],
        ['&', 'Em &nota1, indica a scanf onde guardar o valor lido.'],
        ...formatosC
      ],
      conceito: 'float guarda números com casas decimais. Em scanf, %f lê um float e & indica onde guardar o número.',
      tarefa: 'Escreva uma chamada de scanf para cada nota. O programa deve mostrar os dois valores lidos. Use ponto nas notas decimais.',
      dicas: ["Use scanf para ler cada valor na ordem em que aparece.", "O formato é %f porque as variáveis são float. Coloque & antes da variável de destino.", "A primeira linha é scanf(\"%f\", &nota1);. Na segunda, troque nota1 por nota2."],
      exemplosDica: ["scanf(\"formato\", &variavel);", "scanf(\"%f\", &valor);", "scanf(\"%f\", &nota1);"],
      codigo: String.raw`#include <stdio.h>

int main(void) {
    float nota1 = 0, nota2 = 0;
    // Leia nota1 e nota2 aqui.
    printf("Notas: %.2f e %.2f\n", nota1, nota2);
    return 0;
}`,
      testes: [['6 8', 'Notas: 6.00 e 8.00'], ['5.5 9', 'Notas: 5.50 e 9.00']],
      pergunta: 'Para a entrada 6 8, qual valor fica em nota2?',
      opcoes: ['8', '6'],
      explicacao: 'scanf consome os valores na ordem em que aparecem. A segunda chamada guarda 8 em nota2.'
    },
    {
      titulo: 'Calcule e mostre a média',
      exemploEntrada: 'Ex.: 6 8',
      lembreteEntrada: 'Digite duas notas separadas por espaço, como 6 8, ou escolha um exemplo. Depois clique em Executar para mostrar a média.',
      referencia: [
        ['=', 'Guarda na variável o resultado da expressão à direita.'],
        ['( )', 'Agrupam a soma para que ela aconteça antes da divisão.'],
        ['+ e /', 'Somam e dividem os valores, respectivamente.'],
        ...formatosC
      ],
      conceito: 'A média é a soma das notas dividida pela quantidade de notas. Em printf, %.2f mostra duas casas decimais.',
      tarefa: 'Substitua 0 na declaração de media pela expressão que soma as notas e divide o resultado por 2. Teste também uma média decimal.',
      dicas: ["Some as duas notas e divida a soma por 2.", "Coloque a soma entre parênteses para que ela ocorra antes da divisão.", "A linha fica float media = (nota1 + nota2) / 2;."],
      exemplosDica: ["soma / 2", "(valor1 + valor2) / 2", "float media = (nota1 + nota2) / 2;"],
      codigo: String.raw`#include <stdio.h>

int main(void) {
    float nota1 = 0, nota2 = 0;
    scanf("%f", &nota1);
    scanf("%f", &nota2);

    float media = 0;
    printf("Media: %.2f\n", media);
    return 0;
}`,
      testes: [['6 8', 'Media: 7.00'], ['5 8', 'Media: 6.50'], ['6.5 8.5', 'Media: 7.50']],
      pergunta: 'Antes de executar, qual é a média de 6 e 8?',
      opcoes: ['7.00', '10.00', '14.00'],
      explicacao: 'Os parênteses fazem a soma 6 + 8 acontecer primeiro. Dividir 14 por 2 resulta em 7.00.'
    }
  ] },
  { titulo: "Decisões com notas", tema: "if, else e comparações", etapas: [{
    conceito: "O if testa uma condição. Quando ela é falsa, o else assume. Neste exercício, 6 é o limite didático para aprovação.",
    tarefa: "Complete a condição para aprovar médias de 6 para cima. Execute com duas notas e confira o caso de média exatamente 6.",
    pergunta: "Com notas 6 e 6, qual situação deve aparecer?",
    opcoes: ["Aprovado", "Não aprovado"],
    explicacao: "O operador >= inclui o limite. Uma média igual a 6 entra no if, enquanto uma média menor entra no else.",
    referencia: [["if", "Executa um bloco quando a condição é verdadeira."], ["else", "Executa o bloco alternativo quando a condição é falsa."], [">=", "Significa maior ou igual. Inclui o valor de referência."]],
    dicas: ["Compare a média com o limite de aprovação.", "Use maior ou igual. Se usar apenas maior, a média 6 cai no else.", "Substitua o marcador dentro do if pela comparação completa."],
    titulo: "Decisões com notas",
    exemplosDica: ["if (condicao) { /* caso verdadeiro */ }", "media >= limite", "media >= 6.0"],
    exemploEntrada: "Ex.: 6 6",
    lembreteEntrada: "Preencha a entrada ou escolha um exemplo. Digite as notas separadas por espaço.",
    codigo: String.raw`#include <stdio.h>

int main(void) {
    float nota1, nota2, media;
    printf("Primeira nota: ");
    if (scanf("%f", &nota1) != 1) return 1;
    printf("Segunda nota: ");
    if (scanf("%f", &nota2) != 1) return 1;
    media = (nota1 + nota2) / 2;
    printf("Media: %.2f\n", media);
    if (_____ /* condição de aprovação */) {
        printf("Aprovado\n");
    } else {
        printf("Nao aprovado\n");
    }
    return 0;
}`,
    testes: [
      ["6 6", "Primeira nota: Segunda nota: Media: 6.00\nAprovado", "ok", "No limite"],
      ["4 6", "Primeira nota: Segunda nota: Media: 5.00\nNao aprovado", "ok", "Abaixo do limite"],
      ["7.5 8", "Primeira nota: Segunda nota: Media: 7.75\nAprovado", "ok", "Acima do limite"],
    ]
  }] },
  { titulo: "Validando as notas", tema: "Limites e operador ||", etapas: [{
    conceito: "As notas válidas vão de 0 a 10, inclusive. Com ||, uma única comparação verdadeira já torna a condição verdadeira.",
    tarefa: "Complete a condição para detectar notas fora de 0 a 10. Mostre o aviso e encerre antes de calcular a média.",
    pergunta: "Se a primeira nota for 0 e a segunda 10, o que deve acontecer?",
    opcoes: ["Calcular a média", "Recusar as duas notas"],
    explicacao: "0 e 10 são válidos. Se qualquer nota estiver abaixo de 0 ou acima de 10, o aviso aparece antes do cálculo.",
    referencia: [["||", "Ou lógico. Basta uma condição ser verdadeira."], ["< e >", "Testam se um valor está abaixo ou acima de um limite."], ["return 1;", "Encerra o programa indicando que a entrada foi recusada."]],
    dicas: ["Teste as duas notas, uma de cada vez.", "A primeira nota é inválida quando está abaixo de 0 ou acima de 10.", "Junte os testes das duas notas com ||."],
    titulo: "Validando as notas",
    exemplosDica: ["nota1 < 0", "nota1 < 0 || nota1 > 10", "nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10"],
    exemploEntrada: "Ex.: 0 10",
    lembreteEntrada: "Preencha a entrada ou escolha um exemplo. Digite as notas separadas por espaço.",
    codigo: String.raw`#include <stdio.h>

int main(void) {
    float nota1, nota2, media;
    printf("Primeira nota: ");
    if (scanf("%f", &nota1) != 1) return 1;
    printf("Segunda nota: ");
    if (scanf("%f", &nota2) != 1) return 1;
    if (_____ /* notas fora do intervalo */) {
        printf("Nota invalida. Use valores de 0 a 10.\n");
        return 1;
    }
    media = (nota1 + nota2) / 2;
    printf("Media: %.2f\n", media);
    if (media >= 6.0) {
        printf("Aprovado\n");
    } else {
        printf("Nao aprovado\n");
    }
    return 0;
}`,
    testes: [
      ["0 10", "Primeira nota: Segunda nota: Media: 5.00\nNao aprovado", "ok", "Limites válidos"],
      ["11 5", "Primeira nota: Segunda nota: Nota invalida. Use valores de 0 a 10.", "erro_execucao", "Primeira acima de 10"],
      ["5 -1", "Primeira nota: Segunda nota: Nota invalida. Use valores de 0 a 10.", "erro_execucao", "Segunda negativa"],
      ["-1 8", "Primeira nota: Segunda nota: Nota invalida. Use valores de 0 a 10.", "erro_execucao", "Primeira negativa"],
      ["5 11", "Primeira nota: Segunda nota: Nota invalida. Use valores de 0 a 10.", "erro_execucao", "Segunda acima de 10"],
    ]
  }] },
  { titulo: "Menu e repetição", tema: "do...while e opções", etapas: [{
    conceito: "do...while executa o bloco ao menos uma vez. Em seguida, o while decide se o menu volta a aparecer.",
    tarefa: "Complete a condição ao final do menu. A opção 1 calcula, opções inválidas mostram um aviso, e a opção 0 encerra. Digite todas as escolhas e notas na ordem em que o programa vai ler.",
    pergunta: "Depois de escolher 9, o que deve acontecer?",
    opcoes: ["Mostrar aviso e repetir o menu", "Encerrar o programa"],
    explicacao: "Enquanto a opção for diferente de 0, o laço volta ao menu. A opção inválida gera um aviso e permite tentar novamente.",
    referencia: [["do...while", "Executa o bloco e depois avalia a condição."], ["!=", "Compara se dois valores são diferentes."], ["==", "Compara igualdade. O sinal = sozinho atribui um valor."]],
    dicas: ["A decisão de repetir fica depois da chave que fecha o bloco do menu.", "O menu reaparece enquanto a opção for diferente da opção de saída.", "Como sair é 0, use uma comparação de diferença com opcao."],
    titulo: "Menu e repetição",
    exemplosDica: ["do { /* menu */ } while (condicao);", "opcao != valor_de_saida", "opcao != 0"],
    exemploEntrada: "Ex.: 1 6 8 0",
    lembreteEntrada: "Digite 1, duas notas e 0 para calcular e sair. Separe os valores por espaços. Exemplo: 1 6 8 0.",
    codigo: String.raw`#include <stdio.h>

int main(void) {
    int opcao;
    float nota1, nota2, media;

    do {
        printf("\n1 - Calcular media\n0 - Sair\nEscolha: ");
        if (scanf("%d", &opcao) != 1) return 1;
        if (opcao == 1) {
            printf("Digite duas notas: ");
            if (scanf("%f %f", &nota1, &nota2) != 2) return 1;
            if (nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10) {
                printf("Notas invalidas.\n");
            } else {
                media = (nota1 + nota2) / 2;
                printf("Media: %.2f\n", media);
                if (media >= 6) printf("Aprovado\n");
                else printf("Nao aprovado\n");
            }
        } else if (opcao != 0) {
            printf("Opcao invalida.\n");
        }
    } while (_____ /* repetir até sair */);
    printf("Ate logo!\n");
    return 0;
}`,
    testes: [
      ["1 6 8 0", "1 - Calcular media\n0 - Sair\nEscolha: Digite duas notas: Media: 7.00\nAprovado\n\n1 - Calcular media\n0 - Sair\nEscolha: Ate logo!", "ok", "Calcular e sair"],
      ["9 0", "1 - Calcular media\n0 - Sair\nEscolha: Opcao invalida.\n\n1 - Calcular media\n0 - Sair\nEscolha: Ate logo!", "ok", "Opção inválida"],
      ["1 11 5 1 4 6 0", "1 - Calcular media\n0 - Sair\nEscolha: Digite duas notas: Notas invalidas.\n\n1 - Calcular media\n0 - Sair\nEscolha: Digite duas notas: Media: 5.00\nNao aprovado\n\n1 - Calcular media\n0 - Sair\nEscolha: Ate logo!", "ok", "Corrigir e calcular"],
      ["0", "1 - Calcular media\n0 - Sair\nEscolha: Ate logo!", "ok", "Sair direto"],
    ]
  }] },
  { titulo: "Médias de vários alunos", tema: "for e vetores", etapas: [{
    conceito: "Um vetor guarda vários valores do mesmo tipo. O índice começa em 0. Use o mesmo índice do laço para guardar a média do aluno atual.",
    tarefa: "Complete o armazenamento de cada média e a condição do segundo for. Informe duas notas por aluno, até completar os três alunos.",
    pergunta: "Qual é o índice da primeira posição de medias?",
    opcoes: ["0", "1", "3"],
    explicacao: "O primeiro laço grava a média na posição i. O segundo percorre as mesmas posições, de 0 até TOTAL - 1.",
    referencia: [["medias[i]", "Acessa a posição i do vetor."], ["for", "Agrupa início, condição de repetição e atualização."], ["i++", "Acrescenta 1 ao índice a cada volta."], ["#define TOTAL 3", "Define TOTAL como a quantidade de alunos."]],
    dicas: ["Guarde a média na posição do aluno atual, usando i.", "Para calcular a média, some as notas antes de dividir por 2.", "No segundo for, continue enquanto i for menor que TOTAL."],
    titulo: "Médias de vários alunos",
    exemplosDica: ["medias[i] = valor;", "medias[i] = (nota1 + nota2) / 2;", "i < TOTAL"],
    exemploEntrada: "Ex.: 6 8 4 6 10 8",
    lembreteEntrada: "Digite seis notas, duas por aluno, separadas por espaços. Exemplo: 6 8 4 6 10 8.",
    codigo: String.raw`#include <stdio.h>
#define TOTAL 3

int main(void) {
    float medias[TOTAL];
    float nota1, nota2;
    int i;

    for (i = 0; i < TOTAL; i++) {
        printf("Aluno %d - digite duas notas: ", i + 1);
        if (scanf("%f %f", &nota1, &nota2) != 2) return 1;
        if (nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10) {
            printf("Notas invalidas. Reinicie o programa.\n");
            return 1;
        }
        _____ /* armazene a média */
    }
    for (i = 0; _____; i++) {
        printf("Aluno %d: %.2f\n", i + 1, medias[i]);
    }
    return 0;
}`,
    testes: [
      ["6 8 4 6 10 8", "Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: Aluno 1: 7.00\nAluno 2: 5.00\nAluno 3: 9.00", "ok", "Três alunos"],
      ["0 10 6.5 8.5 6 6", "Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: Aluno 1: 5.00\nAluno 2: 7.50\nAluno 3: 6.00", "ok", "Limites e decimais"],
      ["6 8 11 6", "Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Notas invalidas. Reinicie o programa.", "erro_execucao", "Nota inválida"],
    ]
  }] },
  { titulo: "Relatório da turma", tema: "Soma e contagem", etapas: [{
    conceito: "Um acumulador guarda a soma das médias. Um contador aumenta sempre que a média atinge o limite de aprovação.",
    tarefa: "Complete a soma acumulada e a condição que conta aprovados. O relatório deve mostrar cada situação, a média da turma e o total de aprovados.",
    pergunta: "Para médias individuais de 7, 5 e 9, quantos foram aprovados?",
    opcoes: ["2", "1", "3"],
    explicacao: "A soma começa em zero e recebe cada média. A média da turma é a soma dividida por TOTAL. O contador sobe apenas para médias de 6 ou mais.",
    referencia: [["soma = soma + valor", "Acrescenta valor ao total acumulado."], ["aprovados++", "Acrescenta 1 ao contador de aprovados."], ["%.2f", "Mostra um valor com duas casas decimais."]],
    dicas: ["A cada aluno, acrescente a média guardada nessa posição à soma anterior.", "O contador só aumenta se a média em medias[i] for pelo menos 6.", "Compare a média atual no if e mantenha aprovados++ como a ação."],
    titulo: "Relatório da turma",
    exemplosDica: ["soma = soma + valor;", "soma = soma + medias[i];", "medias[i] >= 6"],
    exemploEntrada: "Ex.: 6 8 4 6 10 8",
    lembreteEntrada: "Digite seis notas, duas para cada aluno, ou escolha uma turma de exemplo.",
    codigo: String.raw`#include <stdio.h>
#define TOTAL 3

int main(void) {
    float medias[TOTAL], nota1, nota2, soma = 0;
    int i, aprovados = 0;

    for (i = 0; i < TOTAL; i++) {
        printf("Aluno %d - digite duas notas: ", i + 1);
        if (scanf("%f %f", &nota1, &nota2) != 2) return 1;
        if (nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10) {
            printf("Notas invalidas. Reinicie o programa.\n");
            return 1;
        }
        medias[i] = (nota1 + nota2) / 2;
        _____ /* acumule a média */
        if (_____ /* média suficiente */) aprovados++;
    }
    printf("\n--- Relatorio ---\n");
    for (i = 0; i < TOTAL; i++) {
        printf("Aluno %d: %.2f - ", i + 1, medias[i]);
        if (medias[i] >= 6) printf("Aprovado\n");
        else printf("Nao aprovado\n");
    }
    printf("Media da turma: %.2f\n", soma / TOTAL);
    printf("Aprovados: %d de %d\n", aprovados, TOTAL);
    return 0;
}`,
    testes: [
      ["6 8 4 6 10 8", "Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: \n--- Relatorio ---\nAluno 1: 7.00 - Aprovado\nAluno 2: 5.00 - Nao aprovado\nAluno 3: 9.00 - Aprovado\nMedia da turma: 7.00\nAprovados: 2 de 3", "ok", "Dois aprovados"],
      ["6 6 6 8 9 9", "Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: \n--- Relatorio ---\nAluno 1: 6.00 - Aprovado\nAluno 2: 7.00 - Aprovado\nAluno 3: 9.00 - Aprovado\nMedia da turma: 7.33\nAprovados: 3 de 3", "ok", "Todos aprovados"],
      ["1 3 2 4 4 5", "Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: \n--- Relatorio ---\nAluno 1: 2.00 - Nao aprovado\nAluno 2: 3.00 - Nao aprovado\nAluno 3: 4.50 - Nao aprovado\nMedia da turma: 3.17\nAprovados: 0 de 3", "ok", "Nenhum aprovado"],
    ]
  }] },
  { titulo: "Projeto final", tema: "Cadastro, relatório e apresentação", etapas: [{
    conceito: "O menu reúne cadastro e relatório. cadastrados começa em 0, volta a 0 ao recadastrar e só vira 1 se todas as notas forem válidas.",
    tarefa: "Complete a condição que reconhece o cadastro completo e a que impede o relatório sem cadastro. Teste consultar antes de cadastrar, cadastrar e consultar, e recadastrar com nota inválida. Ao final, explique uma decisão, um laço e o cálculo da média.",
    pergunta: "Depois de cadastrar e tentar recadastrar com uma nota 11, o relatório deve abrir?",
    opcoes: ["Não, o novo cadastro está incompleto", "Sim, com parte dos dados novos", "Sim, com os dados antigos"],
    explicacao: "O cadastro só libera o relatório quando o for termina com i igual a TOTAL. Um break por nota inválida deixa cadastrados em 0. Na apresentação, explique esse controle, o laço do menu e o cálculo da média.",
    referencia: [["break", "Interrompe o laço atual. A execução continua na primeira instrução depois desse laço."], ["i == TOTAL", "Confere se o laço percorreu todos os alunos."], ["!cadastrados", "Fica verdadeiro quando cadastrados é 0."]],
    dicas: ["Um cadastro completo percorre todas as posições do vetor.", "Depois do for, compare i com TOTAL para identificar a conclusão.", "Na opção 2, use ! para testar se o cadastro está incompleto."],
    titulo: "Projeto final",
    exemplosDica: ["if (condicao) { cadastrados = 1; }", "i == TOTAL", "!cadastrados"],
    exemploEntrada: "Ex.: 2 0",
    lembreteEntrada: "Digite as opções e notas em sequência. Exemplo: 2 0 consulta o relatório e depois encerra.",
    codigo: String.raw`#include <stdio.h>
#define TOTAL 3

int main(void) {
    float medias[TOTAL], nota1, nota2, soma;
    int i, opcao, aprovados, cadastrados = 0;

    do {
        printf("\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: ");
        if (scanf("%d", &opcao) != 1) return 1;
        if (opcao == 1) {
            soma = 0;
            aprovados = 0;
            cadastrados = 0;
            for (i = 0; i < TOTAL; i++) {
                printf("Aluno %d - digite duas notas: ", i + 1);
                if (scanf("%f %f", &nota1, &nota2) != 2) return 1;
                if (nota1 < 0 || nota1 > 10 || nota2 < 0 || nota2 > 10) {
                    printf("Notas invalidas. Reinicie o cadastro.\n");
                    break;
                }
                medias[i] = (nota1 + nota2) / 2;
                soma = soma + medias[i];
                if (medias[i] >= 6) aprovados++;
            }
            if (_____ /* cadastro completo */) {
                cadastrados = 1;
                printf("Cadastro concluido.\n");
            }
        } else if (opcao == 2) {
            if (_____ /* cadastro incompleto */) {
                printf("Registre as notas primeiro.\n");
            } else {
                for (i = 0; i < TOTAL; i++) {
                    printf("Aluno %d: %.2f - ", i + 1, medias[i]);
                    if (medias[i] >= 6) printf("Aprovado\n");
                    else printf("Nao aprovado\n");
                }
                printf("Media da turma: %.2f\n", soma / TOTAL);
                printf("Aprovados: %d de %d\n", aprovados, TOTAL);
            }
        } else if (opcao != 0) {
            printf("Opcao invalida.\n");
        }
    } while (opcao != 0);
    printf("Ate logo!\n");
    return 0;
}`,
    testes: [
      ["2 0", "1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Registre as notas primeiro.\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Ate logo!", "ok", "Consultar antes de cadastrar"],
      ["1 6 8 4 6 10 8 2 0", "1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: Cadastro concluido.\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Aluno 1: 7.00 - Aprovado\nAluno 2: 5.00 - Nao aprovado\nAluno 3: 9.00 - Aprovado\nMedia da turma: 7.00\nAprovados: 2 de 3\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Ate logo!", "ok", "Cadastrar e consultar"],
      ["1 6 8 4 6 10 8 1 11 5 2 0", "1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: Cadastro concluido.\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Aluno 1 - digite duas notas: Notas invalidas. Reinicie o cadastro.\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Registre as notas primeiro.\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Ate logo!", "ok", "Recadastro inválido"],
      ["1 6 6 7 9 9 9 2 0", "1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Aluno 1 - digite duas notas: Aluno 2 - digite duas notas: Aluno 3 - digite duas notas: Cadastro concluido.\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Aluno 1: 6.00 - Aprovado\nAluno 2: 8.00 - Aprovado\nAluno 3: 9.00 - Aprovado\nMedia da turma: 7.67\nAprovados: 3 de 3\n\n1 - Registrar notas\n2 - Ver relatorio\n0 - Sair\nEscolha: Ate logo!", "ok", "Consultar outra turma"],
    ]
  }] },
];
