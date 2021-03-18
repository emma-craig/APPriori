// The comparison matrix
function ComparisonMatrix(items) {
  var self = this;
  self.items = items;
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
function quickSort(x, matrix) {
  var array = x;
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

  var lines;

  var count = 0;

  ///DISCARD DIV ///
  $("#discard-button").click(function () {
    $("#input").hide();
    $("#to-be-discarded").show();
    $("#discard-page").show();
    $("#ask").hide();
    $("#results").hide();

    var lines = [];
    var items = [];
    var count = 0;

    //show each item in list
    $.each($("#input-items").val().split(/\n/), function (i, line) {
      if (line) {
        lines.push(line);
      } else if (line == /\n/ || line == "") {
        null;
        // lines.push("");
      }
    });

    lines = [...new Set(lines)];
    localStorage.setItem("lines", [...lines]);

    // var Uniq_lines = lines.filter(function (elem, index, self) {
    //   return index === self.indexOf(elem);
    // });

    $("#to-be-discarded").html(lines[count]);

    $("#keep-in-list-button").show();
    $("#discard-from-list-button").show();

    function nextQuestion() {
      count++;

      $("#to-be-discarded").html(lines[count]);
      items = lines.filter((x) => x !== "*");
   
console.log("items", items)
      
      
      



      localStorage.setItem("items", [...items]);
      // $("#trimResults").text(items).show();

      items.length === 2 ? $("#twoLeft").show() : null;

      if (count === lines.length || items.length === 2) {
     
  // $("#keep-in-list-button").prop('disabled', true); 
  // $("#discard-from-list-button").prop('disabled', true); 
  $("#discard-header").hide();
  $("#to-be-discarded").hide();
  $("#keep-in-list-button").hide(); 
  $("#discard-from-list-button").hide(); 
        $("#submit").show();
      }
    }

    $("#discard-from-list-button").click(() => {
      var newlines = lines.splice(count, 1, "*");

      items.push(newlines[0]);

      nextQuestion();
    });

    $("#keep-in-list-button").click(() => {
      nextQuestion();
    });
  });

  ///ASK DIV///
  $("#submit").click(function (e) {
    e.preventDefault();

    var items = localStorage.getItem("items").split(",");
    $("results").hide();
    matrix = new ComparisonMatrix(items);
    tryQuickSort();
  });

  function tryQuickSort() {
    items = localStorage.getItem("items").split(",");
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
    $("results").hide();
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

  ///RESULTS DIV///
  function showResults() {
    $("#input").hide();
    $("#ask").hide();
    $("#results").show();
    $("#results_list").html();

    $("#explicit_count").text(matrix.explicitCount);
    $("#explicit_count").show();
    _(items).each(function (item) {
      $("<li />").appendTo($("#results_list")).text(item);
    });
  }

  $("#start_over_clean").click(function (e) {
    window.location.replace("list.html").reload();
    lines = [];
    items = [];
  });

  var arrLang = {
    en: {
      "create-a-list": "Create a list",
      "input-header": "Make a list of items to be sorted",
      "trim-button": "Trim Your List",
      "discard-header": "Discard this one?",
      "discard-button": "Discard?",
      "keep-in-list-button": "Keep?",
      "2left": "You only have two items left in the list",
      "submit-to-sort": "Sort",
      "ask-header": "Which do you prefer?",
      "results-header": "Your prioritised list",
      "explicit-count": "Total number of comparisons needed: ",
      "start-over-fresh-button": "start over with fresh list",
      "start-over-same-button": "start over with same list",
      "download-list": "Download List",
    },

    es: {
      "create-a-list": "Haz una lista",

      "input-header": "Haz una lista de las cosas que quieres ordenar",
      "trim-button": "Recorta La Lista",
      "discard-header": "Quieres quitar esto?",
      "discard-button": "Quita?",
      "keep-in-list-button": "Guarda?",
      "2left": "Solo quedan 2 opciones",
      "submit-to-sort": "Sortear",
      "ask-header": "Cual prefieres?",
      "results-header": "Tu lista prioritzada",
      "explicit-count": "Numero de comparaciones: ",
      "start-over-fresh-button": "reempezar de nuevo (crear lista nueva)",
      "start-over-same-button": "reempezar de nuevo (la misma lista)",
      "download-list": "Descargar Lista",
    },

    cat: {
      "create-a-list": "Fes una llista",

      "input-header": "Fes una llista de les coses que vols sortear",
      "trim-button": "Recorte la llista",
      "discard-header": "Vols aquest?",
      "discard-button": "Quita aquest?",
      "keep-in-list-button": "Guarda?",
      "2left": "Només quedan dues opciones",
      "submit-to-sort": "Sortear",
      "ask-header": "Quina prefereixis?",
      "results-header": "La teva llista prioritzada",
      "explicit-count": "Nombre de comparacions requerits: ",
      "start-over-fresh-button": "comença de nou (crea llista nova)",
      "start-over-same-button": "comença de nou (la mateixa llista)",
      "download-list": "Descargar Llista",
    },
  };

$(".translate").click(function () {
  var lang = $(this).attr("id");
  console.log("language changed");
  console.log("language:", lang);

  $(".lang").each(function (index, element) {
    $(this).text(arrLang[lang][$(this).attr("key")]);
  });
});

});