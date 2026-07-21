"""
Demo 3: Type Mismatch Error
===========================
This demonstrates what happens when you try to perform
an operation on incompatible types.

Expected Error: TypeError
"""

def calculate_total_price(items):
    """Calculate the total price of items in a shopping cart."""
    total = 0

    for item in items:
        # BUG: One item is a string, can't multiply string by int!
        total = total + (item * 2)

    return total

if __name__ == "__main__":
    # Shopping cart with prices
    # Notice: "free" is a string, not a number!
    cart = [10, 25, "free", 15, 30]

    print("Shopping Cart:", cart)
    print("Calculating total (with 2x multiplier)...")

    total = calculate_total_price(cart)
    print(f"Total: ${total}")
