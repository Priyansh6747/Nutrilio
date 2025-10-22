import os
import re
from typing import Dict, Tuple, List

from dotenv import load_dotenv
import requests
from pydantic import BaseModel, Field, field_validator

load_dotenv()

API_KEY = os.getenv("USDA_KEY")

# Unit conversion factors to standard units
UNIT_CONVERSIONS = {
    # Weight conversions to G (grams)
    'G': 1.0,
    'MG': 0.001,
    'UG': 0.000001,

    # Volume conversions to ML (milliliters)
    'ML': 1.0,
    'L': 1000.0,

    # Energy stays as KCAL
    'KCAL': 1.0,
    'KJ': 0.239006,

    # International Units (IU) - keep as is, specific to vitamins
    'IU': 1.0,
    'INTERNATIONAL UNIT': 1.0,
}


def normalize_unit(amount: float, unit: str) -> Tuple[float, str]:
    """
    Normalize nutrient amounts to standard units.
    Returns (normalized_amount, standard_unit)

    Standard units:
    - Weight: G (grams)
    - Volume: ML (milliliters)
    - Energy: KCAL (kilocalories)
    - IU: IU (international units, kept as is)
    """
    if amount == 0.0 or unit is None:
        return amount, unit

    # Normalize unit string
    unit_upper = unit.upper().strip()

    # Determine target unit and conversion factor
    if unit_upper in ['G', 'MG', 'UG', 'MILLI GRAM', 'MICRO GRAM']:
        # Weight units -> convert to G
        conversion_factor = UNIT_CONVERSIONS.get(unit_upper, 1.0)
        return amount * conversion_factor, 'G'

    elif unit_upper in ['ML', 'L']:
        # Volume units -> convert to ML
        conversion_factor = UNIT_CONVERSIONS.get(unit_upper, 1.0)
        return amount * conversion_factor, 'ML'

    elif unit_upper in ['KCAL', 'KJOULES', 'KJ']:
        # Energy units -> convert to KCAL
        conversion_factor = UNIT_CONVERSIONS.get(unit_upper, 1.0)
        return amount * conversion_factor, 'KCAL'

    elif unit_upper in ['IU', 'INTERNATIONAL UNIT']:
        # IU stays as IU
        return amount, 'IU'

    else:
        # Unknown unit, keep as is
        return amount, unit


class Nutrient(BaseModel):
    """Model for individual nutrient information"""
    name: str = Field(..., description="Name of the nutrient")
    amount: float = Field(default=0.0, description="Amount of the nutrient (normalized)")
    unit: str = Field(..., description="Unit of measurement (G, ML, KCAL, IU)")
    original_amount: float = Field(default=0.0, description="Original amount before normalization")
    original_unit: str = Field(default="", description="Original unit before normalization")

    @field_validator('amount', mode='before')
    @classmethod
    def handle_none_amount(cls, v):
        """Convert None to 0.0 to handle missing nutrient data from API"""
        if v is None:
            return 0.0
        return float(v)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Protein",
                "amount": 0.82,
                "unit": "G",
                "original_amount": 820.0,
                "original_unit": "MG"
            }
        }


class FoodItem(BaseModel):
    """Model for a food item with its nutritional information"""
    name: str = Field(..., description="Name of the food item")
    fdc_id: int = Field(..., description="FDC (FoodData Central) ID")
    category: str = Field(..., description="Food category")
    nutrients: List[Nutrient] = Field(..., description="List of nutrients in the food")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Tomatoes, raw",
                "fdc_id": 2709719,
                "category": "Tomatoes",
                "nutrients": [
                    {
                        "name": "Protein",
                        "amount": 0.82,
                        "unit": "G",
                        "original_amount": 0.82,
                        "original_unit": "G"
                    }
                ]
            }
        }


class NutritionalDataResponse(BaseModel):
    """Root model for the complete nutritional data response"""
    food_items: List[FoodItem] = Field(..., description="List of food items with nutritional data")

    class Config:
        json_schema_extra = {
            "example": {
                "food_items": [
                    {
                        "name": "Tomatoes, raw",
                        "fdc_id": 2709719,
                        "category": "Tomatoes",
                        "nutrients": []
                    }
                ]
            }
        }

    @classmethod
    def from_list(cls, data: List[dict]) -> "NutritionalDataResponse":
        return cls(food_items=data)


def analyse_ingredient(item: str) -> NutritionalDataResponse:
    if not API_KEY:
        raise ValueError("USDA_KEY not found in environment variables")

    url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        "query": item,
        "dataType": "Foundation,Survey (FNDDS),SR Legacy",
        "pageSize": 20,
        "api_key": API_KEY
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        raise requests.RequestException(f"Failed to fetch data from USDA API: {e}")

    results = []

    for food in data.get("foods", []):
        category = food.get("foodCategory", "N/A")
        if isinstance(category, dict):
            category = category.get("description", "N/A")

        # Process nutrients with unit normalization
        normalized_nutrients = []
        for n in food.get("foodNutrients", []):
            original_amount = n.get("value", 0.0) or 0.0
            original_unit = n.get("unitName", "")

            # Normalize the unit
            normalized_amount, normalized_unit = normalize_unit(original_amount, original_unit)

            normalized_nutrients.append({
                "name": n.get("nutrientName"),
                "amount": normalized_amount,
                "unit": normalized_unit,
                "original_amount": original_amount,
                "original_unit": original_unit
            })

        results.append({
            "name": food.get("description"),
            "fdc_id": food.get("fdcId"),
            "category": category,
            "nutrients": normalized_nutrients
        })

    return NutritionalDataResponse.from_list(results)


def parse_food_items(text: str) -> List[Dict]:
    """Parse food items from the text output."""
    items = []
    lines = text.strip().split('\n')

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if '(ID:' in line and ')' in line:
            match = re.match(r'(.+?)\s+\(ID:\s*(\d+)\)', line)
            if match:
                item = {
                    'name': match.group(1).strip(),
                    'id': match.group(2),
                    'category': '',
                    'num_nutrients': 0,
                    'protein': ''
                }

                if i + 1 < len(lines) and 'Category:' in lines[i + 1]:
                    item['category'] = lines[i + 1].split('Category:')[1].strip()

                if i + 2 < len(lines) and 'Number of nutrients:' in lines[i + 2]:
                    num_match = re.search(r'(\d+)', lines[i + 2])
                    if num_match:
                        item['num_nutrients'] = int(num_match.group(1))

                if i + 3 < len(lines) and 'Protein:' in lines[i + 3]:
                    item['protein'] = lines[i + 3].split('Protein:')[1].strip()

                items.append(item)
                i += 4
                continue
        i += 1

    return items


def score_food_item(item: Dict, search_term: str) -> Tuple[int, int, int]:
    """
    Score a food item based on multiple criteria.
    Returns a tuple (name_score, category_score, num_nutrients) for sorting.
    """
    name = item['name'].lower()
    search = search_term.lower()
    category = item['category'].lower()

    name_score = 0

    if name == f"{search}, raw":
        name_score = 1000
    elif name == search:
        name_score = 900
    elif name.startswith(f"{search}, "):
        name_score = 800
    elif name.startswith(search):
        name_score = 700
    elif search in name.split(',')[0]:
        name_score = 600
    elif search in name:
        name_score = 500
    else:
        name_score = 0

    preferred_categories = [
        'vegetables', 'fruits', 'meats', 'poultry', 'fish', 'seafood',
        'dairy', 'legumes', 'nuts', 'grains'
    ]

    avoid_categories = [
        'fast food', 'prepared', 'frozen', 'restaurant', 'packaged'
    ]

    category_score = 0
    for pref in preferred_categories:
        if pref in category:
            category_score = 100
            break

    for avoid in avoid_categories:
        if avoid in category:
            category_score = -50
            break

    if any(word in name for word in ['sauce', 'bread', 'frozen', 'prepared', 'fast food']):
        name_score -= 100

    if 'raw' in name:
        name_score += 50

    return (name_score, category_score, item['num_nutrients'])


def find_best_food_item(text: str, search_term: str) -> Dict:
    items = parse_food_items(text)

    if not items:
        return None

    scored_items = [(item, score_food_item(item, search_term)) for item in items]
    scored_items.sort(key=lambda x: (x[1][0], x[1][1], x[1][2]), reverse=True)

    return scored_items[0][0]


class NutrientData(BaseModel):
    name: str
    amt: float
    unit: str


class NutrientBreakDown(BaseModel):
    name: str
    id: int
    category: str
    nutrients: List[NutrientData]


def get_best_nutrient_breakdown(ingredient: str) -> NutrientBreakDown:
    """Get the best nutrient breakdown with normalized units."""
    response = analyse_ingredient(ingredient)

    if not response.food_items:
        raise ValueError(f"No items found for '{ingredient}'")

    # Convert response to text format for parsing
    text_output = ""
    for item in response.food_items:
        protein = next((n for n in item.nutrients if n.name == "Protein"), None)

        text_output += f"{item.name} (ID: {item.fdc_id})\n"
        text_output += f"Category: {item.category}\n"
        text_output += f"Number of nutrients: {len(item.nutrients)}\n"
        if protein:
            text_output += f"Protein: {protein.amount:.2f} {protein.unit}\n"
        text_output += "\n"

    # Find best match
    best_item_dict = find_best_food_item(text_output, ingredient)

    if not best_item_dict:
        raise ValueError(f"Could not determine best match for '{ingredient}'")

    # Get the complete FoodItem object
    best_fdc_id = int(best_item_dict['id'])
    best_food_item = next((item for item in response.food_items if item.fdc_id == best_fdc_id), None)

    if not best_food_item:
        raise ValueError(f"Could not find complete data for FDC ID {best_fdc_id}")

    # Convert to NutrientBreakDown with normalized units
    nutrient_breakdown = NutrientBreakDown(
        name=best_food_item.name,
        id=best_food_item.fdc_id,
        category=best_food_item.category,
        nutrients=[
            NutrientData(name=n.name, amt=n.amount, unit=n.unit)
            for n in best_food_item.nutrients
        ]
    )

    return nutrient_breakdown


if __name__ == "__main__":
    ingredient = "Potato"

    try:
        breakdown = get_best_nutrient_breakdown(ingredient)

        print(f"Name: {breakdown.name}")
        print(f"ID: {breakdown.id}")
        print(f"Category: {breakdown.category}")
        print(f"\nNutrients ({len(breakdown.nutrients)}) - All units normalized:")
        print(f"{'Nutrient':<40} {'Amount':>15} {'Unit':<10}")
        print("-" * 65)
        for nutrient in breakdown.nutrients[:20]:  # Show first 20 for readability
            print(f"{nutrient.name:<40} {nutrient.amt:>15.6f} {nutrient.unit:<10}")

    except Exception as e:
        print(f"Error: {e}")