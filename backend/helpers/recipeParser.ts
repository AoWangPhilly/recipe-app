/**
 * Parses extremely long Spoonacular recipe object into smaller object
 * Although not used here, these follow the types defined in types.ts
 */

export function parseRecipe(recipe: any) {
    const {
        preparationMinutes,
        cookingMinutes,
        extendedIngredients,
        title,
        servings,
        image,
        imageType,
        summary,
        cuisines,
        dishTypes,
        analyzedInstructions,
        sourceUrl,
        id,
    } = recipe;

    let instructions = analyzedInstructions;
    if (instructions && instructions.length > 0) {
        instructions = instructions[0].steps
            .map((step: any) => {
                return step.step;
            })
            .join("\n");
    } else {
        instructions = "";
    }
    const ingredients = extendedIngredients.map((ingredient: any) => {
        return {
            id: ingredient.id,
            original: ingredient.original,
            originalName: ingredient.originalName,
        };
    });
    return {
        preparationMinutes: preparationMinutes,
        cookingMinutes: cookingMinutes,
        extendedIngredients: ingredients,
        title: title,
        servings: servings,
        image: image,
        imageType: imageType,
        summary: summary,
        cuisines: cuisines,
        dishTypes: dishTypes,
        instructions: instructions,
        sourceUrl: sourceUrl,
        recipeId: id,
    };
}
