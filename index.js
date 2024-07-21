const heroSection = document.getElementsByClassName("hero-section")[0];
const metadata = document.getElementsByClassName("metadata")[0];
const statsSection = document.getElementsByClassName("stats")[0];
const BASE_URL = "https://cfc-player-management.onrender.com";

// Render player information
const renderPlayerInfo = (player) => {
  metadata.innerHTML = "";
  const singlePlayerImage = document.createElement("img");
  singlePlayerImage.classList.add("single-player-image");
  singlePlayerImage.src = player.image;
  metadata.appendChild(singlePlayerImage);

  const playerInfo = document.createElement("div");
  playerInfo.classList.add("player-info");

  // Edit button
  const editButton = document.createElement("i");
  editButton.classList.add("edit-btn", "fa-solid", "fa-pencil");
  editButton.addEventListener("click", () => editPlayer(player.id));
  playerInfo.appendChild(editButton);

  // Delete button
  const deleteButton = document.createElement("i");
  deleteButton.classList.add("delete-btn", "fa-solid", "fa-trash-can");
  deleteButton.addEventListener("click", () => {});
  playerInfo.appendChild(deleteButton);

  // Player name
  const name = document.createElement("h3");
  name.classList.add("single-player-name");
  name.innerText = player.name;
  playerInfo.appendChild(name);

  // Nationality
  const nationality = document.createElement("p");
  nationality.innerText = `Nationality: ${player.nationality}`;
  playerInfo.appendChild(nationality);

  // Position
  const position = document.createElement("p");
  position.innerText = `Position: ${player.position}`;
  playerInfo.appendChild(position);

  // Date of Birth
  const dob = document.createElement("p");
  dob.innerText = `Date Of Birth: ${player.date_of_birth}`;
  playerInfo.appendChild(dob);

  metadata.appendChild(playerInfo);
};

// Render player statistics
const renderPlayerStats = (playingHistory = []) => {
  statsSection.innerHTML = "";

  const playerStats = document.createElement("div");
  playerStats.classList.add("player-stats");

  const playerStatsTitle = document.createElement("h3");
  playerStatsTitle.classList.add("player-stats-title");
  if (playingHistory.length) {
    playerStatsTitle.innerText = "Player Statistics";
  }
  playerStats.appendChild(playerStatsTitle);

  const table = document.createElement("table");
  table.classList.add("player-stats-table");
  if (!playingHistory.length) {
    table.classList.add("player-stats-table-none");
  }

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const seasonHeader = document.createElement("th");
  seasonHeader.innerText = "Season";
  headerRow.appendChild(seasonHeader);

  const appearancesHeader = document.createElement("th");
  appearancesHeader.innerText = "Appearances";
  headerRow.appendChild(appearancesHeader);

  const goalsHeader = document.createElement("th");
  goalsHeader.innerText = "Goals";
  headerRow.appendChild(goalsHeader);

  const assistsHeader = document.createElement("th");
  assistsHeader.innerText = "Assists";
  headerRow.appendChild(assistsHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  playingHistory.forEach((record) => {
    const row = document.createElement("tr");

    const seasonCell = document.createElement("td");
    seasonCell.innerText = record.season;
    row.appendChild(seasonCell);

    const appearancesCell = document.createElement("td");
    appearancesCell.innerText = record.appearances;
    row.appendChild(appearancesCell);

    const goalsCell = document.createElement("td");
    goalsCell.innerText = record.goals || 0;
    row.appendChild(goalsCell);

    const assistsCell = document.createElement("td");
    assistsCell.innerText = record.assists || 0;
    row.appendChild(assistsCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  playerStats.appendChild(table);
  statsSection.appendChild(playerStats);
};

// Get single player to display as banner
const singlePlayer = async (playerId) => {
  try {
    const res = await fetch(`${BASE_URL}/current_squad/${playerId}`);
    const player = await res.json();

    renderPlayerInfo(player);
    renderPlayerStats(player.playing_history);
  } catch (err) {
    renderErrorMessage("Something went wrong!");
  }
};

const renderErrorMessage = (message) => {
  const errorContainer = document.getElementById("error-container");
  errorContainer.innerHTML = message;
};

const displayPlayers = async (playerName = "") => {
  try {
    const res = await fetch(`${BASE_URL}/current_squad`);
    const result = await res.json();

    // filtered results
    const filteredResults = playerName
      ? result.filter((item) =>
          item.name.toLowerCase().includes(playerName.toLowerCase()),
        )
      : result;

    const players = document.getElementById("players");

    players.innerHTML = "";
    let playerItems = "";
    playerItems += `<div class="search-input-container"><input class="search-input" type="text"><i class="search-btn fa-solid fa-magnifying-glass"></i></div>`;
    playerItems +=
      '<div class="other-players-title"><h2>Players</h2><i class="fa-solid fa-plus"></i></div>';

    filteredResults.forEach((item) => {
      playerItems += `<li id="${item.id}" class="player-item">${item.name}`;
    });

    players.innerHTML = playerItems;
    document.querySelectorAll(".player-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const playerId = e.target.id;
        singlePlayer(playerId);
      });
    });

    // add event listener to search icon
    const searchBtn = document.querySelector(".search-btn");
    searchBtn.addEventListener("click", () => {
      const searchInput = document.querySelector(".search-input").value;
      if (searchInput.trim() == "") {
        displayPlayers();
      } else {
        displayPlayers(searchInput);
      }
    });

    // add event listener for "Enter" keypress
    const searchInput = document.querySelector(".search-input");
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (searchInput.value.trim() == "") {
          displayPlayers();
        } else {
          displayPlayers(searchInput.value);
        }
      }
    });

    // add event listener to the add player icon
    const addPlayerBtn = document.querySelector(".fa-plus");
    addPlayerBtn.addEventListener("click", () => renderAddPlayerForm());
  } catch (error) {
    renderErrorMessage("Something went wrong");
  }
};

(async function () {
  const res = await fetch(`${BASE_URL}/current_squad`);
  const result = await res.json();
  singlePlayer(result[0].id);
  displayPlayers();
})();

const editPlayer = async (playerId) => {
  try {
    const res = await fetch(`${BASE_URL}/current_squad/${playerId}`);
    const player = await res.json();
    renderEditForm(player);
  } catch (error) {
    renderErrorMessage(
      "Something went wrong while fetching the player details",
    );
  }
};

// Render edit form
const renderEditForm = (player) => {
  metadata.innerHTML = `
    <form id="edit-player-form">
      <div>
        <label for="player-name">Name:</label>
        <input type="text" id="player-name" value="${player.name}" required>
      </div>
      
      <div>
        <label for="player-nationality">Nationality:</label>
        <input type="text" id="player-nationality" value="${player.nationality}" required>
      </div>
      
      <div>
        <label for="player-position">Position:</label>
        <input type="text" id="player-position" value="${player.position}" required>
      </div>
      
      <div>
        <label for="player-dob">Date of Birth:</label>
        <input type="date" id="player-dob" value="${player.date_of_birth}" required>
      </div>

      <div>
        <label for="player-image">Image URL:</label>
        <input type="text" id="player-image" value="${player.image}" required>
      </div>

      <div>
        <label for="contract-start-date">Contract Start Date:</label>
        <input type="date" id="contract-start-date" value="${player.contract_details.start_date}" required>
        </div>

      <div>
        <label for="contract-end-date">Contract End Date:</label>
        <input type="date" id="contract-end-date" value="${player.contract_details.end_date}" required>
      </div>

      <div>
        <label for="contract-salary">Contract Salary:</label>
        <input type="number" id="contract-salary" value="${player.contract_details.salary}" required>
      </div>

      <div id="player-stats-container">
        <h3>Player Statistics</h3>
      </div>

      <button type="submit">Save</button>
    </form>
  `;

  // Clear the stats section
  statsSection.innerHTML = "";

  const statsContainer = document.getElementById("player-stats-container");
  player.playing_history?.forEach((record, index) => {
    const statsDiv = document.createElement("div");
    statsDiv.classList.add("player-stats");

    statsDiv.innerHTML = `
      <h4>Season ${record.season}</h4>
      <div>
        <label for="appearances-${index}">Appearances:</label>
        <input type="number" id="appearances-${index}" value="${record.appearances}" required>
      </div>
      
      <div>
        <label for="goals-${index}">Goals:</label>
        <input type="number" id="goals-${index}" value="${record.goals}" required>
      </div>
      
      <div>
        <label for="assists-${index}">Assists:</label>
        <input type="number" id="assists-${index}" value="${record.assists}" required>
      </div>
    `;

    statsContainer.appendChild(statsDiv);
  });

  document
    .getElementById("edit-player-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      savePlayerDetails(player.id);
    });
};

// Save player details
const savePlayerDetails = async (playerId) => {
  const res = await fetch(`${BASE_URL}/current_squad/${playerId}`);
  const player = await res.json();
  const updatedPlayer = {
    id: playerId,
    name: document.getElementById("player-name").value,
    nationality: document.getElementById("player-nationality").value,
    position: document.getElementById("player-position").value,
    date_of_birth: document.getElementById("player-dob").value,
    image: document.getElementById("player-image").value,
    contract_details: {
      start_date: document.getElementById("contract-start-date").value,
      end_date: document.getElementById("contract-end-date").value,
      salary: parseInt(document.getElementById("contract-salary").value),
    },
    playing_history: [],
  };

  const statsContainer = document.getElementById("player-stats-container");
  const statsDivs = statsContainer.getElementsByClassName("player-stats");

  for (let i = 0; i < statsDivs.length; i++) {
    const season = player.playing_history[i].season;
    const appearances = parseInt(
      document.getElementById(`appearances-${i}`).value,
    );
    const goals = parseInt(document.getElementById(`goals-${i}`).value);
    const assists = parseInt(document.getElementById(`assists-${i}`).value);

    updatedPlayer.playing_history.push({
      season,
      appearances,
      goals,
      assists,
    });
  }

  try {
    await fetch(`${BASE_URL}/current_squad/${playerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPlayer),
    });

    singlePlayer(playerId);
    displayPlayers();
  } catch (error) {
    renderErrorMessage("Something went wrong while saving the player details.");
  }
};

// Render add player form
const renderAddPlayerForm = () => {
  metadata.innerHTML = `
    <form id="add-player-form">
     <div>
        <label for="player-name">Name:</label>
        <input type="text" id="player-name" required>
     </div>
      
      <div>
        <label for="player-nationality">Nationality:</label>
        <input type="text" id="player-nationality" required>
      </div>
      
      <div>
        <label for="player-position">Position:</label>
        <input type="text" id="player-position" required>
      </div>
     
      <div>
        <label for="player-dob">Date of Birth:</label>
        <input type="date" id="player-dob" required>
      </div>

      <div>
        <label for="player-image">Image URL:</label>
        <input type="text" id="player-image" required>
      </div>

      <div>
        <label for="contract-start-date">Contract Start Date:</label>
        <input type="date" id="contract-start-date" required>
      </div>

      <div>
        <label for="contract-end-date">Contract End Date:</label>
        <input type="date" id="contract-end-date" required>
      </div>

      <div>
        <label for="contract-salary">Contract Salary:</label>
        <input type="number" id="contract-salary" required>
      </div>

      <button type="submit">Add Player</button>
    </form>
  `;

  // Clear the stats section
  statsSection.innerHTML = "";

  document
    .getElementById("add-player-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      addNewPlayer();
      const response = await fetch(`${BASE_URL}/current_squad`);
      const result = await response.json();
      console.log(result[result.length - 1].id);
      singlePlayer(result[result.length - 1].id);
    });
};

// Add new player
const addNewPlayer = async () => {
  const newPlayer = {
    name: document.getElementById("player-name").value,
    nationality: document.getElementById("player-nationality").value,
    position: document.getElementById("player-position").value,
    date_of_birth: document.getElementById("player-dob").value,
    image: document.getElementById("player-image").value,
    contract_details: {
      start_date: document.getElementById("contract-start-date").value,
      end_date: document.getElementById("contract-end-date").value,
      salary: parseInt(document.getElementById("contract-salary").value),
    },
  };

  try {
    await fetch(`${BASE_URL}/current_squad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPlayer),
    });

    displayPlayers();
  } catch (error) {
    renderErrorMessage("Something went wrong while adding the new player.");
  }
};

// Delete player
const deletePlayer = async (playerId) => {
  try {
    await fetch(`${BASE_URL}/current_squad/${playerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await fetch(`${BASE_URL}/current_squad`);
    const result = await res.json();

    displayPlayers();
    singlePlayer(result[0].id);
    metadata.innerHTML = "";
    statsSection.innerHTML = "";
  } catch (error) {
    renderErrorMessage("Something went wrong while deleting the player.");
  }
};
