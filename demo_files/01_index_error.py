"""
Demo 1: Index Out of Bounds Error
=================================
This demonstrates what happens when you try to access
an array element that doesn't exist.

Expected Error: IndexError
"""

def get_student_score(scores, student_number):
    """Get a student's score from the scores list."""
    # List has 5 elements (indices 0-4)
    scores = [85, 92, 78, 95, 88]

    # BUG: Trying to access index 10, but list only has 5 elements!
    student_score = scores[10]

    return student_score

if __name__ == "__main__":
    scores = [85, 92, 78, 95, 88]
    print("Class Scores:", scores)
    print("Getting student #10's score...")

    result = get_student_score(scores, 10)
    print(f"Score: {result}")
