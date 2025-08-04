# Final Project: Assessments and Tests of the SimpleDEX (Module 3)

This repository contains the validation tests for the `SimpleDEX.sol` contract, developed as part of the final project for Module 3. The project uses the Hardhat development environment to compile, test, and measure the smart contract's code coverage.

---

## Student

- **Name:** Gustavo Torres Castro
- **Email (used for the branch):** gustavotorrescastro@gmail.com

---

## Tools Used

- **Node.js**
- **Hardhat**: Development and testing environment.
- **Ethers.js**: Library for interacting with the blockchain.
- **Chai**: Assertion library for tests.
- **Solidity Coverage**: Plugin to generate code coverage reports.
- **OpenZeppelin Contracts**: For interfaces and base contracts, like `Ownable`.
- **Alchemy**: As a node provider for network interaction.

---

## How to Run the Project

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Gustavotorrescastro/Project-Module-4-ETHKIPU](https://github.com/Gustavotorrescastro/Project-Module-4-ETHKIPU)
    ```

2.  **Navigate into the project folder:**
    ```bash
    cd Project-Module-4-ETHKIPU
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run validation tests:**
    All 12 tests should pass successfully.
    ```bash
    npx hardhat test
    ```

5.  **Generate the code coverage report:**
    This command creates the `/coverage` folder with the HTML report.
    ```bash
    npx hardhat coverage
    ```

---

## Deliverables

### 1. Test Scripts

The test scripts are located in `test/simpleDEX.test.js`. They cover the DEX's deployment, liquidity management, token swaps, and price calculations.

### 2. Coverage Report

The generated HTML report is located in the `/coverage` folder. To view it, open the `coverage/index.html` file in a web browser.

### 3. Alchemy Endpoint

The endpoint configured on the Alchemy platform for API interaction with the **Sepolia** network is:

`https://eth-sepolia.g.alchemy.com/v2/qvp_mNdwQRKXktdC52ZMr`
