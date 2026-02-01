const mongoose = require('mongoose');
const Problem = require('../models/Problem');
require('dotenv').config();

// Sample problems for coding battles
const sampleProblems = [
  {
    title: "Two Sum",
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: "easy",
    tags: ["array", "hash-table"],
    constraints: `• 2 <= nums.length <= 10^4
• -10^9 <= nums[i] <= 10^9
• -10^9 <= target <= 10^9
• Only one valid answer exists.`,
    inputFormat: "First line contains space-separated integers (array). Second line contains target integer.",
    outputFormat: "Two space-separated integers representing indices.",
    examples: [
      {
        input: "2 7 11 15\n9",
        output: "0 1",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "3 2 4\n6",
        output: "1 2",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    testCases: [
      {
        input: "2 7 11 15\n9",
        expectedOutput: "0 1",
        isHidden: false,
        points: 20
      },
      {
        input: "3 2 4\n6",
        expectedOutput: "1 2",
        isHidden: false,
        points: 20
      },
      {
        input: "3 3\n6",
        expectedOutput: "0 1",
        isHidden: true,
        points: 30
      },
      {
        input: "-1 -2 -3 -4 -5\n-8",
        expectedOutput: "2 4",
        isHidden: true,
        points: 30
      }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Write your code here
    
}

// Read input
const lines = require('fs').readFileSync(0, 'utf-8').trim().split('\\n');
const nums = lines[0].split(' ').map(Number);
const target = parseInt(lines[1]);

const result = twoSum(nums, target);
console.log(result.join(' '));`,
      python: `def two_sum(nums, target):
    # Write your code here
    pass

# Read input
import sys
lines = sys.stdin.read().strip().split('\\n')
nums = list(map(int, lines[0].split()))
target = int(lines[1])

result = two_sum(nums, target)
print(' '.join(map(str, result)))`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    
}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> nums;
    int num;
    while (iss >> num) nums.push_back(num);
    
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    
    return 0;
}`
    },
    timeLimit: 2000,
    memoryLimit: 256,
    isActive: true
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: "easy",
    tags: ["string", "two-pointers"],
    constraints: `• 1 <= s.length <= 10^5
• s[i] is a printable ascii character.`,
    inputFormat: "A single string to reverse.",
    outputFormat: "The reversed string.",
    examples: [
      {
        input: "hello",
        output: "olleh",
        explanation: "The string 'hello' becomes 'olleh' when reversed."
      },
      {
        input: "Hannah",
        output: "hannaH",
        explanation: "The string 'Hannah' becomes 'hannaH' when reversed."
      }
    ],
    testCases: [
      {
        input: "hello",
        expectedOutput: "olleh",
        isHidden: false,
        points: 25
      },
      {
        input: "Hannah",
        expectedOutput: "hannaH",
        isHidden: false,
        points: 25
      },
      {
        input: "a",
        expectedOutput: "a",
        isHidden: true,
        points: 25
      },
      {
        input: "racecar",
        expectedOutput: "racecar",
        isHidden: true,
        points: 25
      }
    ],
    starterCode: {
      javascript: `function reverseString(s) {
    // Write your code here
    
}

const input = require('fs').readFileSync(0, 'utf-8').trim();
console.log(reverseString(input));`,
      python: `def reverse_string(s):
    # Write your code here
    pass

import sys
s = sys.stdin.read().strip()
print(reverse_string(s))`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

string reverseString(string s) {
    // Write your code here
    
}

int main() {
    string s;
    cin >> s;
    cout << reverseString(s) << endl;
    return 0;
}`
    },
    timeLimit: 2000,
    memoryLimit: 256,
    isActive: true
  },
  {
    title: "Palindrome Number",
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same backward as forward.

For example, 121 is a palindrome while 123 is not.`,
    difficulty: "easy",
    tags: ["math"],
    constraints: `• -2^31 <= x <= 2^31 - 1`,
    inputFormat: "A single integer x.",
    outputFormat: "true if palindrome, false otherwise.",
    examples: [
      {
        input: "121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "-121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-."
      },
      {
        input: "10",
        output: "false",
        explanation: "Reads 01 from right to left."
      }
    ],
    testCases: [
      {
        input: "121",
        expectedOutput: "true",
        isHidden: false,
        points: 20
      },
      {
        input: "-121",
        expectedOutput: "false",
        isHidden: false,
        points: 20
      },
      {
        input: "10",
        expectedOutput: "false",
        isHidden: false,
        points: 20
      },
      {
        input: "12321",
        expectedOutput: "true",
        isHidden: true,
        points: 20
      },
      {
        input: "0",
        expectedOutput: "true",
        isHidden: true,
        points: 20
      }
    ],
    starterCode: {
      javascript: `function isPalindrome(x) {
    // Write your code here
    
}

const x = parseInt(require('fs').readFileSync(0, 'utf-8').trim());
console.log(isPalindrome(x));`,
      python: `def is_palindrome(x):
    # Write your code here
    pass

import sys
x = int(sys.stdin.read().strip())
print('true' if is_palindrome(x) else 'false')`,
      cpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // Write your code here
    
}

int main() {
    int x;
    cin >> x;
    cout << (isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}`
    },
    timeLimit: 2000,
    memoryLimit: 256,
    isActive: true
  },
  {
    title: "Fibonacci Number",
    description: `The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

That is: F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2), for n > 1.

Given n, calculate F(n).`,
    difficulty: "easy",
    tags: ["math", "dynamic-programming", "recursion"],
    constraints: `• 0 <= n <= 30`,
    inputFormat: "A single integer n.",
    outputFormat: "F(n) - the nth Fibonacci number.",
    examples: [
      {
        input: "2",
        output: "1",
        explanation: "F(2) = F(1) + F(0) = 1 + 0 = 1."
      },
      {
        input: "3",
        output: "2",
        explanation: "F(3) = F(2) + F(1) = 1 + 1 = 2."
      },
      {
        input: "4",
        output: "3",
        explanation: "F(4) = F(3) + F(2) = 2 + 1 = 3."
      }
    ],
    testCases: [
      {
        input: "2",
        expectedOutput: "1",
        isHidden: false,
        points: 20
      },
      {
        input: "3",
        expectedOutput: "2",
        isHidden: false,
        points: 20
      },
      {
        input: "4",
        expectedOutput: "3",
        isHidden: false,
        points: 20
      },
      {
        input: "10",
        expectedOutput: "55",
        isHidden: true,
        points: 20
      },
      {
        input: "0",
        expectedOutput: "0",
        isHidden: true,
        points: 20
      }
    ],
    starterCode: {
      javascript: `function fib(n) {
    // Write your code here
    
}

const n = parseInt(require('fs').readFileSync(0, 'utf-8').trim());
console.log(fib(n));`,
      python: `def fib(n):
    # Write your code here
    pass

import sys
n = int(sys.stdin.read().strip())
print(fib(n))`,
      cpp: `#include <iostream>
using namespace std;

int fib(int n) {
    // Write your code here
    
}

int main() {
    int n;
    cin >> n;
    cout << fib(n) << endl;
    return 0;
}`
    },
    timeLimit: 2000,
    memoryLimit: 256,
    isActive: true
  },
  {
    title: "Maximum Subarray",
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    difficulty: "medium",
    tags: ["array", "dynamic-programming", "divide-and-conquer"],
    constraints: `• 1 <= nums.length <= 10^5
• -10^4 <= nums[i] <= 10^4`,
    inputFormat: "Space-separated integers representing the array.",
    outputFormat: "A single integer - the maximum subarray sum.",
    examples: [
      {
        input: "-2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6."
      },
      {
        input: "1",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1."
      },
      {
        input: "5 4 -1 7 8",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum 23."
      }
    ],
    testCases: [
      {
        input: "-2 1 -3 4 -1 2 1 -5 4",
        expectedOutput: "6",
        isHidden: false,
        points: 30
      },
      {
        input: "1",
        expectedOutput: "1",
        isHidden: false,
        points: 20
      },
      {
        input: "5 4 -1 7 8",
        expectedOutput: "23",
        isHidden: true,
        points: 25
      },
      {
        input: "-1",
        expectedOutput: "-1",
        isHidden: true,
        points: 25
      }
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {
    // Write your code here
    
}

const nums = require('fs').readFileSync(0, 'utf-8').trim().split(' ').map(Number);
console.log(maxSubArray(nums));`,
      python: `def max_sub_array(nums):
    # Write your code here
    pass

import sys
nums = list(map(int, sys.stdin.read().strip().split()))
print(max_sub_array(nums))`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Write your code here
    
}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> nums;
    int num;
    while (iss >> num) nums.push_back(num);
    
    cout << maxSubArray(nums) << endl;
    return 0;
}`
    },
    timeLimit: 2000,
    memoryLimit: 256,
    isActive: true
  }
];

// Connect to MongoDB and seed data
const seedProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-battle');
    console.log('✅ Connected to MongoDB');

    // Clear existing problems (optional)
    await Problem.deleteMany({});
    console.log('🗑️  Cleared existing problems');

    // Insert sample problems
    const problems = await Problem.insertMany(sampleProblems);
    console.log(`✅ Seeded ${problems.length} problems successfully`);

    console.log('\n📋 Created Problems:');
    problems.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} (${p.difficulty}) - ID: ${p._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding problems:', error);
    process.exit(1);
  }
};

seedProblems();
