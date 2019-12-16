

$(document).ready(function(){
    $.ajax({
        url: 'http://localhost:3000/load_generations',
        type: 'POST',
        data: 'Test',
        cache: false,
        success: function (data) {
            //console.log(data)
            //console.log('meow')
            var stringContainer = $('#stringContainer');
            stringContainer.innerHTML = '';
            loadedStrings = '';
            for (var i = 0; i < data.length; i++) {
              if(i % 4 == 0){
                if( i == 0){
                  loadedStrings += '<div class="row">';
                }else{
                  loadedStrings += '</div><div class="row">';
                }
              }
              var myId = "Str" + data[i].string_id 
              loadedStrings += '<div class="col-sm-6 mb-2"><div class="card"><div class="card-body"><h5 class="card-title">Random Set ' + data[i].string_id +' </h5><p class="card-text" id = "Str' + data[i].string_id +'">' + data[i].rand_string + '</p><button class="btn btn-primary" data-clipboard-target="#' + myId + '">Copy String</button></div></div></div>';
              
            }
            stringContainer.html(loadedStrings);
          
        },
        error: function (data) {
            console.log("Strings failed to load");
            alert('Strings failed to load');
            /*
          $('#error-group').css('display', 'block');
          var errors = JSON.parse(data.responseText);
          var errorsContainer = $('#errors');
          errorsContainer.innerHTML = '';
          var errorsList = '';
    
          for (var i = 0; i < errors.length; i++) {
            errorsList += '<li>' + errors[i].msg + '</li>';
          }
          errorsContainer.html(errorsList); */
        }
      });
});