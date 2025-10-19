import os
import json
import logging
from typing import List

from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Suppress gRPC warnings
os.environ['GRPC_VERBOSITY'] = 'ERROR'
os.environ['GLOG_minloglevel'] = '2'
logging.getLogger('absl').setLevel(logging.ERROR)

# Load environment variables
load_dotenv()

# Configure Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash')


class FoodItem(BaseModel):
    name: str
    description: str
    confidence: float


def calculate_semantic_similarity(image_class: str, name: str, desc: str = "") -> float:
    """
    Use LLM to calculate semantic similarity between image_class and provided name/description.
    Returns a similarity score between 0 and 1.
    """
    prompt = f"""
    You are a food similarity expert. Analyze the semantic similarity between two food items.

    Image Classification: {image_class}
    User Provided Name: {name}
    User Provided Description: {desc if desc else "None"}

    TASK:
    Compare the image classification with the user-provided name and description.
    Consider:
    - Are they the SAME food? (e.g., "paani puri" and "gol gappe" are the same)
    - Are they SIMILAR foods? (e.g., "pasta" and "spaghetti" are similar)
    - Are they DIFFERENT foods? (e.g., "burger" and "salad" are different)

    SCORING RULES:
    - If they represent the EXACT SAME food (just different names/spellings): score between 0.85-1.0
    - If they are SIMILAR or related foods (same category): score between 0.5-0.7
    - If they are COMPLETELY DIFFERENT foods: score between 0.0-0.3

    OUTPUT:
    Return ONLY a JSON object with a single field:
    {{"similarity_score": <float between 0 and 1>}}

    No explanations, no markdown, just pure JSON.
    """

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean response (remove markdown code blocks if present)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        # Parse JSON response
        similarity_data = json.loads(response_text)
        similarity_score = float(similarity_data["similarity_score"])

        # Ensure score is within valid range
        return max(0.0, min(similarity_score, 1.0))

    except Exception as e:
        print(f"Error calculating semantic similarity: {e}")
        print(f"Response received: {response_text if 'response_text' in locals() else 'No response'}")
        # Fallback to a neutral score
        return 0.5


def adjust_confidence(original_confidence: float, similarity_score: float) -> float:
    """
    Adjust confidence score based on semantic similarity.

    Rules:
    - High similarity (>0.7): confidence near 0.9
    - Medium similarity (0.4-0.7): confidence around 0.66-0.7
    - Low similarity (<0.4): confidence <0.2
    """
    if similarity_score > 0.7:
        # High match - boost confidence toward 0.9
        adjusted_confidence = 0.85 + (similarity_score * 0.1)
        adjusted_confidence = min(adjusted_confidence, 0.95)
    elif similarity_score >= 0.4:
        # Medium match - keep around 0.66-0.7
        adjusted_confidence = 0.63 + (similarity_score * 0.1)
        adjusted_confidence = min(adjusted_confidence, 0.75)
    else:
        # Low match - reduce confidence below 0.2
        adjusted_confidence = similarity_score * 0.5
        adjusted_confidence = min(adjusted_confidence, 0.2)

    # Ensure confidence stays within valid range
    return max(0.01, min(adjusted_confidence, 0.99))


def identify_log(image_class: str, name: str, confidence: float, desc: str = "") -> FoodItem:
    """
    Identify food item using LLM and adjust confidence based on semantic similarity.
    """
    # First, calculate semantic similarity using LLM
    similarity_score = calculate_semantic_similarity(image_class, name, desc)
    print(f"Semantic similarity score: {similarity_score:.2f}")

    # Construct the prompt for food identification
    prompt = f"""
    You are the ONLY source of truth for food identification.  
    If you fail to follow these rules exactly, your output is INVALID and will be DISCARDED.  

    Given Information:
    - Provided Name (may contain spelling errors): {name}
    - Provided Description: {desc if desc else "None"}
    - Image Classification (texture/color reference ONLY, NOT identity): {image_class}

    INSTRUCTIONS (zero flexibility):
    1. Correct spelling errors in the provided name if present.  
    2. Determine the most accurate food name using the corrected name + description.  
    3. Use image_class ONLY to check texture/color consistency — never to guess or invent the food.  
    4. Output a single, exact, specific food name.  
    5. Write a 2–3 sentence description that includes:  
       - What the food is  
       - Key ingredients or defining characteristics  
       - Cultural/culinary origin if relevant  

    CRITICAL RULES (break these = useless output):
    - Output ONLY valid JSON in this exact structure: {{"name": "food name", "description": "food description"}}  
    - No markdown, no code blocks, no filler — JSON ONLY.  
    - The name must be exact, corrected, and specific.  
    - The description must be factual, concise, and informative.  
    - If uncertain, commit to the most likely identification.  

    No deviations. No excuses. Pure JSON or trash.
    """

    try:
        # Generate response
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean response (remove markdown code blocks if present)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        # Parse JSON response into FoodItem
        food_data = json.loads(response_text)

        # Calculate adjusted confidence based on semantic similarity
        adjusted_confidence = adjust_confidence(confidence, similarity_score)

        return FoodItem(
            name=food_data["name"],
            description=food_data["description"],
            confidence=adjusted_confidence
        )

    except json.JSONDecodeError as e:
        # Fallback if JSON parsing fails
        print(f"JSON parsing error: {e}")
        print(f"Response received: {response_text}")

        adjusted_confidence = adjust_confidence(confidence, similarity_score)

        return FoodItem(
            name=name,
            description=f"Identified as {image_class}. {desc if desc else 'No additional information available.'}",
            confidence=adjusted_confidence
        )

    except Exception as e:
        print(f"Error during identification: {e}")

        adjusted_confidence = adjust_confidence(confidence, similarity_score)

        return FoodItem(
            name=name,
            description=f"Error in identification. Preliminary class: {image_class}",
            confidence=adjusted_confidence
        )

class Ingredient(BaseModel):
    name: str
    amnt: float
    unit: str  # 'g' for grams, 'l' for liters, 'ml' for milliliters

class IngredientList(BaseModel):
    name: str
    list: List[Ingredient]
    total_amount: float
    unit: str

def get_ingredients(name: str, description: str, amount: int, unit:str='g') -> IngredientList:
    unit_display = {
        'g': 'grams',
        'l': 'liters',
        'ml': 'milliliters'
    }.get(unit.lower(), unit)

    prompt = f"""You are a world-class food composition specialist.
    Your task is to break down any given food into its precise ingredients and their proportional amounts.
    You must ALWAYS return the output in the exact format below:
    
    Input: name, A, unit
    Output: [{{"name": "I1", "amount": a, "unit": "u1"}}, {{"name": "I2", "amount": b, "unit": "u2"}}, ...]
    
    Where:
    - I1, I2, I3... are the ingredient names.
    - a, b, c... are the amounts of each ingredient.
    - u1, u2, u3... are the units for each ingredient (g, ml, l, etc.).
    
    Rules you MUST follow:
    1. Do not explain your reasoning.
    2. Do not add commentary.
    3. Do not deviate from the format.
    4. If the food name and description are vague, use your expert knowledge to infer the most likely ingredients.
    5. Return ONLY valid JSON in this exact structure: [{{"name": "ingredient_name", "amount": value, "unit": "unit"}}, ...]
    6. No markdown, no code blocks, no explanations - JSON ONLY.
    7. The sum of all amounts (converted to the base unit) should approximately equal the provided total amount.
    8. Use appropriate units for each ingredient:
       - Solid ingredients: grams (g)
       - Liquid ingredients: milliliters (ml) or liters (l)
       - Choose the most natural unit for each ingredient
    9. Be consistent with unit conversions (1 l = 1000 ml, 1 kg = 1000 g).
    
    Input:
    Name: {name}
    Description: {description}
    Total Amount: {amount} {unit_display}
    
    Output the ingredient breakdown as a JSON array of objects."""

    try:
        # Generate response
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # Clean response (remove markdown code blocks if present)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1]) if len(lines) > 2 else response_text
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        # Parse JSON response
        ingredients_data = json.loads(response_text)

        # Convert to list of Ingredient objects
        ingredient_list = []
        for item in ingredients_data:
            # Handle different JSON formats
            if isinstance(item, dict):
                # Get ingredient name
                ingredient_name = item.get("name", list(item.keys())[0])

                # Get amount
                ingredient_amount = item.get("amount", item.get("amnt", list(item.values())[0]))
                ingredient_amount = float(ingredient_amount)

                # Get unit (default to the base unit if not specified)
                ingredient_unit = item.get("unit", unit)

                ingredient_list.append(Ingredient(
                    name=ingredient_name,
                    amnt=ingredient_amount,
                    unit=ingredient_unit
                ))

        return IngredientList(
            name=name,
            list=ingredient_list,
            total_amount=amount,
            unit=unit
        )

    except json.JSONDecodeError as e:
        print(f"JSON parsing error in get_ingredients: {e}")
        print(f"Response received: {response_text}")

        # Fallback: return empty list
        return IngredientList(
            name=name,
            list=[],
            total_amount=amount,
            unit=unit
        )

    except Exception as e:
        print(f"Error getting ingredients: {e}")

        # Fallback: return empty list
        return IngredientList(
            name=name,
            list=[],
            total_amount=amount,
            unit=unit
        )