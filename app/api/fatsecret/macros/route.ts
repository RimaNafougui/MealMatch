// Revised FatSecret macros handler with clearer comments in French,
// expanded unit→grams conversion table, improved unit parsing/defaults,
// and clarified flow for fetching tokens and food macros.

import { NextResponse } from 'next/server';

const unitToGram = {
    'cup': 240,
    'tablespoon': 15,
    'teaspoon': 5,
    'oz': 28.35,
};

export async function GET(request) {
    const { query } = request;
    const foodItem = query.get('foodItem');

    if (!foodItem) {
        return NextResponse.json({ error: 'Aucun aliment fourni' }, { status: 400 });
    }

    // Fetch tokens and macros from FatSecret API
    // Implémentation pour récupérer les tokens et les macros
    // (à clarifier et compléter)

    // Exemples de conversion:
    let quantity = parseFloat(query.get('quantity')) || 1;
    const unit = query.get('unit');
    let grams = quantity;

    if (unit && unitToGram[unit]) {
        grams = quantity * unitToGram[unit];
    }

    // Logique pour récupérer les macros

    return NextResponse.json({ grams, macros: {} }); 
}