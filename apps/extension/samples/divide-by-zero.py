def divide_numbers(total: int, count: int) -> float:
    return total / count


def main() -> None:
    values = [12, 8, 4]
    print(f"First value: {values[0]}")
    print("About to divide by zero...")
    print(divide_numbers(sum(values), 0))


if __name__ == "__main__":
    main()
>