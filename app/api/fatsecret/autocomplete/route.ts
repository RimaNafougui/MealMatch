// Introduce a new autocomplete endpoint using the Spoonacular ingredients API
// as a replacement for the paid FatSecret autocomplete.

import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function GET(request) {
    const { query } = request;
    const ingredients = query.get('ingredients');

    if (!ingredients) {
        return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${ingredients}&apiKey=YOUR_API_KEY`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data from Spoonacular' }, { status: 500 });
    }
}