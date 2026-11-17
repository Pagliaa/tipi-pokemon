const { types, matrix, pokemon } = window.POKEDEX_DATA;

const colours = {
  Normale: "#A8A77A", Fuoco: "#EE8130", Acqua: "#6390F0", Erba: "#7AC74C",
  Elettro: "#F7D02C", Ghiaccio: "#96D9D6", Lotta: "#C22E28", Veleno: "#A33EA1",
  Terra: "#E2BF65", Volante: "#A98FF3", Psico: "#F95587", Coleottero: "#A6B91A",
  Roccia: "#B6A136", Spettro: "#735797", Drago: "#6F35FC", Buio: "#705746",
  Acciaio: "#B7B7CE", Folletto: "#D685AD"
};
const selected = [];
const picker = document.querySelector("#type-picker");
const search = document.querySelector("#pokemon-search");
const datalist = document.querySelector("#pokemon-list");
const feedback = document.querySelector("#search-feedback");
const emptyState = document.querySelector("#empty-state");
const results = document.querySelector("#results");

function chip(type, extraClass = "") {
  const element = document.createElement("span");
  element.className = `type-chip ${extraClass}`;
  element.style.setProperty("--type", colours[type]);
  element.textContent = type;
  return element;
}

function formatMultiplier(value) { return `${Number.isInteger(value) ? value : value.toFixed(2).replace(/0$/, "")}×`; }

function updatePicker() {
  picker.replaceChildren();
  types.forEach(type => {
    const button = chip(type);
    button.type = "button";
    button.classList.toggle("selected", selected.includes(type));
    button.disabled = selected.length === 2 && !selected.includes(type);
    button.addEventListener("click", () => {
      const position = selected.indexOf(type);
      position === -1 ? selected.push(type) : selected.splice(position, 1);
      search.value = "";
      feedback.textContent = "";
      updatePicker();
      render();
    });
    picker.append(button);
  });
}

function renderEffectList(target, items, emptyText) {
  const area = document.querySelector(target);
  area.replaceChildren();
  if (!items.length) { area.textContent = emptyText; area.className = "effect-list helper"; return; }
  area.className = "effect-list";
  items.forEach(({ type, value }) => {
    const item = document.createElement("div"); item.className = "effect-item";
    item.append(chip(type), Object.assign(document.createElement("span"), { className: "multiplier", textContent: formatMultiplier(value) }));
    area.append(item);
  });
}

function render() {
  if (!selected.length) { emptyState.hidden = false; results.hidden = true; return; }
  emptyState.hidden = true; results.hidden = false;
  const effects = types.map(attack => ({ type: attack, value: selected.reduce((total, defense) => total * matrix[defense][attack], 1) }));
  const weaknesses = effects.filter(item => item.value > 1);
  const resistances = effects.filter(item => item.value > 0 && item.value < 1);
  const immunities = effects.filter(item => item.value === 0);
  document.querySelector("#profile-title").textContent = selected.join(" / ");
  const selectedTypes = document.querySelector("#selected-types"); selectedTypes.replaceChildren(...selected.map(type => chip(type)));
  document.querySelector("#weakness-count").textContent = weaknesses.length;
  document.querySelector("#resistance-count").textContent = resistances.length;
  document.querySelector("#immunity-count").textContent = immunities.length;
  renderEffectList("#weaknesses", weaknesses, "Nessuna debolezza.");
  renderEffectList("#resistances", resistances, "Nessuna resistenza.");
  renderEffectList("#immunities", immunities, "Nessuna immunità.");
  const grid = document.querySelector("#effectiveness-grid"); grid.replaceChildren();
  effects.forEach(({ type, value }) => {
    const cell = document.createElement("div");
    cell.className = `effect-cell ${value === 0 ? "immune" : value > 1 ? "weak" : value < 1 ? "resist" : ""}`;
    cell.append(chip(type), Object.assign(document.createElement("strong"), { textContent: formatMultiplier(value) }));
    grid.append(cell);
  });
}

pokemon.forEach(({ name }) => { const option = document.createElement("option"); option.value = name; datalist.append(option); });
search.addEventListener("change", () => {
  const found = pokemon.find(entry => entry.name.toLocaleLowerCase("it") === search.value.trim().toLocaleLowerCase("it"));
  if (!found) { feedback.textContent = search.value ? "Pokémon non trovato. Scegli un nome dall’elenco." : ""; return; }
  selected.splice(0, selected.length, ...found.types);
  feedback.textContent = `${found.name}: ${found.types.join(" / ")}`;
  updatePicker(); render();
});
document.querySelector("#clear-pokemon").addEventListener("click", () => { search.value = ""; feedback.textContent = ""; });
updatePicker();
