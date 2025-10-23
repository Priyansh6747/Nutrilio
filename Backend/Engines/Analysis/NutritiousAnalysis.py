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


import logging
from collections import defaultdict

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



def clean_nutrient_response(raw_data: NutrientBreakDown) -> NutrientBreakDown:
    """
    Cleans and organizes nutrient data for better user readability.
    Prioritizes essential nutrients and groups them logically.
    """

    # Define priority nutrients to show (in order of importance)
    priority_nutrients = {
        # Macronutrients (always show)
        'Energy': 'calories',
        'Protein': 'macros',
        'Total lipid (fat)': 'macros',
        'Carbohydrate, by difference': 'macros',
        'Fiber, total dietary': 'macros',
        'Total Sugars': 'macros',

        # Essential Vitamins
        'Vitamin A, RAE': 'vitamins',
        'Vitamin C, total ascorbic acid': 'vitamins',
        'Vitamin D (D2 + D3)': 'vitamins',
        'Vitamin E (alpha-tocopherol)': 'vitamins',
        'Vitamin K (phylloquinone)': 'vitamins',
        'Thiamin': 'vitamins',
        'Riboflavin': 'vitamins',
        'Niacin': 'vitamins',
        'Vitamin B-6': 'vitamins',
        'Folate, total': 'vitamins',
        'Vitamin B-12': 'vitamins',

        # Essential Minerals
        'Calcium, Ca': 'minerals',
        'Iron, Fe': 'minerals',
        'Magnesium, Mg': 'minerals',
        'Phosphorus, P': 'minerals',
        'Potassium, K': 'minerals',
        'Sodium, Na': 'minerals',
        'Zinc, Zn': 'minerals',

        # Important Fats
        'Cholesterol': 'fats',
        'Fatty acids, total saturated': 'fats',
        'Fatty acids, total monounsaturated': 'fats',
        'Fatty acids, total polyunsaturated': 'fats',
        'Fatty acids, total trans': 'fats',
    }

    # Create a dictionary for quick lookup
    nutrient_dict = {n.name: n for n in raw_data.nutrients}

    # Build cleaned nutrient list
    cleaned_nutrients = []

    for nutrient_name in priority_nutrients.keys():
        if nutrient_name in nutrient_dict:
            nutrient = nutrient_dict[nutrient_name]

            # Only include if value is meaningful (non-zero or significant)
            if nutrient.amt > 0.0001 or nutrient_name == 'Energy':
                # Standardize nutrient names for better readability
                display_name = _get_display_name(nutrient_name)

                # Convert units for better readability
                amt, unit = _normalize_units(nutrient.amt, nutrient.unit)

                cleaned_nutrients.append(NutrientData(
                    name=display_name,
                    amt=round(amt, 2),
                    unit=unit
                ))

    return NutrientBreakDown(
        name=raw_data.name,
        id=raw_data.id,
        category=raw_data.category,
        nutrients=cleaned_nutrients
    )


def _get_display_name(nutrient_name: str) -> str:
    """Convert technical nutrient names to user-friendly names."""
    name_mapping = {
        'Energy': 'Calories',
        'Total lipid (fat)': 'Fat',
        'Carbohydrate, by difference': 'Carbohydrates',
        'Fiber, total dietary': 'Fiber',
        'Total Sugars': 'Sugar',
        'Vitamin A, RAE': 'Vitamin A',
        'Vitamin C, total ascorbic acid': 'Vitamin C',
        'Vitamin D (D2 + D3)': 'Vitamin D',
        'Vitamin E (alpha-tocopherol)': 'Vitamin E',
        'Vitamin K (phylloquinone)': 'Vitamin K',
        'Thiamin': 'Vitamin B1 (Thiamin)',
        'Riboflavin': 'Vitamin B2 (Riboflavin)',
        'Niacin': 'Vitamin B3 (Niacin)',
        'Vitamin B-6': 'Vitamin B6',
        'Folate, total': 'Folate (B9)',
        'Vitamin B-12': 'Vitamin B12',
        'Calcium, Ca': 'Calcium',
        'Iron, Fe': 'Iron',
        'Magnesium, Mg': 'Magnesium',
        'Phosphorus, P': 'Phosphorus',
        'Potassium, K': 'Potassium',
        'Sodium, Na': 'Sodium',
        'Zinc, Zn': 'Zinc',
        'Cholesterol': 'Cholesterol',
        'Fatty acids, total saturated': 'Saturated Fat',
        'Fatty acids, total monounsaturated': 'Monounsaturated Fat',
        'Fatty acids, total polyunsaturated': 'Polyunsaturated Fat',
        'Fatty acids, total trans': 'Trans Fat',
    }
    return name_mapping.get(nutrient_name, nutrient_name)


def _normalize_units(amt: float, unit: str) -> tuple[float, str]:
    """Normalize units for better readability (convert G to mg if too small, etc.)"""

    # Convert grams to milligrams for very small amounts
    if unit == 'G' and amt < 0.01:
        return amt * 1000, 'mg'

    # Keep KCAL as is
    if unit == 'KCAL':
        return amt, 'kcal'

    # Convert MG to mg for readability
    if unit == 'MG':
        return amt, 'mg'

    # Convert UG to mcg for readability
    if unit == 'UG':
        return amt, 'mcg'

    # Standardize G to g
    if unit == 'G':
        return amt, 'g'

    # Keep IU as is
    if unit == 'IU':
        return amt, 'IU'

    return amt, unit.lower()


def nutrient_analysis(name: str , disc:str , amnt:float) -> NutrientBreakDown :
    breakdown = analyse_nutrients(name, disc,amnt)
    cleaned_breakdown = clean_nutrient_response(breakdown)
    return cleaned_breakdown

# Example usage:
if __name__ == "__main__":
    sample_input = analyse_nutrients(
            "Chicken Biryani",
            description="Chicken biryani is a fragrant, spiced rice dish layered with tender chicken, caramelized onions, and aromatic herbs, slow-cooked to perfection.",
            amnt=200.0
        )

    cleaned = clean_nutrient_response(sample_input)

    print(f"Name: {cleaned.name}")
    print(f"Category: {cleaned.category}")
    print(f"\nNutrients ({len(cleaned.nutrients)} essential nutrients):")
    for nutrient in cleaned.nutrients:
        print(f"  {nutrient.name}: {nutrient.amt} {nutrient.unit}")