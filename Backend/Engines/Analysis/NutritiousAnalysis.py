"""
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
"""


from collections import defaultdict
import logging

from Engines.Analysis.MacroBreakdown import get_best_nutrient_breakdown, NutrientBreakDown, NutrientData
from Engines.Generative_Engine.MealExtractor import get_ingredients

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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
    nutrient_units = {}

    processed_ingredients = []
    skipped_ingredients = []

    # Step 2: Process each ingredient
    for ingredient in recipe.ingredients:
        try:
            breakdown = get_best_nutrient_breakdown(ingredient.item)

            # Step 3: Scale nutrients based on actual amount used in recipe
            scale_factor = ingredient.amnt / 100.0
            for nutrient in breakdown.nutrients:
                nutrient_totals[nutrient.name] += nutrient.amt * scale_factor
                if nutrient.name not in nutrient_units:
                    nutrient_units[nutrient.name] = nutrient.unit

            processed_ingredients.append(ingredient.item)
            logger.info(f"✓ Processed: {ingredient.item} ({ingredient.amnt}g)")

        except ValueError as e:
            skipped_ingredients.append(ingredient.item)
            logger.warning(f"✗ Skipped: {ingredient.item} - {str(e)}")
            continue
        except Exception as e:
            skipped_ingredients.append(ingredient.item)
            logger.error(f"✗ Error processing {ingredient.item}: {str(e)}")
            continue

    if not processed_ingredients:
        raise ValueError(
            f"No ingredients could be processed for '{name}'. "
            f"Skipped: {', '.join(skipped_ingredients)}"
        )

    # Log summary
    logger.info(f"\nSummary: Processed {len(processed_ingredients)}/{len(recipe.ingredients)} ingredients")
    if skipped_ingredients:
        logger.warning(f"Skipped ingredients: {', '.join(skipped_ingredients)}")

    # Step 4: Scale the totals to the requested amount
    if amnt != 100.0:
        final_scale = amnt / 100.0
        for nutrient_name in nutrient_totals:
            nutrient_totals[nutrient_name] *= final_scale

    # Step 5: Create final nutrients list with units
    final_nutrients = [
        NutrientData(name=name, amt=amt, unit=nutrient_units[name])
        for name, amt in nutrient_totals.items()
    ]

    # Step 6: Return final aggregated breakdown
    return NutrientBreakDown(
        name=recipe.recipe_name,
        id=hash(recipe.recipe_name) % (10 ** 8),
        category="recipe",
        nutrients=final_nutrients
    )


def main():
    print("=" * 60)
    print("Testing Nutrient Analysis Function - Raw Output")
    print("=" * 60)

    # Single test: Pasta Alfredo (200g serving)
    print("\nAnalyzing: Biryani (200g)")
    print("-" * 60)

    try:
        result = analyse_nutrients(
            "Biryani",
            description="- Biryani is a fragrant rice dish made with long-grain basmati rice, aromatic spices and vegetables",
            amnt=200.0
        )

        print("\nRAW FUNCTION RETURN VALUE:")
        print("=" * 60)
        print(f"\nType: {type(result)}")
        print(f"\nObject representation:\n{result}")

        print("\n" + "=" * 60)
        print("DETAILED BREAKDOWN:")
        print("=" * 60)
        print(f"\nname: {result.name}")
        print(f"id: {result.id}")
        print(f"category: {result.category}")
        print(f"\nnutrients: List[NutrientData] with {len(result.nutrients)} items")
        print("\nAll nutrients:")
        for i, nutrient in enumerate(result.nutrients, 1):
            print(f"  [{i}] {nutrient.name}: {nutrient.amt:.4f} {nutrient.unit}")

        print("\n" + "=" * 60)
        print("JSON REPRESENTATION:")
        print("=" * 60)
        print(result.model_dump_json(indent=2))

    except Exception as e:
        print(f"\nError occurred: {type(e).__name__}")
        print(f"Message: {e}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()