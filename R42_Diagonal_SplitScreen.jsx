function createComp(){
    return app.project.items.addComp("split_template", 1920, 1080, 1, 15, 30);
}

function createSolidLayer(comp, name, colour, pos){
    var solid = comp.layers.addSolid(colour, name, comp.width, comp.height, 1);
    solid.property("Position").setValue(pos);
    return solid;
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


function addLineShape(comp, Verts, name){
    var lineShapeLayer = comp.layers.addShape();
    var shapeGroup = lineShapeLayer.property("ADBE Root Vectors Group");
    shapeGroup.addProperty("ADBE Vector Shape - Group");
    var stroke = shapeGroup.addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("Stroke Width").setValue(3);
    var lineShape = new Shape();
    lineShape.vertices = Verts;
    lineShape.closed = false;
    shapeGroup.property(1).property("ADBE Vector Shape").setValue(lineShape);
    lineShapeLayer.property("Position").setValue([0,0,0]);
    lineShapeLayer.name = name;
    return lineShapeLayer;
}

function splitCompEvenly(comp, Num, Angle){

    var x = 1920/(Num)
    var Coords = [];
    var Change = 0
    var Top = []
    var Bottom = []
    var processedLines = [];

    for(var i = 1; i < (Num); i++){
        Coords = []
        Change = (540 * Math.tan(Angle * Math.PI / 180))
        Top = [(i*x) + Change, 0]; // Use lines[i] instead of i
        Bottom = [(i*x) - Change, 1080]; // Use lines[i] instead of i
        Coords.push(Top);
        Coords.push(Bottom);
        processedLines.push(Coords);
    }

    var prevLine = [];
    for(var i = 0; i < processedLines.length; i++){
        var line = processedLines[i];
        if (i === 0) {
            Verts = [[0, 0], line[0], line[1], [0, 1080]];
        } else {
            Verts = [prevLine[0], line[0], line[1], prevLine[1]];
        }
        prevLine = line;

        var solid = createSolidLayer(comp, ("Layer" + i), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
        var matte = createPoly(comp, Verts, ("Matte" + i));
        solid.setTrackMatte(matte, TrackMatteType.ALPHA);
        addLineShape(comp, line, "Divider" + i);
    }
    Verts = [prevLine[0], [1920, 0], [1920, 1080], prevLine[1]];
    var solid = createSolidLayer(comp, ("End Layer"), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
    var matte = createPoly(comp, Verts, ("End Matte"));
    solid.setTrackMatte(matte, TrackMatteType.ALPHA);
}

function splitCompDiagonally(comp, lines){
    // lines input = [x Value:0, Angle:0, Index:0]
    var Coords = [];
    var Change = 0
    var Top = []
    var Bottom = []
    var processedLines = [];

    for(var i = 0; i < lines.length; i++){
        Coords = [];
        Change = (540 * Math.tan(lines[i][2] * Math.PI / 180)); // Use lines[i] instead of i
        Top = [lines[i][1] + Change, 0]; // Use lines[i] instead of i
        Bottom = [lines[i][1] - Change, 1080]; // Use lines[i] instead of i
        Coords.push(Top);
        Coords.push(Bottom);
        processedLines.push(Coords);
    }

    var prevLine = [];
    for(var i = 0; i < processedLines.length; i++){
        var line = processedLines[i];
        if (i === 0) {
            Verts = [[0, 0], line[0], line[1], [0, 1080]];
        } else {
            Verts = [prevLine[0], line[0], line[1], prevLine[1]];
        }
        prevLine = line;

        var solid = createSolidLayer(comp, ("Layer" + i), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
        var matte = createPoly(comp, Verts, ("Matte" + i));
        solid.setTrackMatte(matte, TrackMatteType.ALPHA);
        addLineShape(comp, line, "Divider" + i)
    }

    Verts = [prevLine[0], [1920, 0], [1920, 1080], prevLine[1]];
    var solid = createSolidLayer(comp, ("End Layer"), [Math.random(), Math.random(), Math.random()], [comp.width/2, comp.height/2, 0]);
    var matte = createPoly(comp, Verts, ("End Matte"));
    solid.setTrackMatte(matte, TrackMatteType.ALPHA);
    
}

// DIALOG
// ======
// Main Window with Two Buttons
var mainWindow = new Window("dialog");
mainWindow.text = "Scene Split Adjustment";
mainWindow.alignChildren = ["center", "top"];
mainWindow.spacing = 10;
mainWindow.margins = 23;

// Button for Even Distribution
var evenButton = mainWindow.add("button", undefined, "Even Distribution");
evenButton.preferredSize = [200, 30];
evenButton.alignment = ["center", "center"];

// Button for Customisable Distribution
var customButton = mainWindow.add("button", undefined, "Customisable Distribution");
customButton.preferredSize = [200, 30];
customButton.alignment = ["center", "center"];

// Event Listener for Even Distribution Button
evenButton.onClick = function () {
    openEvenDistributionWindow();
};

// Event Listener for Customisable Distribution Button
customButton.onClick = function () {
    openCustomisableDistributionWindow();
    mainWindow.close();
};

// Show the Main Window
mainWindow.show();

// Function to Open the Even Distribution Window
function openEvenDistributionWindow() {
    var evenWindow = new Window("dialog");
    evenWindow.text = "Even Distribution";
    evenWindow.alignChildren = ["center", "top"];
    evenWindow.spacing = 10;
    evenWindow.margins = 23;

    // Group for Number of Sections Label and Dropdown
    var sectionGroup = evenWindow.add("group", undefined, { name: "sectionGroup" });
    sectionGroup.orientation = "row";
    sectionGroup.alignChildren = ["left", "center"];
    sectionGroup.spacing = 10;

    // Label for Number of Sections
    var sectionLabel = sectionGroup.add("statictext", undefined, "Number Of Splits: ");
    sectionLabel.preferredSize.width = 120; // Set a fixed width for alignment

    // Dropdown for Number of Sections
    var sectionDropdown = sectionGroup.add("dropdownlist", undefined, undefined, { name: "sectionDropdown" });
    for (var i = 1; i < 20; i++) {
        sectionDropdown.add("item", i + 1);
    }
    sectionDropdown.selection = 0; // Default selection

    // Group for Angle Label and Text Input
    var angleGroup = evenWindow.add("group", undefined, { name: "angleGroup" });
    angleGroup.orientation = "row";
    angleGroup.alignChildren = ["left", "center"];
    angleGroup.spacing = 10;

    // Label for Angle
    var angleLabel = angleGroup.add("statictext", undefined, "Angle: ");
    angleLabel.preferredSize.width = 120; // Set a fixed width for alignment

    // Text Input for Angle
    var angleInput = angleGroup.add("edittext", undefined, "0", { name: "angleInput" });
    angleInput.preferredSize.width = 50;

    // Confirm Button
    var confirmButton = evenWindow.add("button", undefined, "Confirm");
    confirmButton.preferredSize = [100, 30];

    // Event Listener for Confirm Button
    confirmButton.onClick = function () {
        var numSections = parseInt(sectionDropdown.selection.text, 10);
        var angle = parseInt(angleInput.text, 10);

        // Validate and clamp angle to [-180, 180]
        if (isNaN(angle)) {
            angle = 0; // Default to 0 if invalid
        }
        angle = Math.max(-180, Math.min(180, angle));

        // Log the settings or pass them to your main code
        alert("Even Distribution Settings:\nSections: " + numSections + "\nAngle: " + angle);

        // Create a new composition and split it evenly
        app.beginUndoGroup("split_undo");
        var comp = createComp();
        splitCompEvenly(comp, numSections, angle);
        app.endUndoGroup();

        // Close the window after confirming
        evenWindow.close();
        mainWindow.close();
    };

    // Show the Even Distribution Window
    evenWindow.show();
}

// Function to Open the Customisable Distribution Window
function openCustomisableDistributionWindow() {
    var dialog = new Window("dialog");
dialog.text = "Scene Split Adjustment";
dialog.alignChildren = ["center", "top"];
dialog.spacing = 10;
dialog.margins = 23;

// GROUP1: Buttons for Adding/Removing Sliders
var group1 = dialog.add("group", undefined, { name: "group1" });
group1.orientation = "row";
group1.alignChildren = ["left", "center"];
group1.spacing = 10;
group1.margins = 0;

var statictext1 = group1.add("statictext", undefined, undefined, { name: "statictext1" });
statictext1.text = "Select Number of Dividers";

var button1 = group1.add("button", undefined, undefined, { name: "button1" });
button1.text = "+";

// Container for Dynamic Sliders
var sliderContainer = dialog.add("panel", undefined, undefined, { name: "sliderContainer" });
sliderContainer.orientation = "column";
sliderContainer.alignChildren = ["left", "center"];
sliderContainer.spacing = 10;
sliderContainer.margins = 5;

// Array to Track Slider-TextInput Pairs
var sliderPairs = [];

// Function to Add a Slider and TextInput Pair
function addSlider() {
    // Create a group to hold the slider and text input
    var sliderGroup = sliderContainer.add("group", undefined, { name: "sliderGroup" });
    sliderGroup.orientation = "row";
    sliderGroup.alignChildren = ["center", "center"];
    sliderGroup.spacing = 10;

    // Add the slider (X Coordinate)
    var newSlider = sliderGroup.add("slider", undefined, undefined, undefined, undefined, { name: "slider" });
    newSlider.minvalue = 0;
    newSlider.maxvalue = 1920; // Maximum value for the slider (X Coordinate)
    newSlider.value = 0; // Default value
    newSlider.preferredSize.width = 400;

    // Add the text input (Angle)
    var newTextInput = sliderGroup.add("edittext", undefined, undefined, { name: "textInput" });
    newTextInput.text = "0"; // Initialize with default angle
    newTextInput.preferredSize.width = 50;

    // Add the pair to the array
    sliderPairs.push({ slider: newSlider, textInput: newTextInput });

    // Refresh the UI
    dialog.layout.layout(true);
}

// Event Listeners for Button
button1.onClick = function () {
    addSlider();
};

// Confirm Button
var confirmButton = dialog.add("button", undefined, undefined, { name: "confirmButton" });
confirmButton.text = "Confirm";
confirmButton.alignment = ["center", "bottom"]; // Align to the bottom of the dialog

// Confirm Button Action
confirmButton.onClick = function () {
    onConfirm();
};

// Function to Handle Confirm Action
function onConfirm() {
    // Process slider and text input values
    var lines = [];
    for (var i = 0; i < sliderPairs.length; i++) {
        var pair = sliderPairs[i];
        var xCoordinate = Math.round(pair.slider.value); // Get the slider value (X Coordinate)
        var angle = parseInt(pair.textInput.text, 10); // Parse the text input value (Angle)

        // Validate the angle (clamp to [0, 180])
        if (isNaN(angle)) {
            angle = 0; // Default to 0 if invalid
        }
        angle = Math.max(-90, Math.min(90, angle)); // Clamp to [0, 180]

        lines.push([
            i + 1, // Divider number
            xCoordinate, // X coordinate
            angle // Store both values as an object
        ]);
    }

    // Log the lines (or pass them to your main code)
    var resultMessage = "";
    for (var j = 0; j < lines.length; j++) {
        resultMessage += "Divider " + lines[j][0] + ": X=" + lines[j][1] + ", Angle=" + lines[j][2] + "\n";
    }
    alert("Divider Settings:\n" + resultMessage);

    // Create a new composition and split it diagonally
    app.beginUndoGroup("split_undo");
    var comp = createComp();
    splitCompDiagonally(comp, lines);
    app.endUndoGroup();
    // Close the dialog after confirming
    dialog.close();
    mainWindow.close()
}

// Show the Dialog
dialog.show();
}