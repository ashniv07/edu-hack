# Test: Index Out of Bounds Error
# This will trigger an IndexError for the AI Tutor to analyze

def access_list():
    numbers = [10, 20, 30, 40, 50]

    # This works fine
    print(f"First element: {numbers[0]}")
    print(f"Last element: {numbers[4]}")

    # This will crash - index 10 doesn't exist!
    print(f"Invalid access: {numbers[10]}")

if __name__ == "__main__":
    access_list()
