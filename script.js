!function($){
    var gameOver = false;
    var interval = null;

    function Tile(x, y){
        this.x = x;
        this.y = y;
        this.hasNumber = 0;
        this.adjacentBombs = 0;
        this.hasFlag = false;
        this.hasBomb = false;
        this.isEmpty = false;
        this.revealed = false;
        this.id = y + "-" + x;
    }

    Tile.prototype.contain = function(value){
        var myTile = $("#grid").find("td[data-index='"+this.id+"']");
        switch(value) {
            case "flag":
                myTile.addClass('flag');
                break;
            case "bomb":
                myTile.addClass('bomb');
                break;
            case "0":
                myTile.addClass('exposed');
                break;
            case "1":
                myTile.addClass('one');
                break;
            case "2":
                myTile.addClass('two');
                break;
            case "3":
                myTile.addClass('three');
                break;
            case "4":
                myTile.addClass('four');
                break;
            case "5":
                myTile.addClass('five');
                break;
                // max 8 adjacent bomb
        }
        return this;
    };
    
    // right click on unrevealed tile only
    Tile.prototype.rightClick = function(x,y){
        if(!this.revealed){
            // if tile does not have a flag - put flag on it
            this.hasFlag = !this.hasFlag;
            if(!this.hasFlag){
                this.contain("flag");
            }else{
                this.contain("");
            } 
        }
        return;
    }

    // =============== Grid =================

    function Grid(width, height, numOfBombs) {
        this.grid = [];
        this.width = width;
        this.height = height;
        this.numOfBombs = numOfBombs;
        this.totalTilesRevealed = 0;
    }

    Grid.prototype.getTile = function(row,col){
        // filter() function returns array
        var tile = this.grid.filter(tile => tile.x == row && tile.y == col);
        return tile[0];
    }

    // reset grid when player starts new game
    Grid.prototype.reset = function(){
        // reset existing grid and bombs
        this.grid = []; 
        this.bombs = {}; 
        gameOver = false;
        for(var i = 0; i < this.width; i++){
            for(var j = 0; j < this.height; j++){
                // create new tile and push it to the grid
                var tile = new Tile(i,j);
                this.grid.push(tile);
            }
        }
        // create new bombs on grid
        this.createBomb(this.numOfBombs);
        this.countNearbyBombs();
        console.log("grid at the end: ", this.grid);
        return this;
    }

    // create grid with specific width and height (depend on level)
    function makeGrid(h, w){
        let table = "<table>";
        // outer loop = rows
        for(let i = 0; i < w; i++){
            table += "<tr>";
            // inner loop = columns
            for(let j = 0; j < h; j++){
                // create tile with ID
                let data = "<td data-index=" + i + '-' + j + ">";
                table += data;
            }
            table += "</tr>";
        }
        table += "</table>";
        document.getElementById("grid").innerHTML = table;
    }

    // pick random number of tiles
    Grid.prototype.randTileWithBomb = function(){
        var randRowY = Math.floor(Math.random() * (this.height));
        var randColX = Math.floor(Math.random() * (this.width));
        var tileBomb = {
            row: randRowY,
            col: randColX
        }
        // random coordinates created
        return tileBomb;
    }

    // place bombs on random coordinates
    Grid.prototype.createBomb = function(num){
        for(var n = num; n > 0; n--){
            var bomb = this.randTileWithBomb();
            var bombY = bomb.row;
            var bombX = bomb.col;
            console.log("bombs",bombX, bombY);
            var tile = this.getTile(bombX, bombY)
            tile.hasBomb = true;
            console.log("tile with bomb: ", tile);
        }
        return;
    }

    // count bombs around tile
    Grid.prototype.countNearbyBombs = function(){
        console.log("counting nearby bombs width heigh ", this.width, this.height);
        // loop through all grid, 
        for(var i = 0; i < this.width; i++){
            for(var j = 0; j < this.height; j++){
                var tile = this.getTile(i,j);
                if(!tile.hasBomb){
                    // make sure that all of the adjacent tiles are within a grid
                    //in row -1
                    if(i - 1 >= 0 && j - 1 >= 0 && this.getTile(i - 1, j - 1).hasBomb){
                        tile.adjacentBombs++;
                    }
                    if(j - 1 >= 0 && this.getTile(i, j-1).hasBomb){
                        tile.adjacentBombs++;
                    } 
                    if(i + 1 <= this.width - 1 && j - 1 >= 0 && this.getTile(i + 1, j - 1).hasBomb){
                        tile.adjacentBombs++;
                    } 
                    // in row 0
                    if(i - 1 >= 0 && this.getTile(i - 1, j).hasBomb){
                        tile.adjacentBombs++;
                    } 
                    if(i + 1 <= this.width - 1 && this.getTile(i + 1, j).hasBomb){
                        tile.adjacentBombs++;
                    } 
                    // in row +1
                    if(i - 1 >= 0 && j + 1 <= this.height - 1 && this.getTile(i - 1, j + 1).hasBomb){
                        tile.adjacentBombs++;
                    } 
                    if(j + 1 <= (this.height-1) && this.getTile(i, j + 1).hasBomb){
                        tile.adjacentBombs++; 
                    } 
                    if(i + 1 <= this.width - 1 && j + 1 <= this.height - 1 && this.getTile(i + 1, j + 1).hasBomb){
                        tile.adjacentBombs++;
                    } 
                    if(tile.adjacentBombs > 0){
                        tile.hasNumber = tile.adjacentBombs;
                        var n = tile.hasNumber.toString();
                        tile.contain(n);
                    }else{
                        tile.hasNumber = 0;
                        var n = tile.hasNumber.toString();
                        tile.isEmpty = true;
                        tile.contain(n);
                        
                    }
                }
            }
        }   
        return;
    }

    Grid.prototype.uncoverTile = function(tile){
        // count adjacent bombs
        if(!tile.revealed && !tile.hasFlag){
            tile.revealed = true;
            this.totalTilesRevealed++;
            // grid dimension
            var dimension = this.width * this.height;
            
            // if tile contain bomb - gave over 
            if(tile.hasBomb){
                tile.contain("bomb");       
                $('#lose').append('<h3>Game over. You lost!</h3>');
                clearInterval(interval);
                gameOver = true;

            // click last tile to win the game 
            } else if((this.totalTilesRevealed + this.numOfBombs) == dimension){
                var n = tile.adjacentBombs.toString();
                tile.contain(n);
                $('#win').append('<h3>You won!</h3>');
                clearInterval(interval);
                gameOver = true;
            }
            // if tile has adjacent bombs - display this number
            if(tile.adjacentBombs > 0){
                var n = tile.adjacentBombs.toString();
                tile.contain(n);
            }
            // if tile is empty - revealed empty spaces around this tile 
            else if(tile.isEmpty){
                tile.contain("0");
                // check if tiles around are inside of grid dimension
                //row -1
                if(tile.x - 1 >= 0 && tile.y - 1 >= 0){
                    this.uncoverTile(this.getTile(tile.x-1, tile.y-1));
                }

                if(tile.y - 1 >= 0){
                    this.uncoverTile(this.getTile(tile.x, tile.y-1));
                } 

                if(tile.x + 1 <= this.width - 1 && tile.y - 1 >= 0){
                    this.uncoverTile(this.getTile(tile.x+1, tile.y-1));
                } 
                // row 0
                if(tile.x - 1 >= 0 ){
                    this.uncoverTile(this.getTile(tile.x-1, tile.y));
                } 

                if(tile.x + 1 <= this.width - 1){
                    this.uncoverTile(this.getTile(tile.x+1, tile.y));
                } 
                // row +1

                if(tile.x - 1 >= 0 && tile.y + 1 <= this.height - 1){
                    this.uncoverTile(this.getTile(tile.x-1, tile.y+1));
                } 

                if(tile.y + 1 <= this.height - 1){
                    this.uncoverTile(this.getTile(tile.x, tile.y+1));
                } 

                if(tile.x + 1 <= this.width - 1 && tile.y + 1 <= this.height - 1){
                    this.uncoverTile(this.getTile(tile.x+1, tile.y+1));
                } 
            }
        }
        return;
    }

    // every time when player starts game reset time to 0
    function timer(){
        var totalSeconds = 0;
        var minutesLabel = document.getElementById("minutes");
        var secondsLabel = document.getElementById("seconds");
        clearTimeout(interval)
        interval = setInterval(setTime, 1000);
        
        function setTime() {
          totalSeconds++;
          secondsLabel.innerHTML = pad(totalSeconds % 60);
          minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
        }
        
        function pad(sec) {
          var display = sec + "";
          if (display.length < 2) {
            return "0" + display;
          } else {
            return display;
          }
        }
    }

    var myGrid;

    function newGame(x,y, numberOfBombs) {
        $('#win').empty();
        $('#lose').empty();
        gameOver = false;
        myGrid = new Grid(x,y, numberOfBombs);
        myGrid.reset(x,y,numberOfBombs);
        makeGrid(x,y);
        clearInterval(interval);
        timer();
    }

  $(function(){
    newGame(9, 9, 10);
    console.log("creating new game");

    $("body").on("click","#grid td", function() {   
        if(!gameOver){
            // take tiles coordinates
            var column_num = parseInt( $(this).index() ) + 1;
            var row_num = parseInt( $(this).parent().index() ) + 1;    
            console.log("Row_numX = " + row_num + "  ,  Column_numY = "+ column_num);
            // get tile and display it
            var tile = myGrid.getTile(column_num-1, row_num-1);
            myGrid.uncoverTile(tile);
        }else{
            console.log("Game is over");
        }
        
    });
    // right click
    $("#grid ").contextmenu(function(e) {   
        e.preventDefault();
        console.log("right clicked");
        // take tiles coordinates
        var column_num = parseInt( $(this).index() ) + 1;
        var row_num = parseInt( $(this).parent().index() ) + 1;  
        console.log("Tile coor",column_num, row_num)
        var tile = myGrid.getTile(column_num-1, row_num-1);  
        tile.rightClick(column_num, row_num);
    });

    // clicking on button "newGame" makes new grid, 
    // creates bombs in different random spots and counts time from 0
    $("#new").click(function(e){
        // e.preventDefault();
        newGame(9, 9, 10);
    });

    $("#easy").click(function(e){
        // e.preventDefault();
        newGame(9, 9, 10);
    })

    $("#medium").click(function(e){
        // e.preventDefault();
        newGame(15, 11, 20);
    })

    $("#hard").click(function(e){
        // e.preventDefault();
        newGame(21, 15, 30);
    })

  });

}(jQuery);