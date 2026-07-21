# Test: Recursion Error (Stack Overflow)
# This will trigger a RecursionError

def countdown(n):
    print(f"Counting: {n}")
    # Bug: forgot base case, infinite recursion!
    countdown(n - 1)

if __name__ == "__main__":
    countdown(5)
