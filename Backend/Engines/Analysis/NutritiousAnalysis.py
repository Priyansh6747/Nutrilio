'''
We are given a name and disc and  amount
pass them down in
recipe = get_ingredients(
            "Pasta",
            description="Creamy Alfredo with chicken and broccoli"
        )
so recipe wll be of format

class Ingredient(BaseModel):
    item: str = Field(..., description="Name of the ingredient")
    amnt: float = Field(..., gt=0, description="Amount in grams or ml per 100g/ml of final dish")

    @field_validator('item')
    @classmethod
    def validate_item(cls, v: str) -> str:
        """Ensure item name is not empty."""
        if not v or not v.strip():
            raise ValueError("Item name cannot be empty")
        return v.strip()


class RecipeIngredients(BaseModel):
    recipe_name: str
    description: Optional[str] = None
    ingredients: List[Ingredient]

    @field_validator('ingredients')
    @classmethod
    def validate_ingredients(cls, v: List[Ingredient]) -> List[Ingredient]:
        if not v:
            raise ValueError("Ingredients list cannot be empty")
        return v


so we now have a list of ingredient for 100g of dish
pass each ingredient in
breakdown = get_best_nutrient_breakdown(ingredient)
return value for each ingredient

class NutrientData(BaseModel):
    name: str
    amt: float


class NutrientBreakDown(BaseModel):
    name: str
    id: int
    category: str
    nutrients: List[NutrientData]

so now we have a list of macros for each ingredient for 100g of the ingredient
convert the values to scale as per the acutal value (Multiply by Ingredient.amnt/100)
sum up all the macros and return a final list

Nutrients:
 name : recipe_name
 id : id
 category : category
 nutrients : List[NutrientData] //summed version
'''
from collections import defaultdict

from Engines.Analysis.MacroBreakdown import get_best_nutrient_breakdown, NutrientBreakDown, NutrientData
from Engines.Generative_Engine.MealExtractor import get_ingredients


def analyse_nutrients(
        name: str,
        description: str = None,
        amnt: float = None
) -> NutrientBreakDown:

    if amnt is None:
        amnt = 100.0

    # Step 1: Get recipe ingredients (for 100g of dish)
    recipe = get_ingredients(name, description=description)
    nutrient_totals = defaultdict(float)

    # Step 2: Process each ingredient
    for ingredient in recipe.ingredients:
        breakdown = get_best_nutrient_breakdown(ingredient.item)

        # Step 3: Scale nutrients based on actual amount used in recipe
        scale_factor = ingredient.amnt / 100.0
        for nutrient in breakdown.nutrients:
            nutrient_totals[nutrient.name] += nutrient.amt * scale_factor

    # Step 4: scale the totals
    if amnt != 100.0:
        final_scale = amnt / 100.0
        for nutrient_name in nutrient_totals:
            nutrient_totals[nutrient_name] *= final_scale


    final_nutrients = [
        NutrientData(name=name, amt=amt)
        for name, amt in nutrient_totals.items()
    ]

    # Step 5: Return final aggregated breakdown
    return NutrientBreakDown(
        name=recipe.recipe_name,
        id=hash(recipe.recipe_name) % (10 ** 8),  # Generate a simple ID
        category="recipe",  # You can modify this based on your needs
        nutrients=final_nutrients
    )


def main():
    """Test function for analyse_nutrients"""
    print("=" * 60)
    print("Testing Nutrient Analysis Function")
    print("=" * 60)

    # Test 1: Pasta Alfredo (default 100g)
    print("\nTest 1: Pasta Alfredo (100g)")
    print("-" * 60)
    result1 = analyse_nutrients(
        "Pasta",
        description="Creamy Alfredo with chicken and broccoli"
    )
    print(f"Recipe: {result1.name}")
    print(f"Category: {result1.category}")
    print(f"\nNutrient Breakdown (per 100g):")
    for nutrient in sorted(result1.nutrients, key=lambda x: x.name):
        print(f"  {nutrient.name}: {nutrient.amt:.2f}g")

    # Test 2: Pasta Alfredo (200g serving)
    print("\n\nTest 2: Pasta Alfredo (200g serving)")
    print("-" * 60)
    result2 = analyse_nutrients(
        "Pasta",
        description="Creamy Alfredo with chicken and broccoli",
        amnt=200.0
    )
    print(f"Recipe: {result2.name}")
    print(f"\nNutrient Breakdown (per 200g):")
    for nutrient in sorted(result2.nutrients, key=lambda x: x.name):
        print(f"  {nutrient.name}: {nutrient.amt:.2f}g")

    # Test 3: Simple recipe
    print("\n\nTest 3: Simple Rice with Chicken (100g)")
    print("-" * 60)
    result3 = analyse_nutrients("Chicken Rice Bowl")
    print(f"Recipe: {result3.name}")
    print(f"\nNutrient Breakdown (per 100g):")
    for nutrient in sorted(result3.nutrients, key=lambda x: x.name):
        print(f"  {nutrient.name}: {nutrient.amt:.2f}g")

    # Calculate total calories (rough estimate: 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat)
    print("\n" + "=" * 60)
    print("Calorie Estimation for Test 1 (100g Pasta Alfredo):")
    print("-" * 60)
    for nutrient in result1.nutrients:
        if nutrient.name == "Protein":
            print(f"  Protein: {nutrient.amt:.2f}g × 4 = {nutrient.amt * 4:.1f} cal")
        elif nutrient.name == "Carbs":
            print(f"  Carbs: {nutrient.amt:.2f}g × 4 = {nutrient.amt * 4:.1f} cal")
        elif nutrient.name == "Fat":
            print(f"  Fat: {nutrient.amt:.2f}g × 9 = {nutrient.amt * 9:.1f} cal")

    protein_amt = next((n.amt for n in result1.nutrients if n.name == "Protein"), 0)
    carbs_amt = next((n.amt for n in result1.nutrients if n.name == "Carbs"), 0)
    fat_amt = next((n.amt for n in result1.nutrients if n.name == "Fat"), 0)
    total_cal = protein_amt * 4 + carbs_amt * 4 + fat_amt * 9
    print(f"\nTotal Calories: {total_cal:.1f} cal per 100g")
    print("=" * 60)


if __name__ == "__main__":
    main()