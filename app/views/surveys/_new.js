function gensurveylist()
{
    $.ajax({ url: "/surveys", 
        dataType: "json", 
        async: true, 
        success: function(data) {
            var out = [];
            $.each(data, function(index, array){
                if (! array.token.includes("disabled")){
                    out.push("<tr>");
                    out.push("<td><a href=/surveys/"+array.id+"/md5/"+array.token+">"+array.id+"</a><br>S"+array.poll_id+"</td>");
                    var temp="<div style='width:250px; float:left'><b>Description</b><br>"+array.description+"</div>";
                    temp+="<div style='width:200px; float:left'><b>Chargé d'affaire</b><br>"+array.by+"</div>";
                    temp+="<div style='width:200px; float:left'><b>Client</b><br>"+array.client_mel+"</div>";
                    temp+="<div style='width:200px; float:left'><b>Propriétaire</b><br>"+array.owner_mel+"("+array.user_id+")</div>";
                    temp+="<div style='width:150px; float:left'><b>Date</b><br>"+array.updated_at.split("T")[0]+"</div>";
                    out.push("<td>"+temp+"</td>");
                    out.push("<td><div style='margin-top: 50%; transform: translateY(-50%);'><button class='send btn-secondary' value="+array.id+"><i class='fa fa-envelope fa-2x' ></i></button></div></td>");
                    out.push("<td><button class='btn' id='deletesurvey"+array.id+"' value="+array.id+">supprimer</button></td>");
                    out.push("</tr>");
                }                    
            });
            //console.log(out.join(''));
            $("#surveylist").html(out);
            
        }
    });
}

function genanswerslinks()
{
    //console.log("triggering a list of answers");
    $.ajax({ url: "/freelist", 
        dataType: "json", 
        async: true, 
        success: function(data) {            
            var out = [];
            out.push("<tr><td>");
            var lib;
            var w;
            $.each(data.reverse(), function(index, array){
                if (array.case_number){
                    lib=array.case_number;
                    w=100;
                } else {
                    lib=array.id;
                    w=50;
                }
                out.push("<div style='width:"+w+"px; float:left'><button data-toggle='modal' class='btn btn-link' value='"+array.id+"'>"+lib+"</button></div>");                      
            });
            out.push("</td></tr>");
            $("#answers").html(out); 
        }
    });
}

function validate()
{
    var valid=true;
    
    //description validation
    var description = $("#s_description").val();
    if (description !=="") {
        $("#s_description").css("background-color","#eeffee");
    } else {
        $("#s_description").css("background-color","#ffeeee");
        valid = false;
    }
    
    //email verification
    var regmel = /^[^\W][a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)*\@[a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)*\.[a-zA-Z]{2,4}$/;
    var name = $("#s_client_mel").val();
    var by = $("#s_by").val();
    if (name.match(regmel)){
        $("#s_client_mel").css("background-color","#eeffee");
    } else {
        $("#s_client_mel").css("background-color","#ffeeee");
        valid = false;
    }
    if (by.match(regmel)){
        $("#s_by").css("background-color","#eeffee");
    } else {
        $("#s_by").css("background-color","#ffeeee");
        valid = false;
    }
    
    if (valid) {
        $("#create").show(); 
        //console.log("all inputs valid");
    } else {
        $("#create").hide();
    }
    
    return valid;
}

validate();
gensurveylist();
genanswerslinks();
//setInterval(gensurveylist,5000);

$("#process_options").on("change",".form-control",function(){
    validate();
});

//building select menu with poll names
$.ajax({
    type: "GET",
    url: "/getpolls",
    dataType: "json",
    async: true, 
    success: function(result) {
        var options="";
        $.each(result, function(index, array){
            options+="<option value="+array.id+">"+array.name+" (S"+array.id+")</option>";
        });
        //options+="<select>";
        $("#s_poll_id").html(options);
        //console.log(options);
    } 
});

//manage json output for the create method of the controller
$("#create").click(function(){
    var params = {};
    params["description"]=$("#s_description").val();
    params["client_mel"]=$("#s_client_mel").val();
    params["by"]=$("#s_by").val();
    params["poll_id"]=$("#s_poll_id").val();
    
    if (!validate()) {
        return false;
    }
    
    //console.log(params);
    
    $.ajax({
        type: "POST",
        url: "/surveys",
        data: params,
        async: true, 
        success: function(result) { 
            //console.log(result); 
            gensurveylist();
            $("#create").hide();
            $("#s_description").val("");
            $("#s_description").css("background-color","#ffeeee");
            $("#s_client_mel").val("");
            $("#s_client_mel").css("background-color","#ffeeee");
            $("#s_by").val("");
            $("#s_by").css("background-color","#ffeeee");
        } 
    });
  
});


//emails autocompletion
$("#s_by").on("input",function(e){
    var saisie = $(this).val();
    //console.log(saisie);
    $.ajax({
        type: "GET",
        url: "/users?melfrag="+saisie,
        dataType: "json",
        async: true,
        success: function(result) {
            var some=[];
            result.forEach(function(r){
                some.push(r["email"]);
            });
            $("#s_by").autocomplete({source: some});
            //console.log(result);
        }      
    });  
});

$("#s_client_mel").on("input",function(e){
    var saisie = $(this).val();
    //console.log(saisie);
    $.ajax({
        type: "GET",
        url: "/clients?melfrag="+saisie,
        dataType: "json",
        async: true,
        success: function(result) {
            var some=[];
            result.forEach(function(r){
                some.push(r["email"]);
            });
            $("#s_client_mel").autocomplete({source: some});
            //console.log(result);
        }     
    });
});

$("#surveylist").on("click",".send",function(){
    var id = $(this).val();
    //console.log("processing survey "+id);
    $.ajax({
        type: "GET",
        url: "/surveys/"+id+"?email=send",
        async: true,
        success: function(data) {
            alert(data);
        },
        error: function(data) {
            alert(data);
        }
    });
});

//implementing action for all .btn 'dynamic' element starting from his ancestor which has to be a static element
$("#surveylist").on("click",".btn",function(){
    var id = $(this).val();
    //console.log("triggering the deletion of survey "+id);
    $.ajax({
        type: "DELETE",
        url: "/surveys/"+id,
        dataType: "json",
        async: false,
        success: function(result) {
            //console.log(result.responseText);
            //gensurveylist();
        },
        error: function(result) {
            alert(result.responseText);
        }
    });
    gensurveylist();
});

$.ajax({ 
    url: "/getpolls?mynums=1",
    dataType: "json",
    async: true,
    success: function (data) {
        var answerstitle = "Les retours";
        data.forEach(function(poll){
            answerstitle+="&nbsp;<a href=/surveys?csv=1&poll_id="+poll+">[CSV_sondage"+poll+"_vos_retours]</a>";
            answerstitle+="&nbsp;<a href=/surveys?csv=1&poll_id="+poll+"&all=1>[CSV_sondage"+poll+"_tous]</a>";
        });
        $("#titleandcsv").html(answerstitle);
    }
});
 
$("#answers").on("click",".btn",function(){
    var id = $(this).val();
    //console.log(id);
    genfeedback(id,"AnswerModal");
});