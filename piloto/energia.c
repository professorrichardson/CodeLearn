#include <stdio.h>

int main(void) {
    int baterias;
    if (scanf("%d", &baterias) != 1) {
        fprintf(stderr, "Digite um numero inteiro.\n");
        return 1;
    }

    int energia = 0;
    for (int i = 0; i < baterias; i++) {
        energia += 10;
    }

    if (energia >= 30) {
        printf("Porta aberta: %d\n", energia);
    } else {
        printf("Energia insuficiente: %d\n", energia);
    }

    return 0;
}
