import os
import json
import logging
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


def identify_log(image_class: str, name: str, desc: str = "") -> FoodItem:
    # Construct the prompt
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

        return FoodItem(
            name=food_data["name"],
            description=food_data["description"]
        )

    except json.JSONDecodeError as e:
        # Fallback if JSON parsing fails
        print(f"JSON parsing error: {e}")
        print(f"Response received: {response_text}")
        return FoodItem(
            name=name,
            description=f"Identified as {image_class}. {desc if desc else 'No additional information available.'}"
        )

    except Exception as e:
        print(f"Error during identification: {e}")
        return FoodItem(
            name=name,
            description=f"Error in identification. Preliminary class: {image_class}"
        )


# Example usage
if __name__ == "__main__":
    # Test the function
    result = identify_log(
        image_class="pizza_margherita",
        name="Pizza",
        desc="Round flatbread with tomato sauce and cheese"
    )

    print(f"Food Name: {result.name}")
    print(f"Description: {result.description}")