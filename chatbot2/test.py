from PetsRec import PetRecSystem 

rec = PetRecSystem('pet.json') 

result = rec.get_pet_recommendation('user_history_log.json')

if isinstance(result, dict) and "error" in result:
    print(f"Error: {result['error']}")
elif result:
    print(f"The recommended pet: {result['pet_name']}")
    print(f"Description: {result['description']}")
else:
    print("No result was found.")