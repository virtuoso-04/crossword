document.addEventListener("DOMContentLoaded", () => {
    const grid = [
        ['', '', '', '', '', '', '', '', '', '', '', '', '', 'C', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', 'A', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'B', '', '', '', 'I', '', 'P', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'O', '', '', '', 'N', '', 'I', '', '', '', '', '', ''],
        ['', '', '', '', '', 'I', 'P', 'O', '', '', '', 'V', '', 'T', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'T', 'R', 'A', 'D', 'E', 'M', 'A', 'R', 'K', '', '', '', ''],
        ['', '', '', '', '', '', '', 'S', '', '', '', 'S', '', 'L', '', '', '', '', '', ''],
        ['', '', 'P', 'A', 'T', 'E', 'N', 'T', '', '', '', 'T', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', 'R', '', '', '', 'M', 'O', 'N', 'O', 'P', 'O', 'L', 'Y', ''],
        ['', '', '', '', '', 'B', '', 'A', '', '', '', 'E', '', '', '', '', '', '', '', ''],
        ['S', 'U', 'B', 'S', 'C', 'R', 'I', 'P', 'T', 'I', 'O', 'N', '', '', '', '', '', '', '', ''],
        ['', '', '', 'T', '', 'E', '', '', '', '', '', 'T', '', '', '', '', '', '', '', ''],
        ['', '', '', 'A', '', 'A', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'R', '', 'K', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'T', '', 'E', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'U', '', 'V', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', 'P', '', 'E', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', 'N', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
    ];

    const acrossHints = [
        { number: 4, hint: 'Process where private companies sell their shares to the public to raise equity capital from the public investors.' },
        { number: 5, hint: 'A symbol, word, or words legally registered or established by use as representing a company or product.' },
        { number: 6, hint: 'Exclusive right granted for an invention, protecting it from unauthorized use.' },
        { number: 7, hint: 'A market structure where a single company or entity controls the entire supply of goods or services.' },
        { number: 9, hint: 'A regular payment made to access a service or product, often on a monthly or yearly basis.' }
    ];

    const downHints = [
        { number: 1, hint: 'Financial assets or resources necessary for starting or growing a business.' },
        { number: 2, hint: 'To start a business with minimal financial resources, often relying on personal savings.' },
        { number: 3, hint: 'The act of allocating money into a business with the expectation of achieving a profit or gain.' },
        { number: 8, hint: 'The point at which total revenues equal total expenses, indicating no net loss or gain.' },
        { number: 10, hint: 'A newly established business, often in its early stages of development.' }
    ];

    async function fetchLeaderboard() {
        try {
            const leaderboardList = document.getElementById("leaderboard");
            leaderboardList.innerHTML = '';
    
            const snapshot = await db.collection('leaderboard').orderBy('score', 'desc').get();
            snapshot.forEach(doc => {
                const entry = doc.data();
                const li = document.createElement("li");
                li.innerText = `${entry.name}: ${entry.score}`;
                leaderboardList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
        }
    }
    
    async function addToLeaderboard(name, score) {
        try {
            await db.collection('leaderboard').add({
                name: name,
                score: score
            });
            fetchLeaderboard(); // Update leaderboard after adding new entry
        } catch (error) {
            console.error("Error adding to leaderboard:", error);
        }
    }
    
    

    function createGrid() {
        const crossword = document.getElementById("crossword");

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");

                if (grid[i][j] !== '') {
                    const input = document.createElement("input");
                    input.setAttribute("maxlength", "1");
                    cell.appendChild(input);
                }

                crossword.appendChild(cell);
            }
        }
    }

    function addClueNumbers() {
        const cells = document.querySelectorAll(".cell");

        const isFirstCellOfAcrossWord = (row, col) => (
            (col === 0 || grid[row][col - 1] === '') && (col + 1 < 20 && grid[row][col + 1] !== '')
        );

        const isFirstCellOfDownWord = (row, col) => (
            (row === 0 || grid[row - 1][col] === '') && (row + 1 < 20 && grid[row + 1][col] !== '')
        );

        let clueNumber = 1;

        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (grid[i][j] !== '') {
                    if (isFirstCellOfAcrossWord(i, j) || isFirstCellOfDownWord(i, j)) {
                        const cell = cells[i * 20 + j];
                        const clueNumberElement = document.createElement("span");
                        clueNumberElement.classList.add("clue-number");
                        clueNumberElement.innerText = clueNumber++;
                        cell.appendChild(clueNumberElement);
                    }
                }
            }
        }
    }

    function addHints() {
        const acrossList = document.getElementById("across-hints");
        const downList = document.getElementById("down-hints");

        acrossHints.forEach(clue => {
            const li = document.createElement("li");
            li.innerText = `${clue.number}. ${clue.hint}`;
            acrossList.appendChild(li);
        });

        downHints.forEach(clue => {
            const li = document.createElement("li");
            li.innerText = `${clue.number}. ${clue.hint}`;
            downList.appendChild(li);
        });
    }

    function checkAnswers() {
        const cells = document.querySelectorAll(".cell");
        let correctCount = 0;
        let totalCells = 0;
    
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 20; j++) {
                if (grid[i][j] !== '') {
                    totalCells++;
                    const input = cells[i * 20 + j].querySelector("input");
                    if (input.value.toUpperCase() === grid[i][j]) {
                        correctCount++;
                    }
                }
            }
        }
    
        return { correctCount, totalCells };
    }
    
    document.getElementById("submit-btn").addEventListener("click", () => {
        const result = document.getElementById("result");
        const { correctCount, totalCells } = checkAnswers();
        if (correctCount === totalCells) {
            const name = prompt("Congratulations! Enter your name for the leaderboard:");
            if (name) {
                addToLeaderboard(name, correctCount);
            }
            result.innerText = "Correct! Well done!";
            result.style.color = "green";
        } else {
            result.innerText = `Some answers are incorrect. You got ${correctCount} out of ${totalCells} correct. Please try again.`;
            result.style.color = "red";
        }
    });
    

    createGrid();
    addClueNumbers();
    addHints();
    fetchLeaderboard();
});