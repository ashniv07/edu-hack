public class DivideByZero {
    static int divideNumbers(int total, int count) {
        return total / count;
    }

    public static void main(String[] args) {
        int[] values = {12, 8, 4};
        System.out.println("First value: " + values[0]);
        System.out.println("About to divide by zero...");
        System.out.println(divideNumbers(values[0] + values[1] + values[2], 0));
    }
}
