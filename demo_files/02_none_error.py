"""
Demo 2: None/Null Reference Error
==================================
This demonstrates what happens when you try to access
an attribute on a None value (similar to null pointer).

Expected Error: AttributeError
"""

class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

def find_user_by_id(user_id):
    """Simulates a database lookup that might return None."""
    # Our "database" of users
    users = {
        1: User("Alice", "alice@example.com"),
        2: User("Bob", "bob@example.com"),
        3: User("Charlie", "charlie@example.com"),
    }

    # Returns None if user not found
    return users.get(user_id)

def display_user_profile(user_id):
    """Display a user's profile information."""
    user = find_user_by_id(user_id)

    # BUG: We didn't check if user is None!
    print(f"Name: {user.name}")
    print(f"Email: {user.email}")

if __name__ == "__main__":
    print("Looking up user #999...")

    # User 999 doesn't exist in our database
    display_user_profile(999)
