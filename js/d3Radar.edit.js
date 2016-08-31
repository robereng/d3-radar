/**
 * d3Radar.edit.js v1.0.0
 * Rob Reng - deals with the edit post, data validation, and ajax. Refreshes d3 graph on success.
 * Copyright 2013
 */
d3Radar.editForm = (function() {

  function init() { 

    $(function() {  
      $('.error').hide();  
      $("#edit_form .button").click(function() {  
        // validate and process form here  
          
        $('.error').hide();  
        var name = $("input#name").val();  
        if (name == "") {  
          $("label#name_error").show();  
          $("input#name").focus();  
          return false;  
        }  
        
        var type = $("select#type").val(); 
        var stage = $("select#stage").val();  

        var description = $("input#description").val();  
        if (description == "") {  
          $("label#description_error").show();  
          $("input#description").focus();  
          return false;  
        }

        var id = $("span#id").text();
        var rev = $("span#rev").text(); 
        var date_added = $("span#date_added").text();  

        var dt = new Date();
        var dataString = 'id='+id + '&rev='+rev + '&name='+ name + '&type=' + type + '&stage=' + stage + '&description=' + description + '&date_added=' + date_added;
        $.ajax({  
          type: "POST",  
          url: "/editDocument",  
          data: dataString,  
          success: function() { 
            ModalEffects.closeModal($("#modal-2"));
            d3.select("svg")
              .remove();
            d3Radar.refreshCanvas();
          }  
        });  
        
        return false;   
          
      });
    });
  }

  return {init: init};

})();