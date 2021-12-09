var gameOfLife = {
  width: 20,
  height: 20, // width and height dimensions of the board
  stepInterval: null, // should be used to hold reference to an interval that is "playing" the game
  // Utility Function
  getCoordsOfCell: function(cell) {
    var cellId = cell.id; // '0-0'
    var idSplit = cellId.split("-"); // ['0', '0']
    return idSplit.map(function(str) {
      return parseInt(str, 10);
    });
  },
  selectCellWithCoords: function(x, y) {
    return document.getElementById(x + "-" + y);
  },
  getCellStatus: function(cell) {
    return cell.getAttribute("data-status");
  },
  setCellStatus: function(cell, status) {
    cell.className = status;
    cell.setAttribute("data-status", status);
  },
  toggleCellStatus: function(cell) {
    if (this.getCellStatus(cell) === "dead") {
      this.setCellStatus(cell, "alive");
    } else {
      this.setCellStatus(cell, "dead");
    }
  },
  // Game
  createAndShowBoard: function() {
    // create <table> element
    var goltable = document.createElement("tbody");
    // build Table HTML
    var tablehtml = "";
    for (var h = 0; h < this.height; h++) {
      tablehtml += "<tr id='row+" + h + "'>";
      for (var w = 0; w < this.width; w++) {
        tablehtml += "<td data-status='dead' id='" + w + "-" + h + "'></td>";
      }
      tablehtml += "</tr>";
    }
    goltable.innerHTML = tablehtml;
    // add table to the #board element
    var board = document.getElementById("board");
    board.appendChild(goltable);
    // once html elements are added to the page, attach events to them
    this.setupBoardEvents();
  },
  forEachCell: function(iteratorFunc) {
    /* 
      Write forEachCell here. You will have to visit
      each cell on the board, call the "iteratorFunc" function,
      and pass into func, the cell and the cell's x & y
      coordinates. For example: iteratorFunc(cell, x, y)
    */
    /*
     for (var i = 0; i < this.height; i++) {
       for (var j = 0; j < this.width; j++) {
         cell = document.getElementById(j + '-' + i);
         iteratorFunc(cell, j, i);
       }
     }
    */
    /* FOR OLD BROWSERS using getElementsByTagName
    [].slice.call(document.getElementsByTagName("td")).forEach(cell => {
      var coords = this.getCoordsOfCell(cell);
      iteratorFunc(cell, coords[0], coords[1]);
    });
    // https://stackoverflow.com/questions/49400236/how-to-select-all-tag-elements-with-js
    */

    const cells = document.querySelectorAll('td'); //NodeList
    cells.forEach(cell => {
      var coords = this.getCoordsOfCell(cell); // [10,2]
      iteratorFunc(cell, coords[0], coords[1]);
    });

  },
  setupBoardEvents: function() {
    // each board cell has an CSS id in the format of: "x-y"
    // where x is the x-coordinate and y the y-coordinate
    // use this fact to loop through all the ids and assign
    // them "click" events that allow a user to click on
    // cells to setup the initial state of the game
    // before clicking "Step" or "Auto-Play"
    // clicking on a cell should toggle the cell between "alive" & "dead"
    // for ex: an "alive" cell be colored "blue", a dead cell could stay white
    // EXAMPLE FOR ONE CELL
    // Here is how we would catch a click event on just the 0-0 cell
    // You need to add the click event on EVERY cell on the board
    
    var onCellClick = e => {
      this.toggleCellStatus(e.target)
    };

    this.forEachCell(function(cell, coordX, coordY) {
      cell.addEventListener("click", onCellClick);
    });
    document
      .getElementById("step_btn")
      .addEventListener("click", () => this.step());
    document
      .getElementById("auto_btn")
      .addEventListener("click", () => this.enableAutoPlay());
    document
      .getElementById("clear_btn")
      .addEventListener("click", () => this.clear());
    document
      .getElementById("random_btn")
      .addEventListener("click", () => this.resetRandom());
  },

  getNeighbors: function(cell) {
    var neighbors = [];
    var coords = this.getCoordsOfCell(cell);
    var coordX = coords[0];
    var coordY = coords[1];
    // to the sides
    neighbors.push(this.selectCellWithCoords(coordX - 1, coordY)); // left
    neighbors.push(this.selectCellWithCoords(coordX + 1, coordY)); // right
    // Above
    neighbors.push(this.selectCellWithCoords(coordX - 1, coordY - 1)); // left
    neighbors.push(this.selectCellWithCoords(coordX, coordY - 1)); // middle
    neighbors.push(this.selectCellWithCoords(coordX + 1, coordY - 1)); // right
    // Bellow
    neighbors.push(this.selectCellWithCoords(coordX - 1, coordY + 1)); // left
    neighbors.push(this.selectCellWithCoords(coordX, coordY + 1)); // middle
    neighbors.push(this.selectCellWithCoords(coordX + 1, coordY + 1)); // right
     
    /*return neighbors.filter(function(neighborCell){
       return neighborCell !== null
     })//[undefined, 3, 6, 7, 9]
     */
    return neighbors.filter(
        neighborCell => neighborCell !== null 
        && 
        this.getCellStatus(neighborCell) === "alive"
      );
  },
  step: function() {
    // Here is where you want to loop through all the cells
    // on the board and determine, based on it's neighbors,
    // whether the cell should be dead or alive in the next
    // evolution of the game.
    //
    // You need to:
    // 1. Count alive neighbors for all cells
    // 2. Set the next state of all cells based on their alive neighbors
    var cellsToToggle = [];
    this.forEachCell((cell, coordX, coordY) => {
      var neighborsCount = this.getNeighbors(cell).length;
      if (this.getCellStatus(cell) === "alive") {
        if (neighborsCount !== 2 && neighborsCount !== 3) {
          cellsToToggle.push(cell);
        }
      } else { 
        if (neighborsCount === 3) {
          cellsToToggle.push(cell);
        }
      }
    });
    cellsToToggle.forEach(cell => this.toggleCellStatus(cell));
  },
  enableAutoPlay: function() {
    // Start Auto-Play by running the 'step' function
    // automatically repeatedly every fixed time interval
    const btn = document.getElementById("auto_btn");
    if (this.stepInterval) {
      this.stopAutoPlay();
      btn.innerText = "AUTO";
    } else {
      this.stepInterval = setInterval(() => this.step(), 200);
      btn.innerText = "PAUSE";
    }
  },
  stopAutoPlay: function() {
    clearInterval(this.stepInterval);
    this.stepInterval = null;
  },
  clear: function() {
    this.forEachCell((cell, coordX, coordY) =>
      this.setCellStatus(cell, "dead")
    );
  },
  resetRandom: function() {
    this.forEachCell((cell, coordX, coordY) => {
      if (Math.random() > 0.5) {
        this.setCellStatus(cell, "dead");
      } else {
        this.setCellStatus(cell, "alive");
      }
    });
  }
};
gameOfLife.createAndShowBoard();
