# Test: None/Null Reference Error
# This will trigger an AttributeError (like null pointer dereference)

def process_user(user_id):
    # Simulating a database lookup that returns None
    user = find_user(user_id)

    # This will crash - user is None!
    print(f"User name: {user.name}")
    print(f"User email: {user.email}")

def find_user(user_id):
    # User not found, returns None
    users = {1: "Alice", 2: "Bob"}
    if user_id in users:
        return {"name": users[user_id], "email": f"{users[user_id]}@test.com"}
    return None  # User not found

if __name__ == "__main__":
    process_user(999)  # This user doesn't exist
