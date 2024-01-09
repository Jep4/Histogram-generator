var grade = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"]
var grade_wMax = ["MAX", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"]
var default_grade = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 0];

var student_list = [];

function init() {

    document.getElementById("fileInput").addEventListener("change", handleFileSelect, false);
    document.getElementById("warning_big").style.display = "none";
    document.getElementById("warning_small").style.display = "none";
    document.getElementById("warning_csv").style.display = "block";
    document.getElementById("warning_csv").style.display = "none";

    grade_wMax.forEach(function (g) {
        var gradeInput = document.getElementById(g + "_val");
        if (gradeInput) {
            gradeInput.addEventListener("change", function (event) {
                var isValid = true;

                for (let i = 0; i < grade_wMax.length - 1; i++) {

                    var cur_val = parseFloat(document.getElementById(grade_wMax[i] + "_val").value);
                    var next_val = parseFloat(document.getElementById(grade_wMax[i + 1] + "_val").value);

                    if (cur_val > document.getElementById("MAX_val").value) {
                        isValid = false;
                        var error_index = i + 1;
                    }

                    if (cur_val < next_val || cur_val === undefined) {
                        isValid = false;
                        var error_index = i+1;
                        break;
                    }
                }

                if (!isValid) {
                    if (gradeInput.dataset.prevValue) {
                        gradeInput.value = gradeInput.dataset.prevValue;
                    }
                    else {
                        gradeInput.value = default_grade[error_index];
                    }
                    alert("Invalid input: the grade input of lower grade shouldn't be higher than the higher grade");
                    return;
                }

                if (isValid) {
                    gradeInput.dataset.prevValue = gradeInput.value;
                }

                if (window.student_list) {
                    for (var i = 0; i < student_list.length; i++) {
                        student_list[i].Grade = whatGrade(student_list[i].Percent);
                    }
                    bar_increase(student_list);
                }
            }, false);
        }
    });
}
function handleFileSelect(event) {
    const reader = new FileReader()
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0])
}

function handleFileLoad(event) {
    console.log(event);

    const csv = event.target.result;
    var line = csv.split('\n');
    var headers = line[0].split(",");

    if (headers[0] !== "Name" && headers[1] !== "Percent") {
        document.getElementById("warning_csv").style.display = "block";
        return;
    } else {
        document.getElementById("warning_csv").style.display = "none";
    }

    headers.push("Grade");

    //make csv to object
    for (var i = 1; i < line.length; i++) {
        var temp = {};

        if (line[i] === undefined || line[i].trim() === "") {
            continue;
        }
        var words = line[i].split(",");
        temp[headers[0].trim()] = words[0];
        temp[headers[1].trim()] = Number(words[1]);
        temp[headers[2].trim()] = whatGrade(temp[headers[1].trim()]);
        student_list.push(temp);

    }

    getStat(student_list);
    bar_increase(student_list);
    console.log(student_list);
}

function whatGrade(data) {
    if (data > Number(document.getElementById("MAX_val").value)) {
        document.getElementById("warning_big").style.display = "block";
    }

    if (data < Number(document.getElementById("F_val").value)) {
        document.getElementById("warning_small").style.display = "block";
    }

    for (var i = 0; i < grade.length; i++) {
        var grade_id = grade[i].concat("_val");
        var grade_cut = Number(document.getElementById(grade_id).value);
        if (data >= grade_cut) {
            return grade[i];
        }
    }
    return "F";
}

function getStat(data) {
    let highest = -Infinity;
    let hi_student = "";
    let lowest = Infinity;
    let low_student = "";
    let sum = 0;
    data.sort(function (a, b) {
        return b.Percent - a.Percent;
    })

    highest = data[0].Percent;
    hi_student = data[0].Name;

    lowest = data[data.length - 1].Percent;
    low_student = data[data.length - 1].Name;

    for (let i = 0; i < data.length; i++) {
        sum = sum + Number(data[i].Percent);
    }

    console.log(data);

    document.getElementById("highest_val").textContent = hi_student + " (" + highest + "%)";
    document.getElementById("lowest_val").textContent = low_student + " (" + lowest + "%)";
    document.getElementById("mean_val").textContent = sum / data.length;
    document.getElementById("median_val").textContent = data[Math.floor(data.length / 2)].Percent;
}

function bar_increase(data) {
    var grade_list = grade.map(grade => ({
        grade_name: grade,
        count: 0,
    }));

    for (let i = 0; i < data.length; i++) {
        var grades = whatGrade(data[i].Percent);
        var grade_obj = grade_list.find(g => g.grade_name === grades);
        if (grade_obj) {
            grade_obj.count++;
        }
    }

    for (let j = 0; j < grade_list.length; j++) {
        var target = grade_list[j].grade_name.concat("_bar");
        var bar = document.getElementById(target);
        var span_bar = bar.querySelector("span");
        let widths = 3 * grade_list[j].count;
        bar.style.width = String(widths).concat("vw");
        span_bar.innerHTML = grade_list[j].count;
    }


}