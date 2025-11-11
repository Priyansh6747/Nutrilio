import requests

def make_api_call(HRI: str):
    # Build the API endpoint using the product code / barcode
    url = f"https://world.openfoodfacts.org/api/v2/product/{HRI}.json"
    
    # Send GET request to OpenFoodFacts API
    response = requests.get(url)
    
    # If API fails (network issues, invalid URL, etc.), return None
    if response.status_code != 200:
        return None
    
    # Raise exception for 4xx / 5xx, if any
    response.raise_for_status()
    
    # Return full JSON data
    return response.json()


def extract_product_info(json1):
    # Extract the 'product' block from API response
    product = json1.get('product', {})

    # Create a simplified product dictionary with selected fields
    simplified_product = {
        '_id': product.get('_id'),
        '_keywords': product.get('_keywords', []),
        'added_countries_tags': product.get('added_countries_tags', []),
        'allergens': product.get('allergens', ''),
        'allergens_from_ingredients': product.get('allergens_from_ingredients', ''),
        'brands': product.get('brands'),
        'brands_tags': product.get('brands_tags', []),
        'categories_properties': product.get('categories_properties', {}),
        'categories_properties_tags': product.get('categories_properties_tags', []),
        'checkers_tags': product.get('checkers_tags', []),
        'code': product.get('code'),
        'codes_tags': product.get('codes_tags', []),
        'complete': product.get('complete'),
        'completeness': product.get('completeness'),
        'correctors_tags': product.get('correctors_tags', []),
        'countries': product.get('countries'),
        'countries_hierarchy': product.get('countries_hierarchy', []),
        'countries_tags': product.get('countries_tags', []),
        'created_t': product.get('created_t'),
        'food_groups_tags': product.get('food_groups_tags', []),
        'id': product.get('id'),
        'image_front_small_url': product.get('image_front_small_url'),
        'image_front_thumb_url': product.get('image_front_thumb_url'),
        'image_front_url': product.get('image_front_url'),
        'image_small_url': product.get('image_small_url'),
        'image_thumb_url': product.get('image_thumb_url'),
        'image_url': product.get('image_url'),
        'images': product.get('images', {}),
        'informers_tags': product.get('informers_tags', []),
        'interface_version_created': product.get('interface_version_created'),
        'interface_version_modified': product.get('interface_version_modified'),
        'lang': product.get('lang'),
        'languages': product.get('languages', {}),
        'languages_codes': product.get('languages_codes', {}),
        'languages_hierarchy': product.get('languages_hierarchy', []),
        'languages_tags': product.get('languages_tags', []),
        'last_edit_dates_tags': product.get('last_edit_dates_tags', []),
        'last_editor': product.get('last_editor'),
        'last_image_dates_tags': product.get('last_image_dates_tags', []),
        'nova_group_debug': product.get('nova_group_debug'),
        'nova_group_error': product.get('nova_group_error'),
        'nova_groups_tags': product.get('nova_groups_tags', []),
        'nutrient_levels': product.get('nutrient_levels', {}),
        'nutrient_levels_tags': product.get('nutrient_levels_tags', []),
        'nutriments': product.get('nutriments', {}),
        'nutriscore': product.get('nutriscore', {}),
        'nutriscore_2021_tags': product.get('nutriscore_2021_tags', []),
        'nutriscore_2023_tags': product.get('nutriscore_2023_tags', []),
        'nutriscore_grade': product.get('nutriscore_grade'),
        'nutriscore_tags': product.get('nutriscore_tags', []),
        'nutriscore_version': product.get('nutriscore_version'),
        'nutrition_data': product.get('nutrition_data'),
        'nutrition_data_per': product.get('nutrition_data_per'),
        'nutrition_data_prepared_per': product.get('nutrition_data_prepared_per'),
        'nutrition_grade_fr': product.get('nutrition_grade_fr'),
        'nutrition_grades': product.get('nutrition_grades'),
        'nutrition_grades_tags': product.get('nutrition_grades_tags', []),
        'nutrition_score_beverage': product.get('nutrition_score_beverage'),
        'nutrition_score_debug': product.get('nutrition_score_debug'),
        'nutrition_score_warning_no_fiber': product.get('nutrition_score_warning_no_fiber'),
        'nutrition_score_warning_no_fruits_vegetables_nuts': product.get(
            'nutrition_score_warning_no_fruits_vegetables_nuts'),
        'packaging_materials_tags': product.get('packaging_materials_tags', []),
        'packaging_recycling_tags': product.get('packaging_recycling_tags', []),
        'packaging_shapes_tags': product.get('packaging_shapes_tags', []),
        'packagings': product.get('packagings', []),
        'packagings_materials': product.get('packagings_materials', {}),
        'photographers_tags': product.get('photographers_tags', []),
        'pnns_groups_1': product.get('pnns_groups_1'),
        'pnns_groups_1_tags': product.get('pnns_groups_1_tags', []),
        'pnns_groups_2': product.get('pnns_groups_2'),
        'pnns_groups_2_tags': product.get('pnns_groups_2_tags', []),
        'product_name': product.get('product_name'),
        'product_name_en': product.get('product_name_en'),
        'product_type': product.get('product_type'),
        'removed_countries_tags': product.get('removed_countries_tags', []),
        'rev': product.get('rev'),
        'scans_n': product.get('scans_n'),
        'schema_version': product.get('schema_version'),
        'selected_images': product.get('selected_images', {}),
    }

    # Extra fields: only add if present to avoid clutter
    if 'serving_quantity' in product:
        simplified_product['serving_quantity'] = product['serving_quantity']
    if 'serving_size' in product:
        simplified_product['serving_size'] = product['serving_size']

    # Remove all entries where value is None to keep output clean
    simplified_product = {k: v for k, v in simplified_product.items() if v is not None}

    # Final response structure expected by your app
    result = {
        'code': json1.get('code'),
        'product': simplified_product,
        'status': json1.get('status'),
        'status_verbose': json1.get('status_verbose')
    }

    return result


def read_barcode(barcode: str):
    # Call the API wrapper function to fetch product details
    data = make_api_call(barcode)

    # If no data OR product not found (status == 0), return None
    if data is None or data.get("status") == 0:
        return None

    # Extract and return simplified product information
    return extract_product_info(data)
# Example usage:
# barcode_info = read_barcode("737628064502")
# print(barcode_info)