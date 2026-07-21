# Test: Memory Visualization Demo (No Error)
# This file demonstrates memory concepts without crashing

def memory_demo():
    # Stack variables (primitives)
    x = 10
    y = 20
    z = x + y

    # Heap allocations (objects)
    numbers = [1, 2, 3, 4, 5]
    person = {"name": "Alice", "age": 25}

    # Reference/Pointer behavior
    ptr = numbers          # ptr points to same list
    ptr.append(6)          # modifies original list

    # Reassignment
    original = [100, 200]
    copy_ref = original    # both point to same memory
    original = [999]       # original now points elsewhere
    # copy_ref still points to [100, 200]

    print(f"z = {z}")
    print(f"numbers = {numbers}")
    print(f"copy_ref = {copy_ref}")

if __name__ == "__main__":
    memory_demo()
