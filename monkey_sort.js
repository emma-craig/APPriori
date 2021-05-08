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
  //on load
  $("#error").hide();
  var arrLang = {
    en: {
      "menu-home": "Home",
      "menu-create": "Create a list",
      "menu-contact": "Contact",
      "create-a-list": "Create a list",
      "input-header": "Type a list of items to be sorted",
      "place-holder": "Enter each item on a new line",
      error: "Minimum number of items = 2",
      "trim-button": "Trim list before sorting",
      "sort-now-button": "Sort NOW",
      "discard-header": "Discard this one?",
      "discard-button": "Discard?",
      "keep-in-list-button": "Keep?",
      "2left": "You only have 2 items left",
      "submit-to-sort": "Sort",
      "ask-header": "Which do you choose?",
      "results-header": "Your prioritised list",
      "explicit-count": "Total number of comparisons needed: ",
      "start-over-fresh-button": "start over",
      "start-over-same-button": "start over with same list",
      "download-list": "Download List",
      info: "A cuorum project",
      contact: "info at cuorum dot org",
    },

    es: {
      "menu-home": "Inicio",
      "menu-create": "Crear una lista",
      "menu-contact": "Contacto",
      "create-a-list": "Crear una lista",

      "input-header": "Escribe una lista de cosas para ordenar",
      "place-holder": "Separar cada ítem con un salto de línea",
      error: "Número mínimo de ítems = 2",
      "trim-button": "Descartar ítems de la lista",
      "sort-now-button": "Ordenar YA",
      "discard-header": "Descartar o conserver este ítem?",
      "discard-button": "Descartar",
      "keep-in-list-button": "Conservar",
      "2left": "Solo quedan 2 opciones",
      "submit-to-sort": "Ordenar",
      "ask-header": "Cuál eliges?",
      "results-header": "Tu lista priorizada",
      "explicit-count": "Numero de comparaciones: ",
      "start-over-fresh-button": "Volver a empezar",
      "start-over-same-button": "reempezar de nuevo (la misma lista)",
      "download-list": "Descargar lista",
      info: "Un proyecto de cuorum",
      contact: "info arroba cuorum punto org",
    },

    cat: {
      "menu-home": "Inici",
      "menu-create": "Crear una llista",
      "menu-contact": "Contacte",
      "create-a-list": "Crear una llista",

      "input-header": "Escriu una llista de coses per ordenar",
      "place-holder": "Separar cada ítem amb un salt de línia.",
      error: "Número mínim d'ítems = 2",
      "trim-button": "Descartar ítems de la llista",
      "discard-header": "Descartar o conserver aquest item?",
      "discard-button": "Descartar",
      "sort-now-button": "Ordenar JA",
      "keep-in-list-button": "Conservar",
      "2left": "Només quedan dues opciones",
      "submit-to-sort": "Ordenar",
      "ask-header": "Quin esculls?",
      "results-header": "La teva llista prioritzada",
      "explicit-count": "Nombre de comparacions requerits: ",
      "start-over-fresh-button": "Tornar a començar",
      "start-over-same-button": "comença de nou (la mateixa llista)",
      "download-list": "Descarregar lista",
      info: "Un projecte de cuorum",
      contact: "info arroba cuorum punt org",
    },
  };
  var lang = localStorage.getItem("lang");
  // lang === null ? (lang = "en") : (lang = lang);
  switch (lang) {
    case "es":
      $("#es").addClass("current-lang");
      $("#en").removeClass("current-lang");
      $("#cat").removeClass("current-lang");
      break;
    case "en":
      $("#es").removeClass("current-lang");
      $("#en").addClass("current-lang");
      $("#cat").removeClass("current-lang");
      break;
    case "cat":
      $("#es").removeClass("current-lang");
      $("#en").removeClass("current-lang");
      $("#cat").addClass("current-lang");
      break;
    default:
      break;
  }

  console.log("language at load:", lang);

  $(".lang").each(function (index, element) {
    var lang = localStorage.getItem("lang");
    lang === null ? (lang = "en") : (lang = lang);
    console.log("lang in function", lang);
    console.log("value of this", this);
    console.log("value of index", index);
    console.log("value of element", element);

    if ($(element).is("textarea")) {
      $(element).attr("placeholder", arrLang[lang][$(element).attr("key")]);
    } else {
      $(element).text(arrLang[lang][$(element).attr("key")]);
    }
  });

  var matrix;

  var lines;

  var count = 0;
  //////STRAIGHT TO SORT //////

  $("#sort-now-button").click(function () {
    var lines = [];
    var items = [];
    var count = 0;
    //show each item in list
    $.each($("#input-items").val().split(/\n/), function (i, line) {
      if (line) {
        items.push(line);
      } else if (line == /\n/ || line == "") {
        null;
        // lines.push("");
      }
    });
    items = [...new Set(items)];
    if (items.length === 0) {
      $("#input").hide();
      $("#error").show();
      // $("#textarea").attr("placeholder", "You cannot submit an empty list");
      // $(this).text("You cannot submit an empty list");

      var delay = 2000;
      // var url = 'https://itsolutionstuff.com'
      setTimeout(function () {
        window.location.replace("list.html").reload();
      }, delay);
      // window.location.replace("list.html").reload();
    }
    // need error message
    else {
      $("#input").hide();
      $("#to-be-discarded").hide();
      $("#discard-page").hide();
      $("#ask").show();
      $("#results").hide();
      console.log("OK");
      localStorage.setItem("items", [...items]);
      console.log("items in sort now", items);
      $("results").hide();
      matrix = new ComparisonMatrix(items);
      tryQuickSort();

      localStorage.setItem("items", [...items]);
      console.log("items in sort now", items);
    }
  });

  ///DISCARD DIV ///
  $("#discard-button").click(function () {
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
    console.log(lines.length);

    $("#results").hide();

    if (lines.length === 2) {
      items = [...new Set(lines)];
      localStorage.setItem("items", [...items]);
      console.log("items length:", items.length);
      $("#input").hide();
      $("#to-be-discarded").hide();
      $("#discard-page").hide();
      $("#ask").show();
      $("results").hide();
      matrix = new ComparisonMatrix(items);
      tryQuickSort();

      localStorage.setItem("items", [...items]);
      console.log("items in sort now", items);
    } else if (lines.length === 1) {
      items = [...new Set(lines)];
      localStorage.setItem("items", [...items]);
      console.log("items length =1");
      $("#input").hide();
      $("#to-be-discarded").hide();
      $("#discard-page").hide();
      $("#ask").hide();
      $("results").hide();
      matrix = new ComparisonMatrix(items);
      tryQuickSort();

      // localStorage.setItem("items", [...items]);
      // console.log("items in sort now", items);
    } else if (lines.length === 0) {
      $("#input").hide();
      $("#error").show();
      // $("#textarea").attr("placeholder", "You cannot submit an empty list");
      // $(this).text("You cannot submit an empty list");

      var delay = 2000;
      // var url = 'https://itsolutionstuff.com'
      setTimeout(function () {
        window.location.replace("list.html").reload();
      }, delay);
      // window.location.replace("list.html").reload();
    } else {
      localStorage.setItem("lines", [...lines]);
      $("#input").hide();
      $("#to-be-discarded").show();
      $("#discard-page").show();
      $("#ask").hide();

      $("#to-be-discarded").html(lines[count]);

      $("#keep-in-list-button").show();
      $("#discard-from-list-button").show();

      function nextQuestion() {
        count++;

        $("#to-be-discarded").html(lines[count]);
        items = lines.filter((x) => x !== "*");

        console.log("items", items);

        localStorage.setItem("items", [...items]);

        items.length === 2 ? $("#twoLeft").show() : null;

        if (count === lines.length || items.length === 2) {
          $("#discard-header").hide();
          $("#to-be-discarded").hide();
          $("#keep-in-list-button").hide();
          $("#discard-from-list-button").hide();
          $("#submit").show();
        }
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

  ///ASK DIV (sorting)///
  $("#submit").click(function (e) {
    e.preventDefault();

    var items = localStorage.getItem("items").split(",");
    console.log(items);

    $("results").hide();
    matrix = new ComparisonMatrix(items);
    tryQuickSort();
  });

  function tryQuickSort() {
    items = localStorage.getItem("items").split(",");
    console.log(items);
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

  $(".translate").click(function () {
    var lang = $(this).attr("id");
    localStorage.setItem("lang", lang);

    switch (lang) {
      case "es":
        $("#es").addClass("current-lang");
        $("#en").removeClass("current-lang");
        $("#cat").removeClass("current-lang");
        break;
      case "en":
        $("#es").removeClass("current-lang");
        $("#en").addClass("current-lang");
        $("#cat").removeClass("current-lang");
        break;
      case "cat":
        $("#es").removeClass("current-lang");
        $("#en").removeClass("current-lang");
        $("#cat").addClass("current-lang");
        break;
      default:
        break;
    }
    console.log("language changed");
    console.log("language:", lang);

    $(".lang").each(function (index, element) {
      var lang = localStorage.getItem("lang");
      console.log("lang", lang);
      if ($(this).is("textarea")) {
        $(this).attr("placeholder", arrLang[lang][$(this).attr("key")]);
      } else {
        $(this).text(arrLang[lang][$(this).attr("key")]);
      }
    });
  });
});

// var set_lang = function (dictionary) {
//   $("[data-translate]").each(function(){
//      if($(this).is( "input" )){
//         $(this).attr('placeholder',dictionary[$(this).data("translate")] )
//      } else{
//          $(this).text(dictionary[$(this).data("translate")])
//      }
//   })
// };
