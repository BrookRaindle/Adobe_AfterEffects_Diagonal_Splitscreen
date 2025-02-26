function createComp(width, height, framerate){
    return app.project.items.addComp("split_template", width, height, 1, 15, framerate);
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

// DIALOG
// ======
// 
var mainWindow = new Window("dialog");
mainWindow.text = "Scene Split Adjustment";
mainWindow.alignChildren = ["center", "top"];
mainWindow.spacing = 10;
mainWindow.margins = 23;


var evenButton = mainWindow.add("button", undefined, "Even Distribution");
evenButton.preferredSize = [200, 30];
evenButton.alignment = ["center", "center"];


var customButton = mainWindow.add("button", undefined, "Customisable Distribution");
customButton.preferredSize = [200, 30];
customButton.alignment = ["center", "center"];


evenButton.onClick = function () {
    openEvenDistributionWindow();
};

customButton.onClick = function () {
    openCustomisableDistributionWindow();
    mainWindow.close();
};


mainWindow.show();

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

    var confirmButton = evenWindow.add("button", undefined, "Confirm");
    confirmButton.preferredSize = [100, 30];

    confirmButton.onClick = function () {
        var numSections = parseInt(sectionDropdown.selection.text, 10);
        var angle = parseInt(angleInput.text, 10);

        // clamp angle to [-180, 180]
        if (isNaN(angle)) {
            angle = 0; // Default to 0 if invalid
        }
        angle = Math.max(-180, Math.min(180, angle));

       
        alert("Even Distribution Settings:\nSections: " + numSections + "\nAngle: " + angle);

        
        app.beginUndoGroup("split_undo");
        var comp = createComp(1920, 1080, 30);
        splitCompEvenly(comp, numSections, angle);
        app.endUndoGroup();

        
        evenWindow.close();
        mainWindow.close();
    };

  
    evenWindow.show();
}


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
    newSlider.maxvalue = comp.width; 
    newSlider.value = 0;
    newSlider.preferredSize.width = 400;

    
    var newTextInput = sliderGroup.add("edittext", undefined, undefined, { name: "textInput" });
    newTextInput.text = "0"; 
    newTextInput.preferredSize.width = 50;

    sliderPairs.push({ slider: newSlider, textInput: newTextInput });

    dialog.layout.layout(true);
}

button1.onClick = function () {
    addSlider();
};

var confirmButton = dialog.add("button", undefined, undefined, { name: "confirmButton" });
confirmButton.text = "Confirm";
confirmButton.alignment = ["center", "bottom"]; 


confirmButton.onClick = function () {
    onConfirm();
};

function onConfirm() {
    var lines = [];
    for (var i = 0; i < sliderPairs.length; i++) {
        var pair = sliderPairs[i];
        var xCoordinate = Math.round(pair.slider.value); // Get the slider value (X Coordinate)
        var angle = parseInt(pair.textInput.text, 10); // Parse the text input value (Angle)

        //(clamp to [0, 180])
        if (isNaN(angle)) {
            angle = 0;
        }
        angle = Math.max(-90, Math.min(90, angle));
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