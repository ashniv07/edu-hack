# Test: Type Error
# This will trigger a TypeError for type mismatch

def calculate_total(items):
    total = 0

    for item in items:
        # This will crash when item is a string!
        total += item * 2

    return total

if __name__ == "__main__":
    # Mixed types - integers and strings
    shopping_cart = [10, 20, "free item", 30]

    result = calculate_total(shopping_cart)
    print(f"Total: {result}")
