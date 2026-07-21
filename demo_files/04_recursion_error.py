"""
Demo 4: Infinite Recursion Error
================================
This demonstrates what happens when a recursive function
doesn't have a proper base case to stop.

Expected Error: RecursionError
"""

def countdown(n):
    """Count down from n to 0."""
    print(f"Counting: {n}")

    # BUG: No base case! This will recurse forever.
    # Should check: if n <= 0: return
    countdown(n - 1)

if __name__ == "__main__":
    print("Starting countdown from 5...")
    print("-" * 20)

    countdown(5)

    print("-" * 20)
    print("Countdown complete!")
