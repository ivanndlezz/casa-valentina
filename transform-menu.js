const fs = require("fs");

// Leer el archivo old-menu.json
const oldMenu = JSON.parse(fs.readFileSync("jsons/old-menu.json", "utf8"));

// Función para transformar el nombre de la sección
function transformSectionName(section) {
  const sectionMap = {
    ENTRADAS: { es: "Entradas", en: "Appetizers" },
    SOPAS: { es: "Sopas", en: "Soups" },
    "COCINA MEXICANA": { es: "Cocina Mexicana", en: "Mexican Cuisine" },
    PIZZA: { es: "Pizza", en: "Pizza" },
    // Agregar más mapeos según sea necesario
  };
  return sectionMap[section] || { es: section, en: section };
}

// Función para generar un ID único
function generateId(section, index) {
  const sectionPrefixes = {
    ENTRADAS: "ent",
    SOPAS: "sop",
    "COCINA MEXICANA": "mex",
    PIZZA: "piz",
    // Agregar más prefijos según sea necesario
  };
  const prefix = sectionPrefixes[section] || "item";
  return `${prefix}-${index.toString().padStart(3, "0")}`;
}

// Función para transformar un elemento
function transformItem(item, section, index) {
  return {
    id: generateId(section, index),
    name: {
      es: item["NOMBRE DEL PLATILLO"],
      en: item["NOMBRE DEL PLATILLO"], // Asumiendo que el nombre en inglés es el mismo
    },
    description: {
      es: item["DESCRIPCIÓN"],
      en: "", // Asumiendo que la descripción en inglés está vacía
    },
    price: item["PRECIO"],
    subcategory: item["SUBCATEGORÍA"],
  };
}

// Procesar el menú antiguo
const newMenu = {
  config: {
    currency: "MXN",
    languages: [
      { code: "es", label: "Español", flag: "mx" },
      { code: "en", label: "English", flag: "us" },
    ],
  },
  menu: {},
};

// Agrupar elementos por sección
const sections = {};
oldMenu.forEach((item) => {
  const section = item["SECCIÓN"];
  if (section) {
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(item);
  }
});

// Transformar cada sección
Object.keys(sections).forEach((section) => {
  const sectionName = transformSectionName(section);
  const items = sections[section].map((item, index) =>
    transformItem(item, section, index + 1)
  );
  newMenu.menu[section.toLowerCase().replace(" ", "_")] = {
    name: sectionName,
    items: items,
  };
});

// Escribir el nuevo menú en menu.json
fs.writeFileSync("jsons/menu.json", JSON.stringify(newMenu, null, 2));

console.log("La transformación se ha completado con éxito.");
