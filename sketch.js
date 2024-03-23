// import { Color, Vector } from "../../../.vscode/extensions/samplavigne.p5-vscode-1.2.15/p5types/index";

//import { Vector } from "../../../.vscode/extensions/samplavigne.p5-vscode-1.2.15/p5types/index";

// import { Geometry } from "../../../.vscode/extensions/samplavigne.p5-vscode-1.2.15/p5types/index";



/**
 * @type {float}
 */
let radius;

/**
 * @type {Color}
 */
let sphere_color;

/**
 * @type {Color}
 */
let point_color



/**
 * @type {Array.<Vector>}
 */
let points_list = []

/**
 * @type {Array.<Vector>}
 */
let velocities_list = []

// /**
//  * @type {Array.<Vector>}
//  */
// let acceleration_list = []

/**
 * @type {Array.<int>}
 */
let charge_list = []

let number_of_points = 16;
// IDK
let force_constant;

let delta_time;

let num_points_update, num_of_points_text, calc_per_frame, calc_per_frame_text;

function setup() {
    createCanvas(800, 600, WEBGL);
    camera(250, 0, 50*sqrt(3), 0, 0, 0, 0, 1, 0);

    let scene_div = createDiv()
    radius = createSlider(10, 255, 100, 0.1);
    radius.size(400)
    num_points_update = createSlider(1, 50, 5, 1);
    num_points_update.size(300);
    scene_div.child(createDiv('Radius of sphere: '))
    scene_div.child(radius);
    num_of_points_text = createDiv('Number of points: ')
    scene_div.child(num_of_points_text)
    scene_div.child(num_points_update);

    let physics_div = createDiv()
    delta_time = createSlider(0, 10, 5, 0.1);
    delta_time.size(400)
    force_constant = createSlider(0, 200, 50, 0.1);
    force_constant.size(400)
    physics_div.child(createDiv('Delta Time: '))
    physics_div.child(delta_time)
    physics_div.child(createDiv('Force Constant: '))
    physics_div.child(force_constant)

    calc_per_frame = createSlider(0, 100, 1)
    calc_per_frame.size(400);
    calc_per_frame_text = createDiv('Iterations per frame: ')
    physics_div.child(calc_per_frame_text)
    physics_div.child(calc_per_frame)

    sphere_color = color(255,255,255,50);
    point_color = color(0,0,0,255);
    font = loadFont('MinecraftRegular-Bmg3.otf');
    textSize(8);
    textAlign(CENTER, CENTER);
    create_points();
    
}

function draw() {
    let new_num_points = num_points_update.value()
    if (new_num_points != number_of_points){
        update_number_of_points(new_num_points)
    }
    num_of_points_text.html(`Number of points: ${new_num_points}`)
    calc_per_frame_text.html(`Iterations per frame: ${calc_per_frame.value()}`)

    

    background(180,180,180)
    textFont(font)
    orbitControl(1,1,1);
    for (let i = 0; i < calc_per_frame.value(); i++) {
        update_points()
    }
    render_points()
    push()
    strokeWeight(0.2)
    fill(sphere_color)
    sphere(radius.value(),24,24);
    pop()
}

function create_points() {
    for (let i = 0; i < number_of_points; i++) {
        points_list.push(createVector(random(-1,1)*10,random(-1,1)*10,random(-1,1)*10))
        velocities_list.push(createVector(0.0,0.0,0.0))
        charge_list.push(1)
    }
}


function update_number_of_points(new_count) {
    if (new_count > number_of_points){
        for (let i = 0; i < (new_count - number_of_points); i++) {
            points_list.push(createVector(random(-1,1)*10,random(-1,1)*10,random(-1,1)*10))
            velocities_list.push(createVector(0.0,0.0,0.0))
            charge_list.push(1)
        }
    } else {
        for (let i = 0; i < number_of_points-new_count; i++) {
            points_list.pop()
            velocities_list.pop()
            charge_list.pop()
        }
    }
    number_of_points = new_count;
}



function update_points() {
    for (let i = 0; i < number_of_points; i++) {
        //print(points_list.length)
        let given_point = points_list[i]
        let resulting_force = createVector((0.0,0.0,0.0))

        // Sum up all the forces
        for (let j = 0; j < number_of_points; j++) {
            if (i == j){
                continue
            }
            // Get the force between it and the other point
            resulting_force.add(get_force_vector(given_point, points_list[j], charge_list[i], charge_list[j]))
        }
        // V = u + at , let t = 0
        velocities_list[i].add(p5.Vector.mult(resulting_force,delta_time.value()))
    }
    constrain_points()
    for (let i = 0; i < number_of_points; i++) {
        points_list[i].add(p5.Vector.mult(velocities_list[i], delta_time.value()))
    }
    constrain_points()
}

/**
 * 
 * @param {Vector} vec1 
 * @param {Vector} vec2 
 * @param {int} charge1 
 * @param {int} charge2 
 * @returns {Vector}
 */
function get_force_vector(vec1, vec2, charge1, charge2) {

    let diff_vec = p5.Vector.sub(vec1, vec2)
    let mag_sq = diff_vec.magSq()

    let magnitude = force_constant.value() * charge1 * charge2 / mag_sq
    if (isNaN(magnitude)){
        console.log(vec1, vec2)
    }
    // F = k q1q2/r^2, assuming q1 and q2 to be same
    diff_vec = p5.Vector.mult(p5.Vector.normalize(diff_vec), magnitude)
    return diff_vec
}




function render_points() {
    for (let i = 0; i < number_of_points; i++) {
        let element = points_list[i];
        line(0,0,0,element.x, element.y, element.z)


        // push()
        // // Joining lines
        // for (let j = 0; j < number_of_points; j++) {
        //     if (i==j){
        //         continue
        //     }
        //     strokeWeight(0.5)
        //     line(element.x, element.y, element.z, points_list[j].x, points_list[j].y, points_list[j].z)
            
        // }
        // pop()


        push()
        translate(element)
        let magn = element.mag()
        // Rotate text in a way that its projected outwards: need angles

        text(`Point ${i}`, 0, 10)

        
        fill(point_color)
        sphere(2)
        pop()
        
    }



    // noFill()
    // beginShape(LINES)
    // for (let i = 0; i < number_of_points; i++) {
    //     let element = points_list[i];
    //     vertex(element.x, element.y, element.z)
    // }
    // endShape()
}


function constrain_points() {
    for (let i = 0; i<number_of_points;i++){
        let i_point = points_list[i]
        // Better way: Instead of forcing the position, what if as we get to radius, the magnitude of velocity vector in the direction of outwards becomes zero


        if (i_point.magSq() > (radius.value()**2)){
            points_list[i].setMag(radius.value()*0.99)


            // WHat if we preserve only the perpendicular velocities?
            // https://math.stackexchange.com/a/3156754

            // Projection of vel on position = vel•pos/(vel^2) * vel
            let proj_mag = p5.Vector.dot(i_point, velocities_list[i])/(i_point.magSq())
            //print(proj_mag)
            let projection_vec = p5.Vector.mult(i_point, proj_mag)
            let perp_velocity = p5.Vector.sub(velocities_list[i], projection_vec)
            velocities_list[i] = p5.Vector.mult(perp_velocity, 1)
        }
    }
}
