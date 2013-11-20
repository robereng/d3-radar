var createForm = (function() {

  function init() { 

    $(function() {  
      $('.error').hide();  
      $("#create_form .button").click(function() {  
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

        var dt = new Date();
        var dataString = 'name='+ name + '&type=' + type + '&stage=' + stage + '&description=' + description + '&date_added=' + dt.toISOString();
        $.ajax({  
          type: "POST",  
          url: "/createDocument",  
          data: dataString,  
          success: function() { 
            ModalEffects.closeModal($("#modal-1"));
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

