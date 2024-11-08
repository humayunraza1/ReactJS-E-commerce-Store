class Solutions:

    @staticmethod
    def count_inversions(arr):
        def merge_and_count(arr, temp_arr, left, mid, right):
            i, j, k = left, mid + 1, left
            inversions = 0
            
            # Merge the two halves and count inversions
            while i <= mid and j <= right:
                if arr[i] <= arr[j]:
                    temp_arr[k] = arr[i]
                    i += 1
                else:
                    temp_arr[k] = arr[j]
                    inversions += (mid - i + 1)  # Count inversions
                    j += 1
                k += 1

            # Copy remaining elements of left subarray
            while i <= mid:
                temp_arr[k] = arr[i]
                i += 1
                k += 1

            # Copy remaining elements of right subarray
            while j <= right:
                temp_arr[k] = arr[j]
                j += 1
                k += 1

            # Copy the sorted subarray into the original array
            for i in range(left, right + 1):
                arr[i] = temp_arr[i]
            
            return inversions

        def merge_sort_and_count(arr, temp_arr, left, right):
            inversions = 0
            if left < right:
                mid = (left + right) // 2

                inversions += merge_sort_and_count(arr, temp_arr, left, mid)
                inversions += merge_sort_and_count(arr, temp_arr, mid + 1, right)
                inversions += merge_and_count(arr, temp_arr, left, mid, right)
            
            return inversions

        # Initialize a temporary array
        temp_arr = [0] * len(arr)
        return merge_sort_and_count(arr, temp_arr, 0, len(arr) - 1)


    @staticmethod
    def find_first_one(arr):
        left = 0
        right = len(arr) - 1
        result = -1  # Initialize result to indicate if no 1 is found

        while left <= right:
            mid = (left + right) // 2

            if arr[mid] == 1:
                result = mid  # Found a 1, but we need to check for earlier ones
                right = mid - 1  # Continue searching in the left half
            else:
                left = mid + 1  # Continue searching in the right half

        return result  # Returns the index of the first 1, or -1 if no 1 is found


    # @staticmethod
    # def random_vs_linear_search(arr, target):
    #     return ""

    @staticmethod
    def min_additions_for_beautiful_sequence(seq):
        def longest_palindromic_subseq(seq):
            # Reverse the sequence
            seq_reversed = seq[::-1]
            # Use longest common subsequence between seq and seq_reversed
            return longest_common_subsequence(seq, seq_reversed)
        
        def longest_common_subsequence(arr1, arr2):
            n = len(arr1)
            # DP table to store lengths of longest common subsequence
            dp = [[0] * (n + 1) for _ in range(n + 1)]
            
            # Fill DP table
            for i in range(1, n + 1):
                for j in range(1, n + 1):
                    if arr1[i - 1] == arr2[j - 1]:
                        dp[i][j] = dp[i - 1][j - 1] + 1
                    else:
                        dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
            
            return dp[n][n]

        # Calculate minimum additions
        longest_palindrome_len = longest_palindromic_subseq(seq)
        return len(seq) - longest_palindrome_len


if __name__ == "__main__":

    # Question 1
    testcase1 = [
        [5, 2, 6, 1],
        [4, 7, 3, 5, 1],
        [6, 5, 4, 3, 2, 1]
    ]

    answers1 = [4, 7, 15]

    for i in range(3):
        ans = Solutions.count_inversions(testcase1[i])
        if ans == answers1[i]:
            print(f"Test case {i} passed!")
        else:
            print(f"Test case {i} failed!")

    # Question 2
    testcase2 = [
        [0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1]
    ]

    answers2 = [4, 3, 1]

    for i in range(3):
        ans = Solutions.find_first_one(testcase2[i])
        if ans == answers2[i]:
            print(f"Test case {i} passed!")
        else:
            print(f"Test case {i} failed!")

    # Question 4
    testcase4 = [
        [1, 2, 3, 1],
        [1, 2, 3, 3, 2, 1],
        [2, 4, 3, 2, 4, 3]
    ]

    answers4 = [1, 0, 3]

    for i in range(3):
        ans = Solutions.min_additions_for_beautiful_sequence(testcase4[i])
        if ans == answers4[i]:
            print(f"Test case {i} passed!")
        else:
            print(f"Test case {i} failed!")

    # Grading Test Cases
    GradingTestCases1 = [
        [5, 2, 6, 1, 2, 1, 4, 5, 2, 5, 6, 7, 3, 2, 5],
        [4, 6, 2, 7, 9, 4, 3, 5, 1, 5, 7, 2, 5],
        [6, 5, 4, 3, 2, 1, 1, 4, 4, 5, 2, 4, 5, 1, 1, 8, 9, 3, 3]
    ]

    GradingTestCases2 = [
        [0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0] * 39 + [1] * 10
    ]

    GradingTestCases4 = [
        [1, 2, 2, 3, 5, 6, 4, 1, 4, 6, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        [1, 2, 2, 3, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 4, 3, 2, 1, 3, 6, 1, 7, 9, 0, 1, 4],
        [4, 2, 4, 5, 2, 4, 5, 6, 2, 5, 2, 6, 8, 2, 4, 6, 2, 5, 4, 4]
    ]

    for i in range(3):
        ans = Solutions.count_inversions(GradingTestCases1[i])
        print(f"Grading Test case {i} : {ans}")
    for i in range(3):
        ans = Solutions.find_first_one(GradingTestCases2[i])
        print(f"Grading Test case {i} : {ans}")
    for i in range(3):
        ans = Solutions.min_additions_for_beautiful_sequence(GradingTestCases4[i])
        print(f"Grading Test case {i} : {ans}")