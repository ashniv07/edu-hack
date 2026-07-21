"""
Demo 6: Division by Zero Error
==============================
This demonstrates what happens when you try to divide
a number by zero.

Expected Error: ZeroDivisionError
"""

def calculate_average(total, count):
    """Calculate the average from total and count."""

    # BUG: If count is 0, this will crash!
    average = total / count

    return average

def process_class_scores(scores):
    """Process a list of scores and calculate statistics."""
    total = sum(scores)
    count = len(scores)

    print(f"Total points: {total}")
    print(f"Number of students: {count}")

    average = calculate_average(total, count)
    print(f"Class average: {average:.2f}")

if __name__ == "__main__":
    print("Processing class scores...")
    print("-" * 30)

    # Empty list - no students!
    scores = []

    process_class_scores(scores)
