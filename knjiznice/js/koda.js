
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";
var ehr_id;


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

$(document).ready(function(){
    $('#preberiObstojeciEHR').change(function() {
		$("#preberiSporocilo").html("");
		$("#preberiEHRid").val($(this).val());
	});
});

var d; var slike; var opisi; 

function poisciRecepte(){
    
    var spletnaStran = "http://okusno.je/recepti/";
    
    var filterDiv = document.getElementById("filter");
    var filter = "";
    var dishType = document.getElementById("filter-levo").getElementsByTagName("input");
    for(var i = 0; i < dishType.length; i++){
        if(dishType[i].checked) {
            filter += "dish_type:" + dishType[i].getAttribute("value") + "/";
            break;
        }
    }
    var kategorije1 = document.getElementById("filter-sredina").getElementsByTagName("input");
    var kategorije2 = document.getElementById("filter-desno").getElementsByTagName("input");
    var sections = "";
    var appr = "";
    for(var i = 0; i < kategorije1.length; i++){
        if(kategorije1[i].checked){
            var value = kategorije1[i].value;
            if(value > 1000) {
                if(sections == ""){
                    sections += value;
                } else {
                    sections += "," + value;
                }
            } else {
                if(appr == ""){
                    appr += value;
                } else {
                    appr += "," + value;
                }
            }
        }
    }
    if(sections != ""){
        filter += "section:" + sections + "/";
    }
    if(appr != ""){
        filter += "appropriate_for:" + appr + "/";
    }
    
    var ukaz = "select * from html where url='" + spletnaStran + filter + "'";
    var url = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(ukaz) + "&format=xml";
    
    var div = document.getElementById("recepti");
    div.innerHTML = "<img src=\"loading.gif\" id=\"loading\">";
    
    $.ajax({
        type: "GET",
        url: url,
        success: function(response) {
            d = response;
            var recepti = [];
            slike = response.getElementsByClassName("search-results-content")[0].getElementsByTagName("img");
            url = response.getElementsByClassName("recipe-item");
            opisi = response.getElementsByClassName("recipe-thumb-content");
            console.log(slike.length + " " + opisi.length);
            for(var i = 0; i < opisi.length; i++) {
                var x = $.trim(opisi[i].innerHTML);
                var _ime = x.substring(4, x.search("</h3>"));
                var _opis = x.substring(_ime.length + 9);
                var _slika = slike[i].getAttribute("src");
                var _link = "http://www.okusno.je" + url[i].getAttribute("href");
                _slika = _slika.substring(0, _slika.search("\\?"));
                recepti[i] = {
                    ime : _ime,
                    slika : _slika,
                    opis : _opis,
                    link : _link
                };
            }
            izpisiRecepte(recepti);
        }
    });
    
    
}


function izpisiRecepte(recepti){
    document.getElementById("recepti").innerHTML="";
    for(var i = 0; i < recepti.length; i++){
        $("#recepti").append(
            "<div class=\"recipe-item\"> \
                <div class=\"slika\"> \
                    <img src=\"" + recepti[i].slika + "\" alt=\"" + recepti[i].ime + "\" /> \
                </div> \
                <h3><a href=\"" + recepti[i].link + "\">" + recepti[i].ime + "</a></h3> \
                <span>" + recepti[i].opis + "</span> \
            </div>"
        );
        console.log(recepti[i].ime + " " + recepti[i].slika + " " + recepti[i].opis);
    }
}


function preberiEHRodBolnika() {
	var sessionId = getSessionId();

	var ehrId = $("#preberiEHRid").val();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#preberiSporocilo").html("<span class='obvestilo label label-warning " +
      "fade-in'>Prosim vnesite zahtevan podatek!");
	} else {
		$.ajax({
			url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
			type: 'GET',
			headers: {"Ehr-Session": sessionId},
	    	success: function (data) {
				var party = data.party;
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-success fade-in'>Bolnik '" + party.firstNames + " " +
          party.lastNames + "', ki se je rodil '" + party.dateOfBirth +
          "'.</span>");
                ehr_id = ehrId;
			},
			error: function(err) {
				$("#preberiSporocilo").html("<span class='obvestilo label " +
          "label-danger fade-in'>Napaka '" +
          JSON.parse(err.responseText).userMessage + "'!");
			}
		});
	}
}

function generiraj(){
    generirajPodatke(1);
    generirajPodatke(2);
    generirajPodatke(3);
}
function generirajPodatke(stPacienta) {
	var sessionId = getSessionId();
	var sporocilo;

	var ime, priimek, datumRojstva, visina, teza;
	switch(stPacienta){
	    case 1: 
	        ime = "Kurt";
	        priimek = "Cobain";
	        datumRojstva = "1967-02-20T08:00";
	        visina = 1.7;
	        teza = 60;
	        break;
	    case 2:
	        ime = "Meat";
	        priimek = "Loaf";
	        datumRojstva = "1947-09-27T08:00";
	        visina = 1.8;
	        teza = 120;
	        break;
	    case 3:
	        ime = "Israel";
	        priimek = "Kamakawiwoʻole";
	        datumRojstva = "1959-05-20T08:00";
	        visina = 1.9;
	        teza = 340;
	}
	console.log(ime);
	$.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
	    url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	        var ehrId = data.ehrId;
	        var partyData = {
	            firstNames: ime,
	            lastNames: priimek,
	            dateOfBirth: datumRojstva,
	            partyAdditionalInfo: [{key: "ehrId", value: ehrId}]
	        };
	        $.ajax({
	            url: baseUrl + "/demographics/party",
	            type: 'POST',
	            contentType: 'application/json',
	            data: JSON.stringify(partyData),
	            success: function (party) {
	                if (party.action == 'CREATE') {
	                    for(var i = 0; i < 5; i++){
	                        var telesnaTeza = teza + Math.round((Math.random() * 100 - 50) / 10);
	                        dodajMeritveVitalnihZnakov(ehrId, visina, telesnaTeza);
	                    }
	                    document.getElementById("sporocilo").innerHTML += "EhrId za " + ime + " " + priimek + " uspešno kreiran: " + ehrId + "<br />";
	                    $("#preberiObstojeciEHR").append("<option value=\"" + ehrId + "\">" + ime + " " + priimek + "</option>");
	                }
	            },
	            error: function(err) {
	               document.getElementById("sporocilo").innerHTML += "Napaka pri kreiranju EhrId <br />";
	               console.log(err);
	            }
	        });
	    }
	});
	
}
function dodajMeritveVitalnihZnakov(ehrId, telesnaVisina, telesnaTeza) {
	var sessionId = getSessionId();

	if (!ehrId || ehrId.trim().length == 0) {
		$("#dodajMeritveVitalnihZnakovSporocilo").html("<span class='obvestilo " +
      "label label-warning fade-in'>Prosim vnesite zahtevane podatke!</span>");
	} else {
		$.ajaxSetup({
		    headers: {"Ehr-Session": sessionId}
		});
		var podatki = {
			// Struktura predloge je na voljo na naslednjem spletnem naslovu:
      // https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
		    "ctx/language": "en",
		    "ctx/territory": "SI",
		    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
		    "vital_signs/body_weight/any_event/body_weight": telesnaTeza
		};
		var parametriZahteve = {
		    ehrId: ehrId,
		    templateId: 'Vital Signs',
		    format: 'FLAT',
		    committer: "Random Guy"
		};
		$.ajax({
		    url: baseUrl + "/composition?" + $.param(parametriZahteve),
		    type: 'POST',
		    contentType: 'application/json',
		    data: JSON.stringify(podatki),
		    success: function(){
		        return "";
		    },
		    error: function(err){
		        return "Napaka pri kreiranju EhrId <br />";
		    }
		});
	}
}





