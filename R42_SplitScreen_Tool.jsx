/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                        Util Functions                                           //
////////////////////////////////////////////////////////////////////////////////////////////////////


function createComp(width, height, framerate){
    return app.project.items.addComp("split_template", width, height, 1, 15, framerate);
}

function createSolidLayer(comp, name, colour, pos){
    var solid = comp.layers.addSolid(colour, name, comp.width, comp.height, 1);
    solid.property("Position").setValue(pos);
    return solid;
}

function createShapeLayer(comp, pos, size, name){
    var shapeLayer = comp.layers.addShape();
    shapeLayer.property("Position").setValue(pos);
    shapeLayer.property("Contents").addProperty("ADBE Vector Group");
    shapeLayer.property("Contents").property(1).property(2).addProperty("ADBE Vector Shape - Rect");
    shapeLayer.property("Contents").property(1).property(2).addProperty("ADBE Vector Graphic - Fill");
    shapeLayer.property("Contents").property(1).property(2).property("Fill").property("Color").setValue([0,0,1]);
    shapeLayer.property("Contents").property(1).property(2).property("ADBE Vector Shape - Rect").property("Size").setValue(size);
    shapeLayer.name = name;
    return shapeLayer;
}

function createPoly(comp, verts, name){
    var poly = new Shape();
    poly.vertices = verts;
    poly.closed = true;
    poly.inTangents = [[0,0],[0,0],[0,0],[0,0]];
    poly.outTangents = [[0,0],[0,0],[0,0],[0,0]];
    var layer = comp.layers.addShape();
    layer.name = name;
    layer.property("Position").setValue([0,0,0]);
    var group = layer.content.addProperty("ADBE Vector Group");
    group.name = "Group";
    var pathGroup = group.content.addProperty("ADBE Vector Shape - Group");
    pathGroup.property("ADBE Vector Shape").setValue(poly);
    layer.content.property(1).property(2).addProperty("ADBE Vector Graphic - Fill");
    layer.content.property(1).property(2).property("Fill").property("Color").setValue([0,0,1,1]);
    layer.content.property(1).property(2).property("Fill").property("Opacity").setValue(100)
    return layer;
}

function addLineShapeGrid(comp, pos, length, orientation){
    var lineShapeLayer = comp.layers.addShape();
    var shapeGroup = lineShapeLayer.property("ADBE Root Vectors Group");
    shapeGroup.addProperty("ADBE Vector Shape - Group");
    shapeGroup.addProperty("ADBE Vector Graphic - Stroke");
    var lineShape = new Shape();
    if(orientation == "horizontal"){
            lineShape.vertices = [[-length/2,0],[length/2,0]];
        }else{
            lineShape.vertices = [[0,-length/2],[0,length/2]];
        }
    lineShape.closed = false;
    shapeGroup.property(1).property("ADBE Vector Shape").setValue(lineShape);
    lineShapeLayer.property("Position").setValue(pos);
    lineShapeLayer.name = "Divider";
    return lineShapeLayer;
}

function addLineShape(comp, verts, name){
    var lineShapeLayer = comp.layers.addShape();
    var shapeGroup = lineShapeLayer.property("ADBE Root Vectors Group");
    shapeGroup.addProperty("ADBE Vector Shape - Group");
    var stroke = shapeGroup.addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("Stroke Width").setValue(3);
    var lineShape = new Shape();
    lineShape.vertices = verts;
    lineShape.closed = false;
    shapeGroup.property(1).property("ADBE Vector Shape").setValue(lineShape);
    lineShapeLayer.property("Position").setValue([0,0,0]);
    lineShapeLayer.name = name;
    return lineShapeLayer;
}

function splitCompIntoGrid(comp, rows, columns){
    var width = comp.width/columns;
    var height = comp.height/rows;
    for(var i=0; i<rows; i++){
            for(var j=0; j<columns; j++){
                    var x = j*width + width/2;
                    var y = i*height + height/2;
                    var solid = createSolidLayer(comp, "Layer_"+(i+1)+"_"+(j+1), [Math.random(), Math.random(), Math.random()], [x, y, 0]);
                    var matte = createShapeLayer(comp, [x, y, 0], [width, height], "Matte_"+(i+1)+"_"+(j+1));
                    solid.setTrackMatte(matte, TrackMatteType.ALPHA);
                }
        }
    for(var i=1; i<rows; i++){
            var y = i*height;
            addLineShapeGrid(comp, [comp.width/2, y, 0], comp.width, "horizontal");
        }
    for(var j=1; j<columns; j++){
            var x = j*width;
            addLineShapeGrid(comp, [x, comp.height/2, 0], comp.height, "vertical");
        }
}

function splitCompEvenly(comp, Num, Angle){
    var x = comp.width/(Num)
    var processedLines = [];

    for(var i = 1; i < (Num); i++){
        var coords = []
        var change = (540 * Math.tan(Angle * Math.PI / 180))
        var top = [(i*x) + change, 0];
        var bottom = [(i*x) - change, comp.height]; 
        coords.push(top);
        coords.push(bottom);
        processedLines.push(coords);
    }

    var prevLine = [];

    for(var i = 0; i < processedLines.length; i++){
        var line = processedLines[i];
        if (i === 0) {
            verts = [[0, 0], line[0], line[1], [0, comp.height]];
        } else {
            verts = [prevLine[0], line[0], line[1], prevLine[1]];
        }
        prevLine = line;

        var solid = createSolidLayer(comp, ("Layer" + i), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
        var matte = createPoly(comp, verts, ("Matte" + i));
        solid.setTrackMatte(matte, TrackMatteType.ALPHA);
        addLineShape(comp, line, "Divider" + i);
    }
    verts = [prevLine[0], [comp.width, 0], [comp.width, comp.height], prevLine[1]];
    var solid = createSolidLayer(comp, ("End Layer"), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
    var matte = createPoly(comp, verts, ("End Matte"));
    solid.setTrackMatte(matte, TrackMatteType.ALPHA);
}

function splitCompCustomisably(comp, lines){
    // lines input = [x Value:0, Angle:0, Index:0]
    var processedLines = [];

    for(var i = 0; i < lines.length; i++){
        var coords = [];
        var change = (540 * Math.tan(lines[i][2] * Math.PI / 180)); 
        var top = [lines[i][1] + change, 0]; 
        var bottom = [lines[i][1] - change, comp.height]; 
        coords.push(top);
        coords.push(bottom);
        processedLines.push(coords);
    }

    var prevLine = [];
    for(var i = 0; i < processedLines.length; i++){
        var line = processedLines[i];
        if (i === 0) {
            verts = [[0, 0], line[0], line[1], [0, comp.height]];
        } else {
            verts = [prevLine[0], line[0], line[1], prevLine[1]];
        }
        prevLine = line;

        var solid = createSolidLayer(comp, ("Layer" + i), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
        var matte = createPoly(comp, verts, ("Matte" + i));
        solid.setTrackMatte(matte, TrackMatteType.ALPHA);
        addLineShape(comp, line, "Divider" + i)
    }

    verts = [prevLine[0], [comp.width, 0], [comp.width, comp.height], prevLine[1]];
    var solid = createSolidLayer(comp, ("End Layer"), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
    var matte = createPoly(comp, verts, ("End Matte"));
    solid.setTrackMatte(matte, TrackMatteType.ALPHA);
    
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                            UI Levels                                            //
////////////////////////////////////////////////////////////////////////////////////////////////////

var mainWindow = new Window("dialog");
mainWindow.text = "Scene Split Adjustment";
mainWindow.alignChildren = ["center", "top"];
mainWindow.spacing = 10;
mainWindow.margins = 23;

var gridButton = mainWindow.add("button", undefined, "Grid Split-Screen");
gridButton.preferredSize = [200, 30];
gridButton.alignment = ["center", "center"];

var diagonalButton = mainWindow.add("button", undefined, "Diagonal Split-Screen");
diagonalButton.preferredSize = [200, 30];
diagonalButton.alignment = ["center", "center"];

gridButton.onClick = function () {
    mainWindow.close();
    openGridWindow();
};

diagonalButton.onClick = function () {
    mainWindow.close();
    openDiagonalWindow();

};

mainWindow.show();

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                       Tutorial Buttons                                          //
////////////////////////////////////////////////////////////////////////////////////////////////////

function openTutorialWindow(toolType) {
    var tutorialDialog = new Window("dialog", "How to Use This Tool");
    tutorialDialog.margins = 20;
    tutorialDialog.spacing = 10;

    // Add a scrollable text area for the tutorial content
    var tutorialText = tutorialDialog.add("edittext", undefined, undefined, { multiline: true, readonly: true });
    if(toolType == "Customisable"){
        tutorialText.text =
            "Welcome to the Customisable Split-Screen Tool!\n\n" +
            "1. Click the '+' button to add dividers, place as many as you want! Go Wild!\n\n" +
            "2. Use the sliders to set the X-coordinate of each divider.\n" +
            " - The X-Coordinate represents where the centre of the line will be placed on the screen\n\n"+
            "3. Enter an angle (-90 to 90) in the text box next to each slider to adjust the orientation of the divider.\n" +
            " - 0 will produce a vertical line, where 90 will produce a horizontal line.\n" +
            " - 0 -> 90 produces a split that slopes left, from top to bottom.\n" +
            " - -90 -> 0 produces a split that slopes right, from top to bottom.\n\n" +
            "4. The Layers will overlap if the angles you input warrant it, The order of rendering is top to bottom, so whatever slider is at the bottom, will be added at the top of the composition.\n\n" +
            "5. Click 'Confirm' to apply the settings and generate the scene split.\n\n" +
            "Tip: You can always revisit this tutorial by clicking the 'Tutorial' button.";
    }
    if(toolType == "Even"){
        tutorialText.text =
            "Welcome to the Even Scene Split Adjustment Tool!\n\n" +
            "1. Select the Number of sections you would like (not divides).\n" +
            " - sections will be evenly split across the entire comp, only the outer edges having slightly more space due to edges.\n\n" +
            "2. Enter an angle (-90 to 90) in the 'Angle' text box to adjust the orientation of the divider.\n" +
            " - 0 will produce a vertical line, where 90 will produce a horizontal line.\n" +
            " - 0 -> 90 produces a split that slopes left, from top to bottom.\n" +
            " - -90 -> 0 produces a split that slopes right, from top to bottom.\n\n" +
            "3. Click 'Confirm' to apply the settings and generate the scene split.\n\n" +
            "Tip: You can always revisit this tutorial by clicking the 'Tutorial' button.";
    }
    if(toolType == "Grid"){
        tutorialText.text =
            "Welcome to the Grid Split-Screen Tool!\n\n" +
            "1. Select number of Columns (horizontal) you would like, Up to a maximum of 10.\n\n" +
            "2. Select number of Rows (Vertical) you would like, Up to a maximum of 10.\n\n" +
            "3. Click 'Confirm' to apply the settings and generate the scene split.\n\n" +
            "Tip: You can always revisit this tutorial by clicking the 'Tutorial' button.";
    }

    tutorialText.preferredSize = [500, 300];

    // Add a close button
    var closeButton = tutorialDialog.add("button", undefined, "Close");
    closeButton.alignment = ["center", "bottom"];
    closeButton.onClick = function () {
        tutorialDialog.close();
    };

    // Show the tutorial dialog
    tutorialDialog.show();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                           Grid UI                                              //
////////////////////////////////////////////////////////////////////////////////////////////////////

function openGridWindow(){
    var gridWindow = new Window("dialog"); 
    gridWindow.text = "R42_Split_Screen"; 
    gridWindow.alignChildren = ["center","top"]; 
    gridWindow.spacing = 10; 
    gridWindow.margins = 16; 

var group1 = gridWindow.add("group", undefined, {name: "group1"}); 
    group1.orientation = "row"; 
    group1.alignChildren = ["left","center"]; 
    group1.spacing = 10; 
    group1.margins = 0; 

var l_rows = group1.add("statictext", undefined, undefined, {name: "l_rows"}); 
    l_rows.text = "Rows:"; 

var cb_rows_array = ["1","2","3","4","5","6","7","8","9","10"]; 
var cb_rows = group1.add("dropdownlist", undefined, undefined, {name: "cb_rows", items: cb_rows_array}); 
    cb_rows.selection = 0; 

var group2 = gridWindow.add("group", undefined, {name: "group2"}); 
    group2.orientation = "row"; 
    group2.alignChildren = ["left","center"]; 
    group2.spacing = 10; 
    group2.margins = 0; 

var l_columns = group2.add("statictext", undefined, undefined, {name: "l_columns"}); 
    l_columns.text = "Columns:"; 

var cb_columns_array = ["1","2","3","4","5","6","7","8","9","10"]; 
var cb_columns = group2.add("dropdownlist", undefined, undefined, {name: "cb_columns", items: cb_columns_array}); 
    cb_columns.selection = 1; 

    var buttonGroup = gridWindow.add("group", undefined, { name: "buttonGroup" });
    buttonGroup.orientation = "row"; // Place buttons side-by-side
    buttonGroup.alignChildren = ["center", "center"];
    buttonGroup.spacing = 10;

    // Confirm button
    var confirmButton = buttonGroup.add("button", undefined, undefined, { name: "confirmButton" });
    confirmButton.text = "Confirm";
    confirmButton.onClick = function () {
        app.beginUndoGroup("split_undo");
        var comp = createComp(1920,1080,30);
        splitCompIntoGrid(comp, gridWindow.group1.cb_rows.selection.text, gridWindow.group2.cb_columns.selection.text);
        app.endUndoGroup();
        gridWindow.close();
        }

    // Tutorial button
    var tutorialButton = buttonGroup.add("button", undefined, undefined, { name: "tutorialButton" });
    tutorialButton.text = "Tutorial";
    tutorialButton.onClick = function () {
        openTutorialWindow("Grid");
    }
    gridWindow.show();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                      Diagonal Split UI                                          //
////////////////////////////////////////////////////////////////////////////////////////////////////

function openDiagonalWindow(){
    var diagonal = new Window("dialog");
    diagonal.text = "Scene Split Adjustment";
    diagonal.alignChildren = ["center", "top"];
    diagonal.spacing = 10;
    diagonal.margins = 23;
    
    var evenButton = diagonal.add("button", undefined, "Even Distribution");
    evenButton.preferredSize = [200, 30];
    evenButton.alignment = ["center", "center"];
    
    var customButton = diagonal.add("button", undefined, "Customisable Distribution");
    customButton.preferredSize = [200, 30];
    customButton.alignment = ["center", "center"];
    
    evenButton.onClick = function () {
        openEvenDistributionWindow();
        diagonal.close()
    };
    
    customButton.onClick = function () {
        openCustomisableDistributionWindow();
        diagonal.close();
    };
    diagonal.show();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                          Evenly Distributed Diagonal Split UI                                   //
////////////////////////////////////////////////////////////////////////////////////////////////////

function openEvenDistributionWindow() {
    var evenWindow = new Window("dialog");
    evenWindow.text = "Even Distribution";
    evenWindow.alignChildren = ["center", "top"];
    evenWindow.spacing = 10;
    evenWindow.margins = 23;


    var sectionGroup = evenWindow.add("group", undefined, { name: "sectionGroup" });
    sectionGroup.orientation = "row";
    sectionGroup.alignChildren = ["left", "center"];
    sectionGroup.spacing = 10;


    var sectionLabel = sectionGroup.add("statictext", undefined, "Number Of Splits: ");
    sectionLabel.preferredSize.width = 120; 

    var sectionDropdown = sectionGroup.add("dropdownlist", undefined, undefined, { name: "sectionDropdown" });
    for (var i = 1; i < 20; i++) {
        sectionDropdown.add("item", i + 1);
    }
    sectionDropdown.selection = 0; 

    var angleGroup = evenWindow.add("group", undefined, { name: "angleGroup" });
    angleGroup.orientation = "row";
    angleGroup.alignChildren = ["left", "center"];
    angleGroup.spacing = 10;

    var angleLabel = angleGroup.add("statictext", undefined, "Angle: ");
    angleLabel.preferredSize.width = 120; // Set a fixed width for alignment

    var angleInput = angleGroup.add("edittext", undefined, "0", { name: "angleInput" });
    angleInput.preferredSize.width = 50;
    
    function clampAngle(value) {
        var angle = parseFloat(value); // Parse the input as a number
        if (isNaN(angle)) {
            angle = 0; // Default to 0 if the input is invalid
        }
        angle = Math.max(-90, Math.min(90, angle)); // Clamp the value to the range
        return angle;
    }

    angleInput.onChange = function () {
        var clampedValue = clampAngle(this.text); // Clamp the current input value
        this.text = clampedValue.toString(); // Update the text box with the clamped value
    };

    var buttonGroup = evenWindow.add("group", undefined, { name: "buttonGroup" });
    buttonGroup.orientation = "row"; // Place buttons side-by-side
    buttonGroup.alignChildren = ["center", "center"];
    buttonGroup.spacing = 10;
    
    var confirmButton = buttonGroup.add("button", undefined, "Confirm");
    confirmButton.preferredSize = [100, 30];

    // Tutorial button
    var tutorialButton = buttonGroup.add("button", undefined, undefined, { name: "tutorialButton" });
    tutorialButton.text = "Tutorial";
    tutorialButton.onClick = function () {
        openTutorialWindow("Even");
    };

    confirmButton.onClick = function () {
        var numSections = parseInt(sectionDropdown.selection.text, 10);
        var angle = parseInt(angleInput.text, 10);
        app.beginUndoGroup("split_undo");
        var comp = createComp(1920, 1080, 30);
        splitCompEvenly(comp, numSections, angle);
        app.endUndoGroup();

        
        evenWindow.close();
        mainWindow.close();
    };

  
    evenWindow.show();
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
//                          Customisably Distributed Diagonal Split UI                             //
////////////////////////////////////////////////////////////////////////////////////////////////////


function openCustomisableDistributionWindow() {
    var dialog = new Window("dialog");
    dialog.text = "Scene Split Adjustment";
    dialog.alignChildren = ["center", "top"];
    dialog.spacing = 10;
    dialog.margins = 23;
    
    var group1 = dialog.add("group", undefined, { name: "group1" });
    group1.orientation = "row";
    group1.alignChildren = ["left", "center"];
    group1.spacing = 10;
    group1.margins = 0;
    
    var statictext1 = group1.add("statictext", undefined, undefined, { name: "statictext1" });
    statictext1.text = "Select Number of Dividers";
    
    var button1 = group1.add("button", undefined, undefined, { name: "button1" });
    button1.text = "+";
    
    var sliderContainer = dialog.add("panel", undefined, undefined, { name: "sliderContainer" });
    sliderContainer.orientation = "column";
    sliderContainer.alignChildren = ["left", "center"];
    sliderContainer.spacing = 10;
    sliderContainer.margins = 5;
    
    var sliderPairs = [];
    
    function addSlider() {

        var sliderGroup = sliderContainer.add("group", undefined, { name: "sliderGroup" });
        sliderGroup.orientation = "row";
        sliderGroup.alignChildren = ["center", "center"];
        sliderGroup.spacing = 10;
    
    
        var newSlider = sliderGroup.add("slider", undefined, undefined, undefined, undefined, { name: "slider" });
        newSlider.minvalue = 0;
        newSlider.maxvalue = 1920; 
        newSlider.value = 0;
        newSlider.preferredSize.width = 400;
    
        
        var newTextInput = sliderGroup.add("edittext", undefined, undefined, { name: "textInput" });
        newTextInput.text = "0"; 
        newTextInput.preferredSize.width = 50;

        function clampAngle(value) {
            var angle = parseFloat(value);
            if (isNaN(angle)) {
                angle = 0; 
            }
            angle = Math.max(-90, Math.min(90, angle)); 
            return angle;
        }
        
        newTextInput.onChange = function () {
            var clampedValue = clampAngle(this.text);
            this.text = clampedValue.toString();
        };

    
        sliderPairs.push({ slider: newSlider, textInput: newTextInput });
    }
    
    button1.onClick = function () {
        addSlider();
        dialog.layout.layout(true);
    };
    
    var buttonGroup = dialog.add("group", undefined, { name: "buttonGroup" });
    buttonGroup.orientation = "row"; 
    buttonGroup.alignChildren = ["center", "center"];
    buttonGroup.spacing = 10;

    // Confirm button
    var confirmButton = buttonGroup.add("button", undefined, undefined, { name: "confirmButton" });
    confirmButton.text = "Confirm";
    confirmButton.onClick = function () {
        onConfirm();
    };

    // Tutorial button
    var tutorialButton = buttonGroup.add("button", undefined, undefined, { name: "tutorialButton" });
    tutorialButton.text = "Tutorial";
    tutorialButton.onClick = function () {
        openTutorialWindow("Customisable");
    };

    function onConfirm() {
        var lines = [];
        for (var i = 0; i < sliderPairs.length; i++) {
            var pair = sliderPairs[i];
            var xCoordinate = Math.round(pair.slider.value); 
            var angle = parseInt(pair.textInput.text, 10);
    
            lines.push([
                i + 1,
                xCoordinate, 
                angle 
            ]);
        }
    
        var resultMessage = "";
        for (var j = 0; j < lines.length; j++) {
            resultMessage += "Divider " + lines[j][0] + ": X=" + lines[j][1] + ", Angle=" + lines[j][2] + "\n";
        }
        alert("Divider Settings:\n" + resultMessage);
    
        app.beginUndoGroup("split_undo");
        var comp = createComp(1920, 1080, 30);
        splitCompCustomisably(comp, lines);
        app.endUndoGroup();
    
        dialog.close();
        mainWindow.close()
    }

    dialog.show();
    }
