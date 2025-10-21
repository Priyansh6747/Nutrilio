import os
import json
from typing import Optional, List

import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel, Field, field_validator

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash')


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


def get_ingredients(name: str, description: Optional[str] = None) -> RecipeIngredients:
    # Combine name and description if provided
    recipe_input = f"{name}"
    if description:
        recipe_input += f" - {description}"

    prompt = f"""You are an information extraction model.
    Given a recipe description, extract only the raw ingredients and their amounts normalized to per 100g/ml of the final dish.
    No cooking steps. No garnish. No brand names.
    Be precise — rounding or guessing is acceptable, omission is not.
    If an amount isn't specified, infer a realistic estimate based on common recipes for that dish.

    Output strictly in this JSON array format:
    [{{"item": "<ingredient_name>", "amnt": <amount_in_grams_or_ml>}}, ...]

    If your output deviates from this format or includes extra text, it will be discarded.
    Stay concise, stay factual.

    Recipe: {recipe_input}
    """

    try:
        response = model.generate_content(prompt)

        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            # Remove opening ```json or ```
            response_text = response_text.split("\n", 1)[1]
            # Remove closing ```
            response_text = response_text.rsplit("```", 1)[0]

        response_text = response_text.strip()

        # Parse JSON response
        raw_ingredients = json.loads(response_text)

        # Validate and parse using Pydantic
        ingredients = [Ingredient(**ing) for ing in raw_ingredients]

        # Create and return RecipeIngredients object
        return RecipeIngredients(
            recipe_name=name,
            description=description,
            ingredients=ingredients
        )

    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response: {e}")
        print(f"Raw response: {response_text}")
        raise
    except Exception as e:
        print(f"Error getting ingredients: {e}")
        raise


# Example usage
if __name__ == "__main__":
    try:
        # Example 1: Basic usage
        recipe1 = get_ingredients("Chicken Biryani")

        print(f"\nRecipe: {recipe1.recipe_name}")
        print(f"Total ingredients: {len(recipe1.ingredients)}")
        print("\nIngredients:")
        for ing in recipe1.ingredients:
            print(f"  - {ing.item}: {ing.amnt}g/ml per 100g")

        # Example 2: With description
        recipe2 = get_ingredients(
            "Pasta",
            description="Creamy Alfredo with chicken and broccoli"
        )

        print(f"\n{'=' * 50}")
        print(f"Recipe: {recipe2.recipe_name}")
        print(f"Description: {recipe2.description}")
        print(f"Total ingredients: {len(recipe2.ingredients)}")
        print("\nIngredients:")
        for ing in recipe2.ingredients:
            print(f"  - {ing.item}: {ing.amnt}g/ml per 100g")

        # Example 3: Export to JSON
        print(f"\n{'=' * 50}")
        print("JSON Export:")
        print(recipe1.model_dump_json(indent=2))

    except Exception as e:
        print(f"Error: {e}")