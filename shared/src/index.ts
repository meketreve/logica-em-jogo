export * from "./arvores";
export * from "./auth";
export * from "./biomas";
export * from "./blocks";
export * from "./claims";
export * from "./colunas";
export * from "./envioPose";
export * from "./comida";
export * from "./constants";
export * from "./containers";
export * from "./controleJogador";
export * from "./fornalha";
export * from "./ferramentas";
export * from "./grade";
export * from "./groups";
export * from "./drops";
export * from "./inventario";
export * from "./usos";
export * from "./world";
export * from "./worldgen";
export * from "./luz";
export * from "./mesher";
export * from "./modo";
export * from "./orientacao";
export * from "./receitas";
export * from "./regras";
export * from "./sobrevivencia";
export * from "./physics";
export * from "./raycast";
export * from "./quadros";
export * from "./regions";
export * from "./rules";
export * from "./vento";
export * from "./scenario";
export * from "./protocol";
export * from "./save";
export * from "./session";
// único módulo de session/* no barrel, de propósito: `copiarCelula` é o
// primitivo que o GERADOR de cenários (server/src/cenarios/gerar.ts) usa para
// carimbar as áreas — o mesmo que o /aula grupos usa ao vivo. Os outros
// session/* são handlers de comando e não têm consumidor fora daqui.
export * from "./session/aula";
export * from "./version";
