"""
Demo 5: Dictionary Key Error
============================
This demonstrates what happens when you try to access
a key that doesn't exist in a dictionary.

Expected Error: KeyError
"""

def get_grade(grades, student_name):
    """Get a student's grade from the grades dictionary."""

    # BUG: Using direct access without checking if key exists!
    grade = grades[student_name]

    return grade

if __name__ == "__main__":
    # Grade book for the class
    grades = {
        "Alice": 95,
        "Bob": 87,
        "Charlie": 92,
        "Diana": 88
    }

    print("Grade Book:", grades)
    print("-" * 30)

    # These work fine
    print(f"Alice's grade: {get_grade(grades, 'Alice')}")
    print(f"Bob's grade: {get_grade(grades, 'Bob')}")

    # BUG: "David" is not in the grade book!
    print(f"David's grade: {get_grade(grades, 'David')}")
