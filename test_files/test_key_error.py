# Test: Key Error
# This will trigger a KeyError for missing dictionary key

def get_student_grade(students, name):
    # This will crash if name doesn't exist!
    grade = students[name]
    return grade

if __name__ == "__main__":
    grades = {
        "Alice": 95,
        "Bob": 87,
        "Charlie": 92
    }

    # These work
    print(f"Alice's grade: {get_student_grade(grades, 'Alice')}")
    print(f"Bob's grade: {get_student_grade(grades, 'Bob')}")

    # This will crash - "David" doesn't exist
    print(f"David's grade: {get_student_grade(grades, 'David')}")
