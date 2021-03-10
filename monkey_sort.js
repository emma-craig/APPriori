// The comparison matrix
function ComparisonMatrix(items) {
  var self = this;
  self.items = items;
  console.log("items-----", items);
  self.matrix = {};
  self.explicitCount = 0;

  _.each(self.items, function (item) {
    self.matrix[item] = {};
    self.matrix[item][item] = "=";
  });
  self.opposite = function (value) {
    return value == "=" ? "=" : value == "<" ? ">" : "<";
  };

  self.get = function (a, b) {
    if (self.matrix[a][b]) {
      return self.matrix[a][b];
    } else {
      throw { items: [a, b] };
    }
  };
  self.set = function (a, b, value) {
    self.explicitCount++;
    self.updateSingle(a, b, value);
    self.updateSingle(b, a, self.opposite(value));
  };
  self.updateSingle = function (a, b, value) {
    self.matrix[a][b] = value;
    self.updateTransitive(a, b);
  };

  self.updateTransitive = function (a, b) {
    if (self.matrix[a][b] == "=") {
      // ((Cij = “=”) ⋀ (Cjk is known)) ⇒ Cik = Cjk
      _.each(_.keys(self.matrix[b]), function (c) {
        if (!self.matrix[a][c]) {
          self.updateSingle(a, c, self.matrix[b][c]);
        }
      });
    } else {
      // (Cij ∈ { “<”, “>”}) ⋀ (Cjk ∈ {Cij, “=”}) ⇒ Cik = Cij
      _.each(_.keys(self.matrix[b]), function (c) {
        if (
          !self.matrix[a][c] &&
          (self.matrix[a][b] == self.matrix[b][c] || self.matrix[b][c] == "=")
        ) {
          self.updateSingle(a, c, self.matrix[a][b]);
        }
      });
    }
  };
}

// This is the very simplest form of quick sort.
// Unknown comparison interrupt is done inside the matrix.get() method
function quickSort(items, matrix) {
  var array = items;
  function qsortPart(low, high) {
    var i = low;
    var j = high;
    var x = array[Math.floor((low + high) / 2)];
    do {
      while (matrix.get(array[i], x) == ">") i++;
      while (matrix.get(array[j], x) == "<") j--;
      if (i <= j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        i++;
        j--;
      }
    } while (i <= j);
    if (low < j) {
      qsortPart(low, j);
    }
    if (i < high) {
      qsortPart(i, high);
    }
  }
  qsortPart(0, array.length - 1);
}

$(function () {
  var matrix;
  // var items;
  var lines = [];
  var items = [];

  $("#discard-button").click(function () {
    $("#input").hide();
    $("#discard-page").show();
    $("#ask").hide();
    var lines = [];
    //show each item in list
    $.each($("#items").val().split(/\n/), function (i, line) {
      if (line) {
        lines.push(line);
      } else {
        lines.push("");
      }
    });
    console.log("items from input:", lines);

    // localStorage.setItem("storedLines", JSON.stringify($("#items").val()));
    localStorage.setItem("lines", lines);
    console.log("lines length=", lines.length);
    

    $("#to-be-discarded").html(lines[0]);
  });
 
  let counter = 0;
  function nextQuestion() {
    lines = localStorage.getItem("lines").split(",");
    console.log("LINES--", localStorage.getItem("lines"));
    console.log("LINES from variable via localstorage--", lines);
    // let linesArray = lines.split(",")
    console.log("lines:", lines);
    console.log("counter:", counter)
    counter++;
    $("#to-be-discarded").html(lines[counter]);
    if (counter === lines.length) {
      //7 elements in the array
      $("#keep-in-list-button").hide();
      $("#discard-from-list-button").hide();
      $("#show-trimmed").text(items);
      $("#submit").show();
    }
  }

  // $("#to-be-discarded").html(lines[0]);

  $("#discard-from-list-button").click(() => {
    nextQuestion();
    // lines.splice(0, 1);
    console.log("discarded:", lines[counter - 1]);
    // $("#to-be-discarded").html(lines[0]);
  });

  $("#keep-in-list-button").click(() => {
    nextQuestion();
    // console.log("lines", lines);
    // const added = lines.splice(0,1).slice(0,1)
    // items.push(...added);
    // $("#to-be-discarded").html(lines[1]);
    console.log("kept", lines[counter - 1]);
    items.push(lines[counter - 1]);
    console.log("items aftertrimming", items);
  });

  /////////////////////////////////////////////
  $("#submit").click(function (e) {
    e.preventDefault();
    // items = _(
    //   _(
    //     _($("#items").val().split("\n")).map(function (s) {
    //       return s.trim();
    //     })
    //   ).reject(function (s) {
    //     return s === "";
    //   })
    // ).uniq();
    console.log("items after submitting trim", items);
    matrix = new ComparisonMatrix(items);
    tryQuickSort();
  });

  function tryQuickSort() {
    try {
      quickSort(items, matrix);
      showResults();
    } catch (e) {
      askUser(e.items[0], e.items[1]);
    }
  }

  function askUser(a, b) {
    $("#input").hide();
    $("#discard-page").hide();
    $("#ask").show();
    $("#ask_a").text(a);
    $("#ask_b").text(b);
  }

  $(".ask_answer").click(function (e) {
    e.preventDefault();
    var a = $("#ask_a").text();
    var b = $("#ask_b").text();
    var result = $(this).data("result");
    matrix.set(a, b, result);
    tryQuickSort();
  });

  function showResults() {
    $("#input").hide();
    $("#ask").hide();
    $("#results").show();
    $("#results_list").html();

    $("#explicit_count").text(matrix.explicitCount);
    $("#explicit_count").show();
    _(items).each(function (item) {
     $("<li />").appendTo($("#results_list")).text(item);
      console.log("explicit count", matrix.explicitCount);
      console.log("results list", results_list);
    });
  }

  $("#start_over_clean").click(function (e) {
    // window.location.replace("list.html");
    $("#discard-page").hide();
    $("#results").hide();
    $("#input").show();
    //   lines=[];
    //   items=[];
    //   console.log("items at start over:", items);
    //   console.log("lines at start over:", lines)
  });

  $("#start_over_same_list").click(function (e) {
    // e.preventDefault(e);
    // let lines = JSON.parse(localStorage.getItem("lines"));
    //window.location.replace("list.html")

    let lines = localStorage.getItem("lines");
    console.log("lines from local storage", lines);
    // window.location.replace("list.html")
    //  lines = lines.join('/n').split()
    //  console.log("lines from local storage", lines)
    //   $("#results").hide();
    $("#input").show();
    //   lines=[];
    //   items=[];
    //   console.log("items at start over:", items);
    //   console.log("lines at start over:", lines)

    // $("#items").val(lines).show();
  });
});
