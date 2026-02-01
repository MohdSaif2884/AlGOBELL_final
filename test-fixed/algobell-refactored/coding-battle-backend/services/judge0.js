const axios = require('axios');

// Language IDs for Judge0
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  python: 71,      // Python 3
  cpp: 54,         // C++ (GCC)
  java: 62         // Java
};

class Judge0Service {
  constructor() {
    this.apiUrl = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
    this.apiKey = process.env.JUDGE0_API_KEY;
  }

  // Submit code for execution
  async submitCode(code, languageId, stdin = '', expectedOutput = '') {
    try {
      const response = await axios.post(
        `${this.apiUrl}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: languageId,
          stdin: stdin,
          expected_output: expectedOutput,
          cpu_time_limit: 2,
          memory_limit: 256000
        },
        {
          headers: {
            'content-type': 'application/json',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'x-rapidapi-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Judge0 submission error:', error.response?.data || error.message);
      throw new Error('Code execution failed');
    }
  }

  // Get submission result
  async getSubmission(token) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/submissions/${token}?base64_encoded=false`,
        {
          headers: {
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'x-rapidapi-key': this.apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Judge0 get submission error:', error.response?.data || error.message);
      throw new Error('Failed to get submission result');
    }
  }

  // Execute code against test cases
  async executeCode(code, language, testCases) {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      throw new Error('Unsupported language');
    }

    const results = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const result = await this.submitCode(
          code,
          languageId,
          testCase.input,
          testCase.expectedOutput
        );

        const passed = result.status.id === 3; // Accepted
        allPassed = allPassed && passed;

        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout || result.stderr || '',
          passed: passed,
          status: result.status.description,
          time: result.time,
          memory: result.memory
        });

        // Stop if any test case fails (optional)
        if (!passed && !testCase.isHidden) {
          break;
        }
      } catch (error) {
        allPassed = false;
        results.push({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          passed: false,
          status: 'Execution Error',
          error: error.message
        });
        break;
      }
    }

    return {
      allPassed,
      results,
      totalTests: testCases.length,
      passedTests: results.filter(r => r.passed).length
    };
  }

  // Quick validation (for battle submissions)
  async quickValidate(code, language, testCase) {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      throw new Error('Unsupported language');
    }

    try {
      const result = await this.submitCode(
        code,
        languageId,
        testCase.input,
        testCase.expectedOutput
      );

      return {
        passed: result.status.id === 3,
        status: result.status.description,
        output: result.stdout,
        error: result.stderr,
        time: result.time,
        memory: result.memory
      };
    } catch (error) {
      return {
        passed: false,
        status: 'Error',
        error: error.message
      };
    }
  }
}

module.exports = new Judge0Service();
